import { Task, User } from '../types'

export type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface WorkloadUser extends User {
  capacityHoursPerWeek?: number
  role?: string
  active?: boolean
}

export interface WorkloadMetrics {
  notDoneCount: number
  doneCount: number
  hoursNotDone: number
  hoursDone: number
  remainingHours?: number
  wipCount: number
  completionRatio: number
}

export interface WorkloadPerUser {
  userId: number | 'unassigned'
  user?: WorkloadUser
  tasks: Task[]
  metrics: WorkloadMetrics
}

export const statusFromColumnName = (name: string): Status => {
  const key = name.trim().toLowerCase()
  if (key === 'backlog') return 'BACKLOG'
  if (key === 'to do' || key === 'todo') return 'TODO'
  if (key === 'in progress') return 'IN_PROGRESS'
  return 'DONE'
}

export function groupTasksByAssignee(tasks: Task[]): Map<number | 'unassigned', Task[]> {
  const map = new Map<number | 'unassigned', Task[]>()
  for (const task of tasks) {
    const key = task.assignee_id ?? 'unassigned'
    const arr = map.get(key) || []
    arr.push(task)
    map.set(key, arr)
  }
  return map
}

function isDoneStatus(task: Task): boolean {
  // DONE is determined by column association in this app; fall back to completed_hours >= estimated_hours
  // The Column name is not on Task, so callers pass in correct task set by column.
  return false
}

export function computeMetricsForTasks(tasks: Task[], options?: { capacityHoursPerWeek?: number }): WorkloadMetrics {
  let notDoneCount = 0
  let doneCount = 0
  let hoursNotDone = 0
  let hoursDone = 0
  let wipCount = 0

  for (const t of tasks) {
    const est = t.estimated_hours ?? 0
    // We infer DONE from column when aggregating; if unavailable, consider completed_hours >= est
    const completed = t.completed_hours ?? 0
    const wasDone = completed > 0 && completed >= est && est > 0

    if (wasDone) {
      doneCount += 1
      hoursDone += est
    } else {
      notDoneCount += 1
      hoursNotDone += est
    }

    // Infer WIP when hours_used > 0 or estimated and not done; callers may override based on column
    if (!wasDone && (t.hours_used ?? 0) > 0) {
      wipCount += 1
    }
  }

  const total = notDoneCount + doneCount
  const completionRatio = total === 0 ? 0 : doneCount / total
  const remainingHours = options?.capacityHoursPerWeek !== undefined
    ? options.capacityHoursPerWeek - hoursNotDone
    : undefined

  return { notDoneCount, doneCount, hoursNotDone, hoursDone, remainingHours, wipCount, completionRatio }
}

export function flattenBoardTasks(board: { columns: { id: number; name: string; tasks: Task[] }[] }): Task[] {
  const all: Task[] = []
  for (const c of board.columns) {
    for (const t of c.tasks) {
      all.push(t)
    }
  }
  return all
}


