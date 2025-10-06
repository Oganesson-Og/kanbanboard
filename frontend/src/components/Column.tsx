import React, { useMemo, CSSProperties } from 'react'
import styled from 'styled-components'
import { Droppable, Draggable, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { Column as ColumnType, Task } from '../types'
import TaskCard from './TaskCard'
import { ColumnSurface } from './primitives'

interface ColumnProps {
  column: ColumnType
  onTaskCommentsClick?: (task: Task) => void
  onTaskEditClick?: (task: Task) => void
  onTaskDeleteClick?: (task: Task) => void
  onAddTaskClick?: () => void
}

const ColumnContainer = styled(ColumnSurface)`
  min-height: 500px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible; /* allow glow shadows to show */
  /* top-only glow handled via global ::before classes */
`

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.color.surface};
  z-index: 1;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`

const ColumnTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  font-weight: 600;
`

const TaskCount = styled.span`
  background: ${({ theme }) => theme.color.surfaceMuted};
  color: ${({ theme }) => theme.color.text.muted};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`

const HoursBadge = styled.span`
  background: ${({ theme }) => theme.color.brand[50]};
  color: ${({ theme }) => theme.color.brand[600]};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
`

const TaskList = styled.div`
  flex: 1;
  min-height: 100px;
  overflow: visible;
`

const AddTaskButton = styled.button`
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.color.brand[500]};
  color: white;
  font-weight: 600;
  margin-top: 12px;
  &:hover { background: ${({ theme }) => theme.color.brand[600]}; }
`

const Column: React.FC<ColumnProps> = ({ column, onTaskCommentsClick, onTaskEditClick, onTaskDeleteClick, onAddTaskClick }) => {
  const getShadowClass = (name: string): string => {
    const key = name.trim().toLowerCase()
    const base = 'kanban-col '
    if (key === 'backlog') return base + 'col-topglow-backlog col-border-backlog'
    if (key === 'to do' || key === 'todo') return base + 'col-topglow-todo col-border-todo'
    if (key === 'in progress') return base + 'col-topglow-progress col-border-progress'
    if (key === 'done') return base + 'col-topglow-done col-border-done'
    return base.trim()
  }
  const totalRemaining = useMemo(() => {
    return column.tasks.reduce((sum, t) => {
      const estimated = t.estimated_hours || 0
      const done = (t.completed_hours ?? t.hours_used) || 0
      const remaining = Math.max(0, estimated - done)
      return sum + remaining
    }, 0)
  }, [column.tasks])

  const formatHours = (h: number) => `${Math.round(h * 10) / 10}h`

  const isDone = useMemo(() => column.name.toLowerCase() === 'done', [column.name])

  // Memoize droppable list style to prevent recreation
  const getDroppableStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? 'rgba(99,102,241,0.06)' : 'transparent',
    borderRadius: '8px',
    padding: '2px',
  })

  // Memoize draggable item style for better performance
  // Ensure consistent positioning by explicitly handling transform and disabling all transitions
  const getDraggableStyle = (
    isDragging: boolean,
    draggableStyle: any
  ): CSSProperties => {
    // Extract transform from the drag library's style to ensure it's applied correctly
    const transform = draggableStyle?.transform || 'none'
    
    const style: CSSProperties = {
      // Spread the library's positioning styles first
      ...draggableStyle,
      // Explicitly reapply transform to ensure it's not overridden
      transform,
      // Ensure dragged item appears above neighboring columns
      zIndex: isDragging ? 1000 : (draggableStyle?.zIndex ?? 'auto'),
      // Disable all transitions to prevent interference with drag positioning
      transition: 'none',
      // Prevent text selection during drag
      userSelect: 'none' as const,
      // Visual feedback
      cursor: isDragging ? 'grabbing' : 'grab',
      boxShadow: isDragging
        ? '0 8px 20px rgba(0,0,0,0.15)'
        : 'none',
      // Prevent pointer events on the dragged element itself
      pointerEvents: isDragging ? 'none' : 'auto',
      // Ensure consistent positioning strategy
      willChange: isDragging ? 'transform' : 'auto',
    }
    
    return style
  }

  return (
    <ColumnContainer role="section" aria-labelledby={`col-${column.id}`} className={getShadowClass(column.name)}>
      <ColumnHeader>
        <ColumnTitle id={`col-${column.id}`}>{column.name}</ColumnTitle>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TaskCount>{column.tasks.length}</TaskCount>
          <HoursBadge>{formatHours(totalRemaining)}</HoursBadge>
        </div>
      </ColumnHeader>

      <Droppable droppableId={column.id.toString()}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <TaskList
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={getDroppableStyle(snapshot.isDraggingOver)}
          >
            {column.tasks.map((task, index) => (
              <Draggable 
                key={`task-${task.id}`} 
                draggableId={`task-${task.id}`} 
                index={index}
              >
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...getDraggableStyle(snapshot.isDragging, provided.draggableProps.style),
                      marginBottom: '8px',
                    }}
                  >
                    <TaskCard
                      task={task}
                      onCommentsClick={() => onTaskCommentsClick && onTaskCommentsClick(task)}
                      onEditClick={() => onTaskEditClick && onTaskEditClick(task)}
                      onDeleteClick={() => onTaskDeleteClick && onTaskDeleteClick(task)}
                      isDone={isDone}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>

      <AddTaskButton onClick={onAddTaskClick}>
        + Add Task
      </AddTaskButton>
    </ColumnContainer>
  )
}

export default Column
