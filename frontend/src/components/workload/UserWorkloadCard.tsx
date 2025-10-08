import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Task, User } from '../../types'
import ProgressRing from './ProgressRing'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.color.surface};
`

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
`

const Avatar = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ theme }) => theme.color.brand[500]}; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
`

const Name = styled.div`
  font-weight: 700; color: ${({ theme }) => theme.color.text.primary};
`

const Meta = styled.div`
  color: ${({ theme }) => theme.color.text.muted}; font-size: 12px;
`

const Grid = styled.div`
  display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center;
`

const Chips = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap;
`

const Chip = styled.span`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 999px; padding: 2px 8px; font-size: 12px;
  background: ${({ theme }) => theme.color.surfaceMuted};
`

const Section = styled.details`
  margin-top: 8px; background: ${({ theme }) => theme.color.surfaceMuted};
  border: 1px solid ${({ theme }) => theme.color.border}; border-radius: 8px; padding: 8px 10px;
`

const TaskRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 6px 0;
  border-bottom: 1px dashed ${({ theme }) => theme.color.border};
  &:last-child { border-bottom: none; }
`

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatHours(h: number | undefined) {
  if (!h || !isFinite(h) || h === 0) return '0h'
  if (h >= 8) { const d = Math.floor(h / 8); const rem = Math.round((h % 8) * 10) / 10; return `${d}d${rem ? ' ' + rem + 'h' : ''}` }
  return `${Math.round(h * 10) / 10}h`
}

export interface UserWorkloadCardProps {
  user?: User
  tasks: Task[]
  statusByTaskId?: Record<number, 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE'>
  collapseDefaults?: { todo?: boolean; inProgress?: boolean; done?: boolean }
}

const UserWorkloadCard: React.FC<UserWorkloadCardProps> = ({ user, tasks, statusByTaskId, collapseDefaults }) => {
  const byStatus = (status: 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE') => tasks.filter(t => statusByTaskId?.[t.id] === status)
  const done = byStatus('DONE')
  const wip = byStatus('IN_PROGRESS')
  const todo = byStatus('TODO')
  const backlog = byStatus('BACKLOG')
  const notDone = [...todo, ...backlog]

  const estNotDone = notDone.reduce((s, t) => s + (t.estimated_hours ?? 0), 0)
  const estDone = done.reduce((s, t) => s + (t.estimated_hours ?? 0), 0)
  const completion = (done.length + notDone.length) === 0 ? 0 : done.length / (done.length + notDone.length)

  const top = useMemo(() => (arr: Task[]) => arr.slice(0, 3), [])

  return (
    <Card>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar>{user ? initials(user.full_name || user.username) : '—'}</Avatar>
          <div>
            <Name>{user ? (user.full_name || user.username) : 'Unassigned'}</Name>
            <Meta>{notDone.length} Not done • {done.length} Done</Meta>
          </div>
        </div>
      </Header>

      <Grid>
        <ProgressRing progress={completion} />
        <div>
          <Chips>
            <Chip>Not done: {formatHours(estNotDone)}</Chip>
            <Chip>Done: {formatHours(estDone)}</Chip>
            <Chip>WIP: {wip.length}</Chip>
          </Chips>

          {notDone.length > 0 && (
            <Section open={collapseDefaults?.todo ?? true}>
              <summary>To Do</summary>
              {top(notDone).map(t => (
                <TaskRow key={t.id}>
                  <span>{t.title}</span>
                  <span style={{ color: '#64748B', fontSize: 12 }}>{t.estimated_hours ? `${t.estimated_hours}h` : ''}</span>
                </TaskRow>
              ))}
            </Section>
          )}

          {wip.length > 0 && (
            <Section open={collapseDefaults?.inProgress ?? true}>
              <summary>In Progress</summary>
              {top(wip).map(t => (
                <TaskRow key={t.id}>
                  <span>{t.title}</span>
                  <span style={{ color: '#64748B', fontSize: 12 }}>{t.estimated_hours ? `${t.estimated_hours}h` : ''}</span>
                </TaskRow>
              ))}
            </Section>
          )}

          {done.length > 0 && (
            <Section open={collapseDefaults?.done ?? false}>
              <summary>Done</summary>
              {top(done).map(t => (
                <TaskRow key={t.id}>
                  <span>{t.title}</span>
                  <span style={{ color: '#64748B', fontSize: 12 }}>{t.estimated_hours ? `${t.estimated_hours}h` : ''}</span>
                </TaskRow>
              ))}
            </Section>
          )}
        </div>
      </Grid>
    </Card>
  )
}

export default UserWorkloadCard


