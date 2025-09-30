import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateTaskRequest, Tag, User } from '../types'

interface CreateTaskModalProps {
  columnId: number
  onClose: () => void
  onCreate: (taskData: CreateTaskRequest) => void
  availableTags: Tag[]
  users: User[]
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
    outline: none;
  }
`

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
    outline: none;
  }
`

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
    outline: none;
  }
`

const TimeFieldsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
`

const TimeField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const TagButton = styled.button<{ selected: boolean; color: string }>`
  padding: 0.25rem 0.75rem;
  border: 1px solid ${props => props.color};
  border-radius: 20px;
  background: ${props => props.selected ? props.color : 'white'};
  color: ${props => props.selected ? 'white' : props.color};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.color};
    color: white;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e1e5e9;
    
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  columnId,
  onClose,
  onCreate,
  availableTags,
  users
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    selectedTags: [] as string[],
    due_date: '',
    assignee_id: '',
    estimated_hours: '',
    hours_used: '',
    completed_hours: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagClick = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!formData.title.trim()) return

      // Convert selected tags to array of tag names that backend expects
      const selectedTagNames = availableTags
        .filter(tag => formData.selectedTags.includes(tag.id))
        .map(tag => tag.name)

      const taskData: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        column_id: columnId,
        priority: formData.priority,
        tags: selectedTagNames.length > 0 ? selectedTagNames : undefined,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : 0,
        hours_used: formData.hours_used ? parseFloat(formData.hours_used) : 0,
        completed_hours: formData.completed_hours ? parseFloat(formData.completed_hours) : 0
      }

      console.log('Creating task with data:', taskData)
      onCreate(taskData)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create New Task</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Task Title *</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description (optional)..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Due Date</Label>
            <Input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Priority</Label>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Assignee</Label>
            <Select name="assignee_id" value={formData.assignee_id} onChange={handleInputChange}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Time Tracking</Label>
            <TimeFieldsContainer>
              <TimeField>
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </TimeField>
              <TimeField>
                <Label>Hours Used</Label>
                <Input
                  type="number"
                  name="hours_used"
                  value={formData.hours_used}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </TimeField>
              <TimeField>
                <Label>Completed Hours</Label>
                <Input
                  type="number"
                  name="completed_hours"
                  value={formData.completed_hours}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </TimeField>
            </TimeFieldsContainer>
          </FormGroup>

          <FormGroup>
            <Label>Tags</Label>
            <TagsContainer>
              {availableTags.map(tag => (
                <TagButton
                  key={tag.id}
                  type="button"
                  selected={formData.selectedTags.includes(tag.id)}
                  color={tag.color}
                  onClick={() => handleTagClick(tag.id)}
                >
                  {tag.name}
                </TagButton>
              ))}
            </TagsContainer>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" $variant="primary" disabled={!formData.title.trim()}>
              Create Task
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  )
}

export default CreateTaskModal
