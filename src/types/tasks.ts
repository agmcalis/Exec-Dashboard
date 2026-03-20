export type TaskStatus = 'on_track' | 'at_risk' | 'achieved' | 'missed'

export interface TaskComment {
  id: string
  userId: string
  text: string
  createdAt: string // ISO string
}

export interface Task {
  id: string
  kpiId: string
  title: string           // defaults to KPI name if blank
  description: string
  goalValue: number
  targetQuarter: string   // e.g. "2Q 2026"
  currentValue: number    // value at time of creation
  direction: 'lower_better' | 'higher_better'
  status: TaskStatus
  createdBy: string       // userId
  assignedTo: string[]    // userIds (empty = just creator)
  createdAt: string       // ISO string
  comments: TaskComment[]
}
