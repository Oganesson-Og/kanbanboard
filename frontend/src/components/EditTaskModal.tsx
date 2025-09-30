import React, { useState } from 'react'
import styled from 'styled-components'
import { Task, CreateTaskRequest, Tag, User } from '../types'

interface EditTaskModalProps {
  task: Task
  availableTags: Tag[]
  users?: User[]
  onClose: () => void
  onSave: (data: Partial<CreateTaskRequest>) => void
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Content = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  max-height: 80vh;
  overflow-y: auto;
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  &:focus { outline: none; border-color: #667eea; }
`

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  &:focus { outline: none; border-color: #667eea; }
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: ${p => p.$variant === 'secondary' ? '1px solid #e1e5e9' : 'none'};
  background: ${p => p.$variant === 'secondary' ? '#f8f9fa' : '#667eea'};
  color: ${p => p.$variant === 'secondary' ? '#666' : 'white'};
  cursor: pointer;
  font-weight: 600;
  &:hover { background: ${p => p.$variant === 'secondary' ? '#e9ecef' : '#5a6fd8'}; }
`

const TagButton = styled.button<{ selected: boolean; color: string }>`
  padding: 0.25rem 0.75rem;
  border: 1px solid ${p => p.color};
  border-radius: 20px;
  background: ${p => (p.selected ? p.color : 'white')};
  color: ${p => (p.selected ? 'white' : p.color)};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.color}; color: white; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
`

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, availableTags, users = [], onClose, onSave }) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(() => task.due_date ? new Date(task.due_date).toISOString().slice(0,10) : '')
  const [estimated, setEstimated] = useState(task.estimated_hours?.toString() || '')
  const [used, setUsed] = useState(task.hours_used?.toString() || '')
  const [completed, setCompleted] = useState(task.completed_hours?.toString() || '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    availableTags.filter(t => task.tags?.includes(t.name)).map(t => t.id)
  )
  const [assigneeId, setAssigneeId] = useState<string>(task.assignee_id ? String(task.assignee_id) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagNames = availableTags
      .filter(t => selectedTagIds.includes(t.id))
      .map(t => t.name)
    const payload: Partial<CreateTaskRequest> = {
      title,
      description: description.trim() || undefined,
      priority: priority as any,
      tags: tagNames.length ? tagNames : undefined,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      assignee_id: assigneeId ? parseInt(assigneeId) : undefined,
      estimated_hours: estimated !== '' ? parseFloat(estimated) : undefined,
      hours_used: used !== '' ? parseFloat(used) : undefined,
      completed_hours: completed !== '' ? parseFloat(completed) : undefined,
      column_id: task.column_id,
    }
    onSave(payload)
  }

  return (
    <Overlay onClick={onClose}>
      <Content onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: 0 }}>Edit Task</h3>
        <form onSubmit={handleSubmit}>
          <Row>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </Row>
          <Row>
            <Label>Description</Label>
            <TextArea value={description} onChange={e => setDescription(e.target.value)} />
          </Row>
          <Row>
            <Label>Priority</Label>
            <select value={priority} onChange={e => setPriority(e.target.value as any)} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5e9' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Row>
          <Row>
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </Row>
          <Row>
            <Label>Time tracking</Label>
            <Grid>
              <div>
                <Label>Estimated</Label>
                <Input type="number" step="0.5" min="0" value={estimated} onChange={e => setEstimated(e.target.value)} />
              </div>
              <div>
                <Label>Used</Label>
                <Input type="number" step="0.5" min="0" value={used} onChange={e => setUsed(e.target.value)} />
              </div>
              <div>
                <Label>Completed</Label>
                <Input type="number" step="0.5" min="0" value={completed} onChange={e => setCompleted(e.target.value)} />
              </div>
            </Grid>
          </Row>
          <Row>
            <Label>Assignee</Label>
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #e1e5e9' }}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
              ))}
            </select>
          </Row>
          <Row>
            <Label>Tags</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {availableTags.map(tag => (
                <TagButton
                  key={tag.id}
                  type="button"
                  color={tag.color}
                  selected={selectedTagIds.includes(tag.id)}
                  onClick={() => setSelectedTagIds(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                >
                  {tag.name}
                </TagButton>
              ))}
            </div>
          </Row>
          <Actions>
            <Button type="button" $variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" $variant="primary">Save</Button>
          </Actions>
        </form>
      </Content>
    </Overlay>
  )
}

export default EditTaskModal


