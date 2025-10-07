import React from 'react'
import styled from 'styled-components'
import { Task } from '../../types'

const Row = styled.div`
  display:flex; align-items:center; justify-content:space-between; padding:8px 0; font-size:14px;
  border-top: 1px solid ${({theme})=>theme.color.border};
  &:first-child{ border-top: 0; }
`

const Title = styled.span`
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color: ${({theme})=>theme.color.text.primary};
`
const Estimate = styled.span`
  color: ${({theme})=>theme.color.text.secondary}; font-size:12px; margin-left: 12px; padding:2px 8px; border-radius:999px;
  background: ${({theme})=>theme.color.surfaceMuted}; border:1px solid ${({theme})=>theme.color.border};
`

const StatusChip = styled.span<{ $status: 'READY'|'IN PROGRESS'|'REVIEW'|'DONE' }>`
  display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:12px; margin-right:8px; border:1px solid ${({theme})=>theme.color.border};
  color: ${({$status, theme})=> {
    if ($status==='DONE') return theme.chart?.good || theme.color.text.secondary
    if ($status==='IN PROGRESS') return (theme.brand as any)?.solid || theme.color.text.secondary
    if ($status==='REVIEW') return theme.chart?.warn || theme.color.text.secondary
    return theme.chart?.neutral || theme.color.text.secondary
  }};
  background: ${({$status, theme})=> {
    const good = (theme.chart?.good as string) || '#22C55E'
    const warn = (theme.chart?.warn as string) || '#F59E0B'
    const neutral = (theme.chart?.neutral as string) || '#94A3B8'
    const brandSubtle = (theme.brand as any)?.subtle || theme.color.brand[50]
    if ($status==='DONE') return good + '22'
    if ($status==='IN PROGRESS') return brandSubtle
    if ($status==='REVIEW') return warn + '22'
    return neutral + '22'
  }};
`

export interface TaskRowProps { task: Task; status?: 'READY'|'IN PROGRESS'|'REVIEW'|'DONE' }

const TaskRow: React.FC<TaskRowProps> = ({ task, status }) => {
  return (
    <Row>
      <div style={{display:'flex', alignItems:'center', minWidth:0}}>
        {status && <StatusChip aria-label={`Status ${status}`} $status={status}>{status}</StatusChip>}
        <Title title={task.title}>{task.title}</Title>
      </div>
      <Estimate>{task.estimated_hours ? `${task.estimated_hours}h` : ''}</Estimate>
    </Row>
  )
}

export default React.memo(TaskRow)


