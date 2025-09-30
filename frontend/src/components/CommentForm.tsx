import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

interface CommentFormProps {
  onSubmit: (content: string) => void
  placeholder?: string
  autoFocus?: boolean
  users?: { id: number; username: string; full_name?: string }[]
}

const FormContainer = styled.div`
  margin-top: 1rem;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: ${props => props.variant === 'secondary' ? '1px solid #e1e5e9' : 'none'};
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'secondary' ? 'white' : '#667eea'};
  color: ${props => props.variant === 'secondary' ? '#666' : 'white'};

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#f8f9fa' : '#5a6fd8'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const MentionDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
`

const MentionItem = styled.div`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Add a comment...",
  autoFocus = false,
  users = []
}) => {
  const [content, setContent] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(mentionFilter.toLowerCase()))
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)

    // Check for @ mentions
    const textBeforeCursor = value.substring(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.substring(atIndex + 1)
      const spaceIndex = afterAt.indexOf(' ')

      if (spaceIndex === -1) {
        // We're in a mention
        setShowMentions(true)
        setMentionFilter(afterAt)
        setMentionStart(atIndex)
      } else {
        // Mention is complete
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }

    setContent(value)
  }

  const handleMentionSelect = (username: string) => {
    const beforeMention = content.substring(0, mentionStart)
    const afterCursor = content.substring(cursorPosition)
    const newContent = `${beforeMention}@${username} ${afterCursor}`

    setContent(newContent)
    setShowMentions(false)

    // Focus back to textarea and set cursor position
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + username.length + 2 // +2 for @ and space
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
      setShowMentions(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setShowMentions(false)
  }

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <TextArea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={3}
          />

          {showMentions && filteredUsers.length > 0 && (
            <MentionDropdown>
              {filteredUsers.slice(0, 5).map(user => (
                <MentionItem
                  key={user.id}
                  onClick={() => handleMentionSelect(user.username)}
                >
                  <strong>@{user.username}</strong>
                  {user.full_name && ` - ${user.full_name}`}
                </MentionItem>
              ))}
            </MentionDropdown>
          )}
        </div>

        <FormActions>
          <div style={{ color: '#666', fontSize: '0.8rem' }}>
            Use @username to mention team members
          </div>
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              Comment
            </Button>
          </ButtonGroup>
        </FormActions>
      </form>
    </FormContainer>
  )
}

export default CommentForm

