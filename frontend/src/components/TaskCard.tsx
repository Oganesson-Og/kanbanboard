import React, { useState } from 'react'
import styled from 'styled-components'
import { Task } from '../types'
import { Card, Chip, IconButton } from './primitives'

interface TaskCardProps {
  task: Task
  onCommentsClick?: () => void
  onEditClick?: () => void
  onDeleteClick?: () => void
  isDone?: boolean
}

const TaskCardContainer = styled(Card)`
  cursor: grab;
  border-left: 3px solid ${({ theme }) => theme.color.brand[500]};
  user-select: none;
  
  /* Override Card's default transitions to prevent interference with drag */
  transition: none !important;
  transform: none !important;
  
  &:hover {
    transform: none !important;
  }
  
  &:active {
    cursor: grabbing;
  }
`

const TaskTitle = styled.h4`
  font-size: 1rem;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0 0 8px 0;
  font-weight: 700;
`

const TaskDescription = styled.p`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.color.text.muted};
  margin-bottom: 8px;
`

const DueBadge = styled(Chip)<{ $variant: 'overdue' | 'soon' | 'normal' | 'done' }>`
  ${({ $variant, theme }) => $variant === 'overdue' && `background:${theme.color.danger[50]}; color:${theme.color.danger[600]}; border-color:${theme.color.danger[600]}33;`}
  ${({ $variant }) => $variant === 'soon' && `background:#FFF6ED; color:#C2410C; border-color:#FEC6A1;`}
  ${({ $variant, theme }) => $variant === 'normal' && `background:${theme.color.brand[50]}; color:${theme.color.brand[600]}; border-color:${theme.color.brand[500]}55;`}
  ${({ $variant }) => $variant === 'done' && `background:#ECFDF3; color:#027A48; border-color:#A6F4C5;`}
`

const PriorityBadge = styled(Chip)<{ $priority: string }>`
  text-transform: uppercase;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 8px;
`

const Tag = styled(Chip)`
  font-size: 0.7rem;
`

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.color.text.muted};
`

const Assignee = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const Avatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.brand[500]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
`

const TimeTrackingContainer = styled.div`
  background: ${({ theme }) => theme.color.surfaceMuted};
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid ${({ theme }) => theme.color.border};
`

const TimeTrackingTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.muted};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TimeTrackingDetails = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const TimeDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const TimeLabel = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.color.text.muted};
  font-weight: 500;
`

const TimeValue = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.color.text.primary};
  font-weight: 600;
  background: ${({ theme }) => theme.color.surface};
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.color.border};
`

const CommentsCount = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.text.muted};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.color.border};
  }
`

const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const DangerIconButton = styled(IconButton).attrs({ $variant: 'danger' as const })``

const TaskCard: React.FC<TaskCardProps> = ({ task, onCommentsClick, onEditClick, onDeleteClick, isDone }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <TaskCardContainer as="article" aria-label={task.title}>
      <TaskTitle>{task.title}</TaskTitle>

      {task.description && (
        <TaskDescription>
          {task.description}
        </TaskDescription>
      )}

      <TaskMeta>
        <PriorityBadge $priority={task.priority} $tone="brand">
          {task.priority}
        </PriorityBadge>
        {task.due_date && (
          (() => {
            const now = new Date()
            const due = new Date(task.due_date)
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const variant: 'overdue' | 'soon' | 'normal' | 'done' = isDone ? 'done' : (diffDays < 0 ? 'overdue' : diffDays <= 2 ? 'soon' : 'normal')
            const absDays = Math.abs(Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            const tip = isDone
              ? `Completed • Due ${due.toLocaleDateString()}`
              : (diffDays < 0
                ? `Overdue by ${absDays} day${absDays === 1 ? '' : 's'}`
                : `Due in ${absDays} day${absDays === 1 ? '' : 's'}`)
            const label = due.toLocaleDateString()
            return <DueBadge title={tip} $variant={variant}>{label}</DueBadge>
          })()
        )}
      </TaskMeta>

      {task.tags && task.tags.length > 0 && (
        <TagsContainer>
          {task.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}

      {(task.estimated_hours || task.hours_used || task.completed_hours) && (
        <TimeTrackingContainer>
          <TimeTrackingTitle>Time Tracking</TimeTrackingTitle>
          <TimeTrackingDetails>
            {task.estimated_hours ? (
              <TimeDetail>
                <TimeLabel>Est:</TimeLabel>
                <TimeValue>{task.estimated_hours}h</TimeValue>
              </TimeDetail>
            ) : null}
            {task.hours_used ? (
              <TimeDetail>
                <TimeLabel>Used:</TimeLabel>
                <TimeValue>{task.hours_used}h</TimeValue>
              </TimeDetail>
            ) : null}
            {task.completed_hours ? (
              <TimeDetail>
                <TimeLabel>Done:</TimeLabel>
                <TimeValue>{task.completed_hours}h</TimeValue>
              </TimeDetail>
            ) : null}
          </TimeTrackingDetails>
        </TimeTrackingContainer>
      )}

      <TaskFooter>
        <Assignee>
          {task.assignee ? (
            <>
              <Avatar>{getInitials(task.assignee.full_name || task.assignee.username)}</Avatar>
              <span>{task.assignee.full_name || task.assignee.username}</span>
            </>
          ) : (
            <span>Unassigned</span>
          )}
        </Assignee>

        <ActionsGroup>
          <CommentsCount onClick={(e) => {
            e.stopPropagation()
            onCommentsClick && onCommentsClick()
          }}>
            💬 {task.comments.length}
          </CommentsCount>
          <IconButton onClick={(e) => { e.stopPropagation(); onEditClick && onEditClick() }} aria-label="Edit task">✏️</IconButton>
          <DangerIconButton onClick={(e) => { e.stopPropagation(); onDeleteClick && onDeleteClick() }} aria-label="Delete task">🗑️</DangerIconButton>
        </ActionsGroup>
      </TaskFooter>
    </TaskCardContainer>
  )
}

export default TaskCard
