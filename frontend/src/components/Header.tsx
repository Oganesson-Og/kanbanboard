import React from 'react'
import styled from 'styled-components'
import { Toolbar, HStack, Select as SelectPrimitive, PrimaryButton, IconButton } from './primitives'
import { User, Board as BoardType } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface HeaderProps {
  user?: User | null
  onCreateBoard?: () => void
  boards?: BoardType[]
  selectedBoardId?: number | null
  onSelectBoard?: (boardId: number) => void
}

const HeaderContainer = styled(Toolbar)``

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.brand[500]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
`

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const UserName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`

const UserEmail = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.text.muted};
`

const LogoutButton = styled(IconButton).attrs({ 'aria-label': 'Logout' })``

const ThemeToggleButton = styled(IconButton).attrs({ 'aria-label': 'Toggle theme' })`
  font-size: 1.2rem;
`

const CreateBoardButton = styled(PrimaryButton)``

const BoardSelect = styled(SelectPrimitive)`
  min-width: 160px;
  background: ${({ theme }) => theme.color.control.bg};
  color: ${({ theme }) => theme.color.control.fg};
  border-color: ${({ theme }) => theme.color.control.border};
`

const Header: React.FC<HeaderProps> = ({ user, onCreateBoard, boards = [], selectedBoardId, onSelectBoard }) => {
  const { logout } = useAuth()
  const { themeMode, toggleTheme } = useTheme()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <HeaderContainer>
      <Logo>Kanban Board</Logo>

      {user && (
        <UserInfo as={HStack}>
          <CreateBoardButton onClick={onCreateBoard}>Create Board</CreateBoardButton>
          {boards.length > 0 && (
            <BoardSelect
              aria-label="Select board"
              value={selectedBoardId ?? ''}
              onChange={(e) => onSelectBoard && onSelectBoard(parseInt(e.target.value))}
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </BoardSelect>
          )}
          <UserDetails>
            <UserName>{user.full_name || user.username}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserDetails>
          <UserAvatar aria-hidden>
            {getInitials(user.full_name || user.username)}
          </UserAvatar>
          <ThemeToggleButton onClick={toggleTheme} title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
            {themeMode === 'light' ? '🌙' : '☀️'}
          </ThemeToggleButton>
          <LogoutButton onClick={handleLogout}>⎋</LogoutButton>
        </UserInfo>
      )}
    </HeaderContainer>
  )
}

export default Header

