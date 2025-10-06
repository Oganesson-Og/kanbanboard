import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Board, Task, User } from '../../types'
import WorkloadSummary from './WorkloadSummary'
import UserWorkloadCard from './UserWorkloadCard'
import { groupTasksByAssignee, flattenBoardTasks } from '../../utils/workload'
import { usersStub } from '../../api/usersStub'
import { userAPI } from '../../api/client'
import AddUserModal from './AddUserModal'

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  align-items: start;
  @media (max-width: 1023px) { grid-template-columns: 1fr; }
`

const Panel = styled.div`
  display: grid;
  gap: 12px;
`

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 1279px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 767px) { grid-template-columns: 1fr; }
`

const HeaderRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
`

const Dropdown = styled.select`
  height: 32px; border-radius: 8px; border: 1px solid ${({ theme }) => theme.color.control.border};
  background: ${({ theme }) => theme.color.control.bg}; color: ${({ theme }) => theme.color.control.fg}; padding: 0 8px;
`

const Button = styled.button`
  height: 32px; border-radius: 8px; border: 1px solid ${({ theme }) => theme.color.control.border};
  padding: 0 10px; background: ${({ theme }) => theme.color.control.bg}; color: ${({ theme }) => theme.color.control.fg};
`

export interface WorkloadViewProps {
  board: Board
  onReassignUser?: (userId: number, reassignToId: number | null) => Promise<void> | void
}

const WorkloadView: React.FC<WorkloadViewProps> = ({ board, onReassignUser }) => {
  const [users, setUsers] = useState<User[]>([])
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [reassignTo, setReassignTo] = useState<number | 'unassigned'>('unassigned')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    // Prefer backend users; fall back to stub if API fails
    userAPI.getUsers().then(setUsers).catch(() => usersStub.list().then(setUsers))
  }, [])

  const tasks = useMemo(() => flattenBoardTasks(board), [board])
  const byAssignee = useMemo(() => groupTasksByAssignee(tasks), [tasks])

  const statusByTaskId = useMemo(() => {
    const map: Record<number, 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE'> = {}
    for (const col of board.columns) {
      const key = col.name.toLowerCase()
      let status: 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE' = 'TODO'
      if (key === 'backlog') status = 'BACKLOG'
      else if (key === 'to do' || key === 'todo') status = 'TODO'
      else if (key === 'in progress') status = 'IN_PROGRESS'
      else status = 'DONE'
      for (const t of col.tasks) map[t.id] = status
    }
    return map
  }, [board])

  const summaryItems = useMemo(() => {
    const items: { user?: User; userId: number | 'unassigned'; hours: { backlog: number; todo: number; inProgress: number; done: number } }[] = []
    const ensureForKey = (key: number | 'unassigned') => {
      let item = items.find(i => i.userId === key)
      if (!item) {
        const user = typeof key === 'number' ? users.find(u => u.id === key) : undefined
        item = { user, userId: key, hours: { backlog: 0, todo: 0, inProgress: 0, done: 0 } }
        items.push(item)
      }
      return item
    }
    for (const col of board.columns) {
      const key = col.name.toLowerCase()
      const bucket = key === 'backlog' ? 'backlog' : key === 'to do' || key === 'todo' ? 'todo' : key === 'in progress' ? 'inProgress' : 'done'
      for (const t of col.tasks) {
        const id = t.assignee_id ?? 'unassigned'
        const item = ensureForKey(id)
        item.hours[bucket as 'backlog'|'todo'|'inProgress'|'done'] += t.estimated_hours ?? 0
      }
    }
    // Always include Unassigned entry
    if (!items.find(i => i.userId === 'unassigned')) items.push({ user: undefined, userId: 'unassigned', hours: { backlog: 0, todo: 0, inProgress: 0, done: 0 } })
    return items
  }, [board, users])

  const cards = useMemo(() => {
    const list: { user?: User; userId: number | 'unassigned'; tasks: Task[] }[] = []
    for (const [key, arr] of byAssignee.entries()) {
      const user = typeof key === 'number' ? users.find(u => u.id === key) : undefined
      list.push({ user, userId: key, tasks: arr })
    }
    // Always include Unassigned card
    if (!byAssignee.has('unassigned')) list.push({ user: undefined, userId: 'unassigned', tasks: [] })
    return list
  }, [byAssignee, users])

  const handleAddUser = async (data: { email: string; username: string; full_name: string; password: string; capacityHoursPerWeek?: number; avatarUrl?: string }) => {
    try {
      const created = await userAPI.createUser({ email: data.email, username: data.username, full_name: data.full_name, password: data.password })
      setUsers(prev => [...prev, created])
    } catch {
      const created = await usersStub.create(data as any)
      setUsers(prev => [...prev, created])
    }
  }

  const handleDeleteUser = async () => {
    if (deleteTarget == null) return
    try {
      // attempt backend admin delete route first
      const params = new URLSearchParams()
      if (reassignTo !== 'unassigned') params.set('reassign_to_id', String(reassignTo))
      await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/users/${deleteTarget}?${params.toString()}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` } })
    } catch {}
    await usersStub.delete(deleteTarget, { reassignToId: reassignTo === 'unassigned' ? null : reassignTo })
    setUsers(prev => prev.filter(u => u.id !== deleteTarget))
    try {
      if (onReassignUser) await onReassignUser(deleteTarget, reassignTo === 'unassigned' ? null : (reassignTo as number))
    } catch {}
    setDeleteTarget(null)
  }

  return (
    <div>
      <HeaderRow>
        <h2>Workload</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button onClick={() => setShowAdd(true)}>Add User</Button>
          <Dropdown value={deleteTarget ?? ''} onChange={(e) => setDeleteTarget(e.target.value ? parseInt(e.target.value) : null)}>
            <option value="">Delete User…</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
          </Dropdown>
          {deleteTarget != null && (
            <>
              <span>Reassign to</span>
              <Dropdown value={String(reassignTo)} onChange={(e) => setReassignTo(e.target.value === 'unassigned' ? 'unassigned' : parseInt(e.target.value))}>
                <option value="unassigned">Unassigned</option>
                {users.filter(u => u.id !== deleteTarget).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
              </Dropdown>
              <Button onClick={handleDeleteUser}>Confirm</Button>
            </>
          )}
        </div>
      </HeaderRow>
      <Layout>
        <Panel>
          <WorkloadSummary items={summaryItems} />
        </Panel>
        <Panel>
          <Grid>
            {cards.map(c => (
              <UserWorkloadCard key={String(c.userId)} user={c.user} tasks={c.tasks} statusByTaskId={statusByTaskId} />
            ))}
          </Grid>
        </Panel>
      </Layout>
      <AddUserModal isOpen={showAdd} onClose={() => setShowAdd(false)} onCreate={handleAddUser} />
    </div>
  )
}

export default WorkloadView


