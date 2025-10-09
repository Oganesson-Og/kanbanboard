import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Header from '../Header'
import { boardAPI, userAPI } from '../../api/client'
import { Board as BoardType, Task, User } from '../../types'
import WorkloadHeader from './WorkloadHeader'
import WorkloadSummary from './WorkloadSummary'
import UserWorkloadCard from './UserWorkloadCard'
import { useAuth } from '../../contexts/AuthContext'
import BoardSettingsDialog from '../BoardSettingsDialog'
import PendingUsersPanel from '../admin/PendingUsersPanel'
import UserManagementModal from '../admin/UserManagementModal'

const Page = styled.div`
  min-height: 100vh; background: ${({theme})=>theme.color.bg}; padding: 24px;
`

const Grid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 1279px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 767px) { grid-template-columns: 1fr; }
`

const Panel = styled.div`
  display: grid; gap: 12px;
`

export default function WorkloadPage(){
  const { user } = useAuth()
  const [boards, setBoards] = useState<BoardType[]>([])
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)

  useEffect(() => {
    boardAPI.getBoards().then(b=>{ setBoards(b); setSelectedBoard(b[0] ?? null) }).catch(()=>{})
    userAPI.getUsers().then(setUsers).catch(()=>{})
  }, [])

  const allTasks = useMemo(()=>{
    if(!selectedBoard) return [] as Task[]
    const arr: Task[] = []
    for(const c of selectedBoard.columns){ for(const t of c.tasks){ arr.push(t) } }
    return arr
  }, [selectedBoard])

  const filteredTasks = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(q.length===0) return allTasks
    return allTasks.filter(t => {
      const title = (t.title||'').toLowerCase()
      const assigneeName = (t.assignee?.full_name || t.assignee?.username || users.find(u=>u.id===t.assignee_id)?.full_name || users.find(u=>u.id===t.assignee_id)?.username || '').toLowerCase()
      const tags = (t.tags||[]).join(' ').toLowerCase()
      return title.includes(q) || assigneeName.includes(q) || tags.includes(q)
    })
  }, [allTasks, query, users])

  const statusByTaskId = useMemo(()=>{
    const map: Record<number, 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE'> = {}
    if(!selectedBoard) return map
    for(const col of selectedBoard.columns){
      const key = col.name.toLowerCase()
      let status: 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE' = 'TODO'
      if (key === 'backlog') status = 'BACKLOG'
      else if (key === 'to do' || key === 'todo') status = 'TODO'
      else if (key === 'in progress') status = 'IN_PROGRESS'
      else status = 'DONE'
      for(const t of col.tasks){ map[t.id] = status }
    }
    return map
  }, [selectedBoard])

  const perUser = useMemo(()=>{
    const map = new Map<number|'unassigned', Task[]>()
    for(const t of filteredTasks){ const key = t.assignee_id ?? 'unassigned'; const arr = map.get(key) || []; arr.push(t); map.set(key, arr) }
    const list: {user?:User; userId:number|'unassigned'; tasks:Task[]}[] = []
    for(const [key, arr] of map.entries()){
      const user = typeof key === 'number' ? users.find(u=>u.id===key) : undefined
      list.push({ user, userId: key, tasks: arr })
    }
    if(!map.has('unassigned')) list.push({ user: undefined, userId: 'unassigned', tasks: [] })
    return list
  }, [filteredTasks, users])

  const summaryItems = useMemo(()=>{
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
    for (const t of filteredTasks) {
      const id = t.assignee_id ?? 'unassigned'
      const item = ensureForKey(id)
      const bucket = statusByTaskId[t.id] === 'BACKLOG' ? 'backlog'
        : statusByTaskId[t.id] === 'IN_PROGRESS' ? 'inProgress'
        : statusByTaskId[t.id] === 'DONE' ? 'done'
        : 'todo'
      ;(item.hours as any)[bucket] += t.estimated_hours ?? 0
    }
    if (!items.find(i => i.userId === 'unassigned')) items.push({ user: undefined, userId: 'unassigned', hours: { backlog: 0, todo: 0, inProgress: 0, done: 0 } })
    return items
  }, [filteredTasks, users, statusByTaskId])

  return (
    <Page>
      <Header
        user={user}
        onCreateBoard={() => {}}
        boards={boards}
        selectedBoardId={selectedBoard?.id ?? null}
        onSelectBoard={(id)=>{ const found = boards.find(b=>b.id===id); if(found) setSelectedBoard(found) }}
        onOpenSettings={()=> setShowSettings(true)}
        searchValue={query}
        onSearchChange={setQuery}
        onOpenUserManagement={user?.is_admin ? () => setShowUserManagement(true) : undefined}
      />

      {selectedBoard && (
        <>
          <WorkloadHeader board={selectedBoard} />
          
          {user?.is_admin && <PendingUsersPanel onUserApproved={() => userAPI.getUsers().then(setUsers)} />}
          
          <Grid>
            <WorkloadSummary items={summaryItems} />
            {perUser.map(c => (
              <UserWorkloadCard key={String(c.userId)} user={c.user} tasks={c.tasks} statusByTaskId={statusByTaskId} />
            ))}
          </Grid>
          <BoardSettingsDialog
            isOpen={showSettings}
            onClose={()=> setShowSettings(false)}
            onDeleteBoard={async ()=>{
              if(!selectedBoard) return
              const confirmed = window.confirm('Delete this board? This will remove all columns and tasks.')
              if(!confirmed) return
              try{
                await boardAPI.deleteBoard(selectedBoard.id)
                const next = boards.filter(b=> b.id !== selectedBoard.id)
                setBoards(next)
                setSelectedBoard(next[0] ?? null)
                setShowSettings(false)
              }catch{ /* no-op */ }
            }}
          />
          <UserManagementModal
            isOpen={showUserManagement}
            onClose={() => setShowUserManagement(false)}
            currentUserId={user?.id}
          />
        </>
      )}
    </Page>
  )
}


