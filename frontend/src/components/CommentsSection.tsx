import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Task, Comment as CommentType, User } from '../types'
import { commentAPI } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import Comment from './Comment'
import CommentForm from './CommentForm'

interface CommentsSectionProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  users?: User[]
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

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ModalTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #333;
  }
`

const TaskInfo = styled.div`
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
`

const TaskTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`

const TaskDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`

const CommentsContainer = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
`

const CommentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const CommentsTitle = styled.h3`
  font-size: 1rem;
  color: #333;
  margin: 0;
`

const CommentsCount = styled.span`
  background: #e1e5e9;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`

const CommentsList = styled.div`
  margin-bottom: 1rem;
`

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
`

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  padding: 2rem;
`

const CommentsSection: React.FC<CommentsSectionProps> = ({ task, isOpen, onClose, users = [] }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && task) {
      loadComments()
    }
  }, [isOpen, task])

  const loadComments = async () => {
    setIsLoading(true)
    setError('')

    try {
      const commentsData = await commentAPI.getTaskComments(task.id)
      setComments(commentsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (content: string) => {
    try {
      const newComment = await commentAPI.createComment(task.id, { content })
      setComments(prev => [...prev, newComment])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add comment')
    }
  }

  const handleCommentEdit = async (commentId: number, content: string) => {
    try {
      const updated = await commentAPI.updateComment(commentId, { content })
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to edit comment')
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    try {
      await commentAPI.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete comment')
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Task Comments</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <TaskInfo>
          <TaskTitle>{task.title}</TaskTitle>
          {task.description && (
            <TaskDescription>{task.description}</TaskDescription>
          )}
        </TaskInfo>

        <CommentsContainer>
          <CommentsHeader>
            <CommentsTitle>Comments</CommentsTitle>
            <CommentsCount>{comments.length}</CommentsCount>
          </CommentsHeader>

          {isLoading ? (
            <LoadingMessage>Loading comments...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <CommentsList>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onEdit={handleCommentEdit}
                    onDelete={handleCommentDelete}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </CommentsList>
          )}

          <CommentForm
            onSubmit={handleCommentSubmit}
            users={users}
            placeholder={`Comment on "${task.title}"...`}
          />
        </CommentsContainer>
      </ModalContainer>
    </ModalOverlay>
  )
}

export default CommentsSection

