import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Comment as CommentType } from '../types'

interface CommentProps {
  comment: CommentType
  onEdit?: (commentId: number, content: string) => void
  onDelete?: (commentId: number) => void
  currentUserId?: number
}

const CommentContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid #667eea;
`

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AuthorAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
`

const AuthorName = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`

const CommentDate = styled.span`
  color: #999;
  font-size: 0.8rem;
`

const CommentContent = styled.div`
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;

  .mention {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
  }
`

const CommentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : 'transparent'};
  color: ${props => props.variant === 'danger' ? 'white' : '#666'};
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c0392b' : '#e1e5e9'};
  }
`

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const EditTextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const EditButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`

const Comment: React.FC<CommentProps> = ({ comment, onEdit, onDelete, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isAuthor = currentUserId === comment.author_id
  const timeAgo = new Date(comment.created_at).toLocaleString()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onEdit && editContent.trim()) {
      onEdit(comment.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  // Parse mentions in content
  const parseMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = content.split(mentionRegex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return <span key={index} className="mention">@{part}</span>
      }
      return part
    })
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  return (
    <CommentContainer>
      <CommentHeader>
        <AuthorInfo>
          <AuthorAvatar>
            {getInitials(comment.author.full_name || comment.author.username)}
          </AuthorAvatar>
          <AuthorName>{comment.author.full_name || comment.author.username}</AuthorName>
          <CommentDate>{timeAgo}</CommentDate>
        </AuthorInfo>

        {isAuthor && (
          <CommentActions>
            <ActionButton onClick={() => setIsEditing(true)}>
              Edit
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={() => onDelete && onDelete(comment.id)}
            >
              Delete
            </ActionButton>
          </CommentActions>
        )}
      </CommentHeader>

      {isEditing ? (
        <EditForm onSubmit={handleEditSubmit}>
          <EditTextArea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Edit your comment..."
          />
          <EditButtons>
            <ActionButton type="button" onClick={handleCancelEdit}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" disabled={!editContent.trim()}>
              Save
            </ActionButton>
          </EditButtons>
        </EditForm>
      ) : (
        <CommentContent>
          {parseMentions(comment.content)}
        </CommentContent>
      )}
    </CommentContainer>
  )
}

export default Comment

