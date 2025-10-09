import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { User } from '../../types'
import { userAPI } from '../../api/client'

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: 12px;
  padding: 24px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 1.5rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.muted};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`

const Section = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 1.1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.color.control.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.control.bg};
  color: ${({ theme }) => theme.color.control.fg};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.brand[500]};
  }
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  flex: 1;
`

const UserName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`

const UserEmail = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.text.muted};
`

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.color.brand[500]};
  color: white;
  margin-left: 8px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId?: number
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, currentUserId }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      const allUsers = await userAPI.getUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.username || !formData.full_name || !formData.password) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await userAPI.createUser(formData)
      setFormData({ email: '', username: '', full_name: '', password: '' })
      await loadUsers()
      alert('User created successfully')
    } catch (error: any) {
      console.error('Failed to create user:', error)
      alert(error.response?.data?.detail || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async (userId: number) => {
    if (!window.confirm('Are you sure you want to make this user an admin?')) {
      return
    }

    try {
      await userAPI.makeAdmin(userId)
      await loadUsers()
      alert('User promoted to admin')
    } catch (error) {
      console.error('Failed to make admin:', error)
      alert('Failed to make admin')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? Their tasks will be unassigned.')) {
      return
    }

    try {
      await userAPI.deleteUser(userId)
      await loadUsers()
      alert('User deleted')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  if (!isOpen) return null

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>User Management</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Section>
          <SectionTitle>Create New User</SectionTitle>
          <Form onSubmit={handleCreateUser}>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Form>
        </Section>

        <Section>
          <SectionTitle>All Users ({users.length})</SectionTitle>
          <UserList>
            {users.map((user) => (
              <UserCard key={user.id}>
                <UserInfo>
                  <UserName>
                    {user.full_name || user.username}
                    {user.is_admin && <Badge>ADMIN</Badge>}
                    {!user.is_active && <Badge style={{ background: '#f39c12' }}>INACTIVE</Badge>}
                  </UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserInfo>
                <ButtonGroup>
                  {!user.is_admin && user.is_active && (
                    <Button onClick={() => handleMakeAdmin(user.id)}>Make Admin</Button>
                  )}
                  {user.id !== currentUserId && (
                    <Button $variant="danger" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </Button>
                  )}
                </ButtonGroup>
              </UserCard>
            ))}
          </UserList>
        </Section>
      </Modal>
    </Overlay>
  )
}

export default UserManagementModal

