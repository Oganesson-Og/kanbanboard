import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Task, User } from '../../types'
import DonutProgress from './DonutProgress'
import SparkBars from './SparkBars'
import TaskRow from './TaskRow'
import { Card } from '../primitives'

const HeaderRow = styled.div`
  display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;
`
const Left = styled.div`
  display:flex; align-items:center; gap:10px;
`
const Avatar = styled.div`
  width:40px; height:40px; border-radius:50%; background: ${({theme})=>theme.color.brand[500]}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700;
`
const Name = styled.div`
  font-weight:700; color:${({theme})=>theme.color.text.primary};
`
const KPI = styled.div`
  display:inline-flex; align-items:center; gap:6px; font-size:12px; color:${({theme})=>theme.color.text.muted}; margin-right:10px;
  & > span{ color:${({theme})=>theme.color.text.secondary}; }
`

const StatusBar = styled.div`
  height:8px; border-radius:6px; overflow:hidden; display:flex; background:${({theme})=>theme.color.surfaceMuted}; border:1px solid ${({theme})=>theme.color.border};
  & > div{ height:100%; }
`
const MetaRow = styled.div`
  display:flex; align-items:center; justify-content:space-between; margin:10px 0; font-size:12px; color:${({theme})=>theme.color.text.secondary};
`
const Warn = styled.span`
  color: ${({theme})=> theme.chart?.warn || '#B45309'};
  background: ${({theme})=> (theme.chart?.warn as string || '#F59E0B') + '22'};
  border: 1px solid ${({theme})=> (theme.chart?.warn as string || '#F59E0B') + '55'};
  padding:2px 6px; border-radius:999px; font-size:12px;
`
const SparkWrap = styled.div`
  color: ${({theme})=>theme.chart?.neutral || theme.color.text.muted}; margin:8px 0 4px;
`
function initials(name: string){ return name.split(' ').map(n=>n[0]).join('').toUpperCase() }

export interface UserWorkloadCardProps {
  user?: User
  tasks: Task[]
  statusByTaskId?: Record<number, 'BACKLOG'|'TODO'|'IN_PROGRESS'|'DONE'>
}

function computeSpark(tasks: Task[]): number[]{
  if(tasks.length===0) return [1,1,1,1,1,1]
  const now = Date.now()
  const buckets = new Array(6).fill(0)
  for(const t of tasks){
    const ts = new Date(t.created_at).getTime()
    const weeksAgo = Math.floor((now - ts) / (7*24*3600*1000))
    const idx = Math.max(0, Math.min(5, weeksAgo))
    buckets[5-idx] += (t.estimated_hours ?? 1)
  }
  return buckets
}

const UserWorkloadCard: React.FC<UserWorkloadCardProps> = ({ user, tasks, statusByTaskId }) => {
  const counts = useMemo(()=>{
    let done=0, not=0, wip=0
    for(const t of tasks){
      const st = statusByTaskId?.[t.id]
      if(st==='DONE') done++
      else if(st==='IN_PROGRESS') wip++
      else not++
    }
    return {done, not, wip}
  }, [tasks, statusByTaskId])

  const pct = useMemo(()=>{
    const total = counts.done + counts.not
    return total===0 ? 0 : (counts.done/total)*100
  }, [counts])

  const remainingHrs = useMemo(()=> tasks.reduce((s,t)=> s + (statusByTaskId?.[t.id]==='DONE' ? 0 : (t.estimated_hours ?? 0)), 0), [tasks, statusByTaskId])
  const missingEst = useMemo(()=> tasks.filter(t=> (statusByTaskId?.[t.id]!=='DONE') && (t.estimated_hours==null)).length, [tasks, statusByTaskId])
  const spark = useMemo(()=> computeSpark(tasks), [tasks])

  const preview = useMemo(()=> tasks.slice(0,4), [tasks])

  return (
    <Card role="region" aria-label={`${user ? (user.full_name || user.username) : 'Unassigned'} workload`}>
      <HeaderRow>
        <Left>
          <Avatar>{user ? initials(user.full_name || user.username) : '—'}</Avatar>
          <div>
            <Name>{user ? (user.full_name || user.username) : 'Unassigned'}</Name>
            <div>
              <KPI>{counts.not}<span>Not done</span></KPI>
              <KPI>{counts.done}<span>Done</span></KPI>
            </div>
          </div>
        </Left>
        <div style={{ color: '#6366F1' }}>
          <DonutProgress value={pct} label={`${user ? (user.full_name || user.username) : 'Unassigned'} progress`} />
        </div>
      </HeaderRow>

      <StatusBar aria-hidden>
        <div style={{width: `${counts.not/(counts.not+counts.wip+counts.done||1)*100}%`, background:'#CBD5E1'}} />
        <div style={{width: `${counts.wip/(counts.not+counts.wip+counts.done||1)*100}%`, background:'#818CF8'}} />
        <div style={{width: `${counts.done/(counts.not+counts.wip+counts.done||1)*100}%`, background:'#22C55E'}} />
      </StatusBar>

      <MetaRow>
        <small>Time estimate</small>
        <strong>{Math.round(remainingHrs*10)/10}h</strong>
        {missingEst>0 && <Warn title="Tasks without estimate">⚠ {missingEst}</Warn>}
      </MetaRow>

      <SparkWrap>
        <SparkBars series={spark} ariaLabel="Recent workload" />
      </SparkWrap>

      <div role="list">
        {preview.map(t => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>

      {tasks.length>4 && (
        <button style={{marginTop:8, fontSize:12, color:'inherit', background:'transparent', border:'none'}} aria-label={`View all ${tasks.length} tasks`} onClick={()=>{ /* TODO: hook up panel */ }}>
          View all ({tasks.length})
        </button>
      )}
    </Card>
  )
}

export default React.memo(UserWorkloadCard)


