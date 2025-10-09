import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Surface } from './primitives'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useAuth } from '../contexts/AuthContext'
import { boardAPI, taskAPI, userAPI } from '../api/client'
import websocketService from '../services/websocket'
import { Board as BoardType, Task, CreateBoardRequest, CreateTaskRequest } from '../types'
import ColumnComponent from './Column'
// Workload view moved to dedicated route/page
import CreateBoardModal from './CreateBoardModal'
import EditTaskModal from './EditTaskModal'
import CreateTaskModal from './CreateTaskModal'
import Header from './Header'
import CommentsSection from './CommentsSection'
import TagFilter from './TagFilter'
import { Tag } from '../types'
import BoardSettingsDialog from './BoardSettingsDialog'
import UserManagementModal from './admin/UserManagementModal'

const BoardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.bg};
  padding: 24px;
`

const BoardGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  @media (max-width: 1279px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 1023px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 767px)  { grid-template-columns: 1fr; }
`

const BoardHeader = styled(Surface)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`

const BoardTitle = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  font-weight: 700;
`

// Removed internal tabs in favor of header segmented nav

// removed old button styles; using Header actions

// danger actions are within settings dialog now

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2rem;
  color: #666;
`

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  font-size: 1.2rem;
  margin: 2rem 0;
`

const Board: React.FC = () => {
  console.log('Board component rendering')
  
  const { user, token } = useAuth()
  const [boards, setBoards] = useState<BoardType[]>([])
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<{[userId: number]: string}>({})
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [availableTags] = useState<Tag[]>([
    { id: 'bug', name: 'Bug', color: '#e74c3c' },
    { id: 'feature', name: 'Feature', color: '#27ae60' },
    { id: 'enhancement', name: 'Enhancement', color: '#f39c12' },
    { id: 'documentation', name: 'Documentation', color: '#3498db' },
    { id: 'urgent', name: 'Urgent', color: '#9b59b6' },
    { id: 'backend', name: 'Backend', color: '#e67e22' },
    { id: 'frontend', name: 'Frontend', color: '#1abc9c' },
    { id: 'design', name: 'Design', color: '#34495e' }
  ])
  const [users, setUsers] = useState<any[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  // search query lifted here and passed to header
  const [view] = useState<'board'>('board')
  const [query, setQuery] = useState('')

  // Track drag state to avoid re-renders that unmount draggables mid-drag
  const [isDragging, setIsDragging] = useState(false)

  // Keyboard shortcut: 'c' to open Create Board
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )
      if (isTyping) return
      if ((e.key === 'c' || e.key === 'C') && !showCreateModal) {
        setShowCreateModal(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCreateModal])

  useEffect(() => {
    console.log('Board useEffect running', { user: !!user, token: !!token })
    
    try {
      if (user && token) {
        console.log('Loading boards...')
        loadBoards()
        // Load users for assignee dropdowns
        userAPI.getUsers().then(setUsers).catch(() => {})
      } else {
        console.log('Board useEffect: Missing user or token', { user: !!user, token: !!token })
        setIsLoading(false)
      }

      // Set up WebSocket event listeners with stable references
      const handleWebSocketMessage = (eventType: string, data: any) => {
        console.log('WebSocket event:', eventType, data)

        switch (eventType) {
          case 'task_created':
            handleTaskCreated(data)
            break
          case 'task_updated':
            handleTaskUpdated(data)
            break
          case 'task_deleted':
            handleTaskDeleted(data)
            break
          case 'comment_created':
            handleCommentCreated(data)
            break
          case 'user_joined_board':
            handleUserJoinedBoard(data)
            break
          case 'user_left_board':
            handleUserLeftBoard(data)
            break
          case 'connected':
            console.log('Connected to WebSocket')
            break
          case 'disconnected':
            console.log('Disconnected from WebSocket')
            break
          default:
            console.log('Unhandled WebSocket event:', eventType, data)
        }
      }

      const onTaskCreated = (data: any) => handleWebSocketMessage('task_created', data)
      const onTaskUpdated = (data: any) => handleWebSocketMessage('task_updated', data)
      const onTaskDeleted = (data: any) => handleWebSocketMessage('task_deleted', data)
      const onCommentCreated = (data: any) => handleWebSocketMessage('comment_created', data)
      const onUserJoined = (data: any) => handleWebSocketMessage('user_joined_board', data)
      const onUserLeft = (data: any) => handleWebSocketMessage('user_left_board', data)
      const onConnected = (data: any) => handleWebSocketMessage('connected', data)
      const onDisconnected = (data: any) => handleWebSocketMessage('disconnected', data)

      // Register event listeners
      websocketService.on('task_created', onTaskCreated)
      websocketService.on('task_updated', onTaskUpdated)
      websocketService.on('task_deleted', onTaskDeleted)
      websocketService.on('comment_created', onCommentCreated)
      websocketService.on('user_joined_board', onUserJoined)
      websocketService.on('user_left_board', onUserLeft)
      websocketService.on('connected', onConnected)
      websocketService.on('disconnected', onDisconnected)

      return () => {
        // Cleanup WebSocket connection and listeners
        websocketService.off('task_created', onTaskCreated)
        websocketService.off('task_updated', onTaskUpdated)
        websocketService.off('task_deleted', onTaskDeleted)
        websocketService.off('comment_created', onCommentCreated)
        websocketService.off('user_joined_board', onUserJoined)
        websocketService.off('user_left_board', onUserLeft)
        websocketService.off('connected', onConnected)
        websocketService.off('disconnected', onDisconnected)
        websocketService.disconnect()
      }
    } catch (error) {
      console.error('Error in Board useEffect:', error)
      setError('Failed to initialize board')
      setIsLoading(false)
    }
  }, [user, token])
  // Persist search (optional) no-op


  // Connect to WebSocket when board is selected
  useEffect(() => {
    if (selectedBoard && token) {
      websocketService.connect(selectedBoard.id, token)
    } else {
      websocketService.disconnect()
    }
  }, [selectedBoard, token])

  const loadBoards = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('Loading boards with token:', !!token)
      const boardsData = await boardAPI.getBoards()
      console.log('Boards loaded:', boardsData)
      setBoards(boardsData)
      if (boardsData.length > 0) {
        setSelectedBoard(boardsData[0])
      }
    } catch (err: any) {
      console.error('Error loading boards:', err)
      console.error('Error details:', err.response?.status, err.response?.data)
      setError(err.response?.data?.detail || 'Failed to load boards')
    } finally {
      console.log('loadBoards finally block, setting isLoading to false')
      setIsLoading(false)
    }
  }

  const handleCreateBoard = async (boardData: CreateBoardRequest) => {
    try {
      const newBoard = await boardAPI.createBoard(boardData)
      setBoards([...boards, newBoard])
      setSelectedBoard(newBoard)
      setShowCreateModal(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create board')
    }
  }

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      if (!selectedBoard) {
        console.error('No selected board')
        return
      }
      
      console.log('Creating task:', taskData, 'for board:', selectedBoard.id)
      const newTask = await taskAPI.createTask(selectedBoard.id, taskData)
      console.log('Task created successfully:', newTask)
      
      // Update local state instead of reloading to prevent drag-and-drop context loss
      const updatedBoard = { ...selectedBoard }
      const targetColumn = updatedBoard.columns.find(col => col.id === taskData.column_id)
      if (targetColumn) {
        targetColumn.tasks.push(newTask)
        setSelectedBoard(updatedBoard)
      }
      
      setShowCreateTaskModal(false)
      setSelectedColumnId(null)
    } catch (err: any) {
      console.error('Failed to create task:', err)
      setError(err.response?.data?.detail || 'Failed to create task')
    }
  }

  const handleAddTaskClick = (columnId: number) => {
    console.log('Add task clicked for column:', columnId)
    setSelectedColumnId(columnId)
    setShowCreateTaskModal(true)
  }

  // WebSocket event handlers
  const handleTaskCreated = (data: any) => {
    if (!selectedBoard || selectedBoard.id !== data.board_id) return
    if (isDragging) return
    // Refresh the board data to get the new task (optimize later with local state update)
    loadBoards()
  }

  const handleTaskUpdated = (data: any) => {
    if (!selectedBoard || selectedBoard.id !== data.board_id) return
    if (isDragging) return
    // Refresh the board data to get the updated task (optimize later with local state update)
    loadBoards()
  }

  const handleTaskDeleted = (data: any) => {
    if (!selectedBoard || selectedBoard.id !== data.board_id) return

    // TODO: Remove task from local state instead of full reload
    console.log('Task deleted, should update local state')
  }

  const handleCommentCreated = (data: any) => {
    if (!selectedBoard || selectedBoard.id !== data.board_id) return

    // TODO: Update comment count in local state instead of full reload
    console.log('Comment created, should update local state')
  }

  const handleUserJoinedBoard = (data: any) => {
    setOnlineUsers(prev => ({
      ...prev,
      [data.user_id]: data.username
    }))
  }

  const handleUserLeftBoard = (data: any) => {
    setOnlineUsers(prev => {
      const updated = { ...prev }
      delete updated[data.user_id]
      return updated
    })
  }

  const handleTaskCommentsClick = (task: Task) => {
    setSelectedTask(task)
    setShowCommentsModal(true)
  }

  const handleTaskEditClick = (task: Task) => {
    setSelectedTask(task)
    setShowEditTaskModal(true)
  }

  const handleTaskDeleteClick = async (task: Task) => {
    if (!selectedBoard) return
    const confirmed = window.confirm(`Delete task "${task.title}"? This cannot be undone.`)
    if (!confirmed) return
    try {
      await taskAPI.deleteTask(task.id)
      // Update local state: remove from its column
      const updatedBoard = { ...selectedBoard }
      for (const col of updatedBoard.columns) {
        const idx = col.tasks.findIndex(t => t.id === task.id)
        if (idx !== -1) {
          col.tasks.splice(idx, 1)
          break
        }
      }
      setSelectedBoard(updatedBoard)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task')
    }
  }

  // Reassign tasks from one user to another (used by Workload delete flow)
  const reassignUser = async (fromUserId: number, toUserId: number | null) => {
    if (!selectedBoard) return
    const updatedBoard = {
      ...selectedBoard,
      columns: selectedBoard.columns.map(col => ({ ...col, tasks: [...col.tasks] }))
    }

    const tasksToUpdate: Task[] = []
    for (const col of updatedBoard.columns) {
      for (let i = 0; i < col.tasks.length; i++) {
        const t = col.tasks[i]
        if (t.assignee_id === fromUserId) {
          const newTask = { ...t, assignee_id: toUserId ?? undefined, assignee: undefined as any }
          col.tasks[i] = newTask
          tasksToUpdate.push(newTask)
        }
      }
    }
    setSelectedBoard(updatedBoard)

    // Persist updates in background
    try {
      await Promise.all(tasksToUpdate.map(t => taskAPI.updateTask(t.id, { assignee_id: toUserId ?? undefined } as any)))
    } catch (e) {
      // On error, refresh board from server
      await loadBoards()
    }
  }

  const handleTagFilterChange = (tagIds: string[]) => {
    setSelectedTagIds(tagIds)
  }

  // tag creation handled in Tag manager, no-op here

  const handleTaskMove = async (result: DropResult) => {
    console.log('🔄 Drag operation:', result)
    
    if (!result.destination || !selectedBoard) {
      console.log('❌ Drag cancelled: no destination or no selected board')
      setIsDragging(false)
      return
    }

    const { source, destination, draggableId } = result
    
    // Enhanced logging to track directional behavior
    const sourceColId = parseInt(source.droppableId)
    const destColId = parseInt(destination.droppableId)
    const direction = sourceColId < destColId ? 'RIGHT→' : (sourceColId > destColId ? '←LEFT' : 'SAME')
    
    console.log(`📍 Move details [${direction}]:`, { 
      from: `column ${source.droppableId} index ${source.index}`,
      to: `column ${destination.droppableId} index ${destination.index}`,
      taskId: draggableId,
      direction
    })

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('🔄 Same position, no move needed')
      setIsDragging(false)
      return
    }

    // Extract task ID from draggableId format "task-{id}"
    const taskId = parseInt(draggableId.replace('task-', ''))
    const sourceColumnId = parseInt(source.droppableId)
    const destColumnId = parseInt(destination.droppableId)
    
    // Save the old board state for rollback
    const previousBoard = selectedBoard
    
    try {
      // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
      // Deep clone the board to avoid reference issues
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map(col => ({
          ...col,
          tasks: [...col.tasks]
        }))
      }
      
      const sourceColumn = updatedBoard.columns.find(col => col.id === sourceColumnId)
      const destColumn = updatedBoard.columns.find(col => col.id === destColumnId)
      
      if (!sourceColumn || !destColumn) {
        console.error('❌ Column not found')
        setIsDragging(false)
        return
      }
      
      // Find and remove task from source column
      const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) {
        console.error('❌ Task not found')
        setIsDragging(false)
        return
      }
      
      const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1)
      
      // Update task's column_id if moving to different column
      if (sourceColumnId !== destColumnId) {
        movedTask.column_id = destColumnId
      }
      
      // Insert task into destination column at the new position
      destColumn.tasks.splice(destination.index, 0, movedTask)
      
      console.log('📊 After optimistic update:', {
        sourceColumn: sourceColumn.name,
        sourceTasks: sourceColumn.tasks.map(t => t.title),
        destColumn: destColumn.name,
        destTasks: destColumn.tasks.map(t => t.title),
      })
      
      // Update state immediately for smooth UX
      setSelectedBoard(updatedBoard)
      setIsDragging(false)
      
      console.log('🚀 Optimistic update complete, calling API...')
      
      // Make API call in background
      await taskAPI.moveTask(taskId, destColumnId, destination.index)
      console.log('✅ API call successful')
      
    } catch (err: any) {
      console.error('❌ Failed to move task:', err)
      
      // ROLLBACK: Restore previous state on error
      setSelectedBoard(previousBoard)
      setError(err.response?.data?.detail || 'Failed to move task')
      setIsDragging(false)
    }
  }

  // Create a filtered board with stable references
  const filteredBoard = useMemo(() => {
    if (!selectedBoard) return null
    // Avoid changing the rendered task lists during an active drag
    if (isDragging) return selectedBoard

    const hasFilters = selectedTagIds.length > 0 || query.trim().length > 0
    if (!hasFilters) return selectedBoard

    const q = query.trim().toLowerCase()
    const filteredColumns = selectedBoard.columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => {
        const tagPass = selectedTagIds.length === 0 ||
          task.tags.some(taskTag => availableTags.find(tag => tag.name === taskTag && selectedTagIds.includes(tag.id)))
        const qPass = q.length === 0 ||
          task.title.toLowerCase().includes(q) ||
          (task.assignee?.full_name || task.assignee?.username || '').toLowerCase().includes(q) ||
          task.tags.some(t => t.toLowerCase().includes(q))
        return tagPass && qPass
      })
    }))

    return {
      ...selectedBoard,
      columns: filteredColumns
    }
  }, [selectedBoard, selectedTagIds, availableTags, isDragging, query])

  console.log('Board render - State check:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    isLoading, 
    error, 
    boardsCount: boards.length,
    selectedBoard: !!selectedBoard,
    hasFilters: selectedTagIds.length > 0
  })

  if (!user) {
    console.log('Board: No user found')
    return (
      <BoardContainer>
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
          No user found. Please log in.
        </div>
      </BoardContainer>
    )
  }

  if (isLoading) {
    console.log('Board: Loading state')
    return (
      <BoardContainer>
        <LoadingContainer>Loading boards...</LoadingContainer>
      </BoardContainer>
    )
  }

  if (error) {
    console.log('Board: Error state:', error)
    return (
      <BoardContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Reload Page
        </button>
      </BoardContainer>
    )
  }

  try {
    console.log('Board: Rendering board component', { selectedBoard: !!selectedBoard })
    
    return (
      <BoardContainer>
        <Header
          user={user}
          onCreateBoard={() => setShowCreateModal(true)}
          boards={boards}
          selectedBoardId={selectedBoard?.id ?? null}
          onSelectBoard={(id) => {
            const found = boards.find(b => b.id === id)
            if (found) setSelectedBoard(found)
          }}
          onOpenSettings={() => setShowSettings(true)}
          searchValue={query}
          onSearchChange={setQuery}
          onOpenUserManagement={user?.is_admin ? () => setShowUserManagement(true) : undefined}
        />

        <BoardHeader>
          <div>
            {filteredBoard ? (
              <>
                <BoardTitle>{filteredBoard.name}</BoardTitle>
                {filteredBoard.description && (
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    {filteredBoard.description}
                  </p>
                )}
                {Object.keys(onlineUsers).length > 0 && (
                  <p style={{ color: '#888', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                    Online: {Object.values(onlineUsers).join(', ')}
                  </p>
                )}
              </>
            ) : (
              <BoardTitle>Select a Board</BoardTitle>
            )}
          </div>
          <div />
        </BoardHeader>

      {selectedBoard && (
        <TagFilter
          availableTags={availableTags}
          selectedTags={selectedTagIds}
          onTagsChange={handleTagFilterChange}
        />
      )}

      {filteredBoard ? (
        <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleTaskMove}>
          <BoardGrid>
            {filteredBoard.columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onTaskCommentsClick={handleTaskCommentsClick}
                onTaskEditClick={handleTaskEditClick}
                onTaskDeleteClick={handleTaskDeleteClick}
                onAddTaskClick={() => handleAddTaskClick(column.id)}
              />
            ))}
          </BoardGrid>
        </DragDropContext>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666' }}>
          <p>No boards available. Create your first board to get started!</p>
        </div>
      )}

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}

      {showCreateTaskModal && selectedColumnId && (
        <CreateTaskModal
          columnId={selectedColumnId}
          onClose={() => {
            setShowCreateTaskModal(false)
            setSelectedColumnId(null)
          }}
          onCreate={handleCreateTask}
          availableTags={availableTags}
          users={users}
        />
      )}

      <BoardSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onDeleteBoard={async () => {
          if (!selectedBoard) return
          const confirmed = window.confirm('Delete this board? This will remove all columns and tasks.')
          if (!confirmed) return
          try {
            await boardAPI.deleteBoard(selectedBoard.id)
            setSelectedBoard(null)
            setBoards([])
            await loadBoards()
            setShowSettings(false)
          } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to delete board')
          }
        }}
      />
      
      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        currentUserId={user?.id}
      />

      {showCommentsModal && selectedTask && (
        <CommentsSection
          task={selectedTask}
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false)
            setSelectedTask(null)
          }}
        />
      )}
      {showEditTaskModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          availableTags={availableTags}
          users={users}
          onClose={() => { setShowEditTaskModal(false); setSelectedTask(null) }}
          onSave={async (data) => {
            try {
              const updated = await taskAPI.updateTask(selectedTask.id, data)
              // Patch local state
              const updatedBoard = { ...selectedBoard! }
              for (const col of updatedBoard.columns) {
                const idx = col.tasks.findIndex(t => t.id === updated.id)
                if (idx !== -1) {
                  col.tasks[idx] = updated
                  break
                }
              }
              setSelectedBoard(updatedBoard)
              setShowEditTaskModal(false)
              setSelectedTask(null)
            } catch (err: any) {
              setError(err.response?.data?.detail || 'Failed to update task')
            }
          }}
        />
      )}
    </BoardContainer>
    )
  } catch (renderError) {
    console.error('Board: Error rendering component:', renderError)
    return (
      <BoardContainer>
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
          <h2>Error loading board</h2>
          <p>Something went wrong while rendering the board.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Reload Page
          </button>
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
              {renderError instanceof Error ? renderError.message : String(renderError)}
            </pre>
          </details>
        </div>
      </BoardContainer>
    )
  }
}

export default Board
