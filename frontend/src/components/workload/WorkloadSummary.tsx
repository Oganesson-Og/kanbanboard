import React from 'react'
import styled from 'styled-components'
import { User } from '../../types'
import { Card } from '../primitives'

const Container = styled(Card)`
  display:flex; gap:16px; align-items:flex-end; padding:16px 16px; position:relative;
`

const BarStack = styled.div`
  display:flex; flex-direction:column; justify-content:flex-end; width:18px; height:120px;
  border-radius:6px; overflow:hidden; background: ${({theme})=>theme.color.surfaceMuted}; border:1px solid ${({theme})=>theme.color.border};
`
const BarSeg = styled.div<{ $h:number; $color:string }>`
  width:100%; height:${({$h})=>$h}px; background:${({$color})=>$color};
`
const Avatar = styled.div`
  width:24px; height:24px; border-radius:50%; background:${({theme})=>theme.color.brand[500]}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;
`
const Item = styled.div`
  display:flex; flex-direction:column; align-items:center; gap:6px;
`

const Title = styled.div`
  position:absolute; top:8px; left:12px; font-weight:700; color:${({theme})=>theme.color.text.primary};
`
function initials(name: string){ return name.split(' ').map(n=>n[0]).join('').toUpperCase() }

interface SummaryItem { user?: User; userId:number|'unassigned'; hours: { backlog:number; todo:number; inProgress:number; done:number } }
export interface WorkloadSummaryProps { items: SummaryItem[] }

const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({ items }) => {
  // Find the global maximum total hours across all users for proportional scaling
  const maxTotal = Math.max(1, ...items.map(it => it.hours.backlog + it.hours.todo + it.hours.inProgress + it.hours.done))

  return (
    <Container aria-label="Workload summary" $elevation={1}>
      <Title>Workload</Title>
      {items.map((it)=>{
        const total = it.hours.backlog + it.hours.todo + it.hours.inProgress + it.hours.done
        // Scale based on the global maximum, so bars are proportional across all users
        const scale = 120 / maxTotal
        return (
          <Item key={String(it.userId)}>
            <BarStack title={`${total}h`}>
              <BarSeg $h={Math.round(it.hours.done*scale)} $color="#22C55E" />
              <BarSeg $h={Math.round(it.hours.inProgress*scale)} $color="#6366F1" />
              <BarSeg $h={Math.round(it.hours.todo*scale)} $color="#94A3B8" />
              <BarSeg $h={Math.round(it.hours.backlog*scale)} $color="#E5E7EB" />
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

export default React.memo(WorkloadSummary)


