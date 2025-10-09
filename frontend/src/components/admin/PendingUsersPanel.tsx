import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { User } from '../../types'
import { userAPI } from '../../api/client'

const Panel = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`

const Title = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
`

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${({ theme }) => theme.color.surfaceMuted};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 8px;
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const UserName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`

const UserEmail = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.text.muted};
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
    background: ${theme.color.brand[500]};
    color: white;
    &:hover { background: ${theme.color.brand[600]}; }
  `
      : $variant === 'danger'
      ? `
    background: ${theme.color.danger};
    color: white;
    &:hover { opacity: 0.9; }
  `
      : `
    background: ${theme.color.control.bg};
    color: ${theme.color.control.fg};
    border: 1px solid ${theme.color.control.border};
    &:hover { background: ${theme.color.surfaceMuted}; }
  `}
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.color.text.muted};
`

interface PendingUsersPanelProps {
  onUserApproved?: () => void
}

const PendingUsersPanel: React.FC<PendingUsersPanelProps> = ({ onUserApproved }) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadPendingUsers = async () => {
    try {
      const users = await userAPI.getPendingUsers()
      setPendingUsers(users)
    } catch (error) {
      console.error('Failed to load pending users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const handleApprove = async (userId: number) => {
    try {
      await userAPI.approveUser(userId)
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      onUserApproved?.()
    } catch (error) {
      console.error('Failed to approve user:', error)
      alert('Failed to approve user')
    }
  }

  const handleReject = async (userId: number) => {
    if (!window.confirm('Are you sure you want to reject this user? This will delete their account.')) {
      return
    }
    try {
      await userAPI.deleteUser(userId)
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error('Failed to reject user:', error)
      alert('Failed to reject user')
    }
  }

  if (loading) {
    return (
      <Panel>
        <Title>Pending User Registrations</Title>
        <EmptyMessage>Loading...</EmptyMessage>
      </Panel>
    )
  }

  if (pendingUsers.length === 0) {
    return (
      <Panel>
        <Title>Pending User Registrations</Title>
        <EmptyMessage>No pending users</EmptyMessage>
      </Panel>
    )
  }

  return (
    <Panel>
      <Title>Pending User Registrations ({pendingUsers.length})</Title>
      <UserList>
        {pendingUsers.map((user) => (
          <UserCard key={user.id}>
            <UserInfo>
              <UserName>{user.full_name || user.username}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
            <ButtonGroup>
              <Button $variant="primary" onClick={() => handleApprove(user.id)}>
                Approve
              </Button>
              <Button $variant="danger" onClick={() => handleReject(user.id)}>
                Reject
              </Button>
            </ButtonGroup>
          </UserCard>
        ))}
      </UserList>
    </Panel>
  )
}

export default PendingUsersPanel

