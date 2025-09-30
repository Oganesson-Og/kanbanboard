import React from 'react'
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
  z-index: 0;
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
  const totalRemaining = column.tasks.reduce((sum, t) => {
    const estimated = t.estimated_hours || 0
    const done = (t.completed_hours ?? t.hours_used) || 0
    const remaining = Math.max(0, estimated - done)
    return sum + remaining
  }, 0)

  const formatHours = (h: number) => `${Math.round(h * 10) / 10}h`

  return (
    <ColumnContainer role="section" aria-labelledby={`col-${column.id}`}>
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
            style={{
              background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.06)' : 'transparent',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      position: 'relative',
                      zIndex: snapshot.isDragging ? 5000 : 'auto',
                      transform: snapshot.isDragging && provided.draggableProps.style?.transform
                        ? `${provided.draggableProps.style.transform} scale(1.02)`
                        : provided.draggableProps.style?.transform,
                      boxShadow: snapshot.isDragging
                        ? '0 12px 30px rgba(0,0,0,0.2)'
                        : 'none',
                      transition: snapshot.isDragging
                        ? 'box-shadow 0.2s ease'
                        : 'transform 200ms cubic-bezier(0.2, 0, 0, 1), box-shadow 200ms ease',
                    }}
                  >
                    <TaskCard
                      task={task}
                      onCommentsClick={() => onTaskCommentsClick && onTaskCommentsClick(task)}
                      onEditClick={() => onTaskEditClick && onTaskEditClick(task)}
                      onDeleteClick={() => onTaskDeleteClick && onTaskDeleteClick(task)}
                      isDone={column.name.toLowerCase() === 'done'}
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
