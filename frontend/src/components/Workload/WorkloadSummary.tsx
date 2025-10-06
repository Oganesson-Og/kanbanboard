import React from 'react'
import styled from 'styled-components'
import { User } from '../../types'

const Container = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.surface};
  overflow-x: auto;
`

const BarStack = styled.div`
  display: flex; flex-direction: column; justify-content: flex-end; width: 18px; height: 80px; border-radius: 6px; overflow: hidden; background: #F3F4F6; border: 1px solid #E5E7EB;
`
const BarSeg = styled.div<{ $h: number; $class?: string }>`
  width: 100%;
  height: ${({ $h }) => $h}px;
  opacity: 0.9;
`

const Avatar = styled.div`
  width: 24px; height: 24px; border-radius: 50%;
  background: ${({ theme }) => theme.color.brand[500]};
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
`

const Item = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
`

export function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

interface SummaryItem {
  user?: User
  userId: number | 'unassigned'
  hours: { backlog: number; todo: number; inProgress: number; done: number }
}

export interface WorkloadSummaryProps {
  items: SummaryItem[]
}

const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({ items }) => {
  return (
    <Container aria-label="Workload summary">
      {items.map((it) => {
        const total = it.hours.backlog + it.hours.todo + it.hours.inProgress + it.hours.done
        const scale = total > 0 ? 80 / total : 0
        return (
        <Item key={String(it.userId)}>
          <BarStack title={`${total}h`}>
            <BarSeg className="wl-bar-done" $h={Math.round(it.hours.done * scale)} />
            <BarSeg className="wl-bar-progress" $h={Math.round(it.hours.inProgress * scale)} />
            <BarSeg className="wl-bar-todo" $h={Math.round(it.hours.todo * scale)} />
            <BarSeg className="wl-bar-backlog" $h={Math.round(it.hours.backlog * scale)} />
          </BarStack>
          <Avatar title={it.user ? (it.user.full_name || it.user.username) : 'Unassigned'}>
            {it.user ? initials(it.user.full_name || it.user.username) : '—'}
          </Avatar>
        </Item>
        )
      })}
    </Container>
  )
}

export default WorkloadSummary


