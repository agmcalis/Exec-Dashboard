import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, ClipboardList } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTasksStore } from '../../store/tasksStore'
import type { Task, TaskStatus } from '../../types/tasks'
import { KPI_DEFS } from '../../data/kpis'
import { MOCK_USERS } from '../../data/mockUsers'
import TaskDetailModal from './TaskDetailModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type SubTab = 'assigned' | 'created' | 'all'

interface TasksViewProps {
  currentUserId: string
  onCreateTask: (kpiId: string | null) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'on_track': return 'On Track'
    case 'at_risk':  return 'At Risk'
    case 'achieved': return 'Achieved'
    case 'missed':   return 'Missed'
  }
}

function statusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'on_track': return 'bg-green-900/40 text-better border border-green-800/30'
    case 'at_risk':  return 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
    case 'achieved': return 'bg-teal-900/40 text-teal-400 border border-teal-800/30'
    case 'missed':   return 'bg-red-900/40 text-worse border border-red-800/30'
  }
}

function statusProgressClass(status: TaskStatus): string {
  switch (status) {
    case 'on_track': return 'bg-better'
    case 'at_risk':  return 'bg-amber-400'
    case 'achieved': return 'bg-teal-400'
    case 'missed':   return 'bg-worse'
  }
}

function statusProgressPct(status: TaskStatus): number {
  switch (status) {
    case 'on_track': return 55
    case 'at_risk':  return 30
    case 'achieved': return 100
    case 'missed':   return 70
  }
}

function getKpiName(kpiId: string): string {
  return KPI_DEFS.find(k => k.id === kpiId)?.name ?? kpiId
}

function getUser(userId: string) {
  return MOCK_USERS.find(u => u.id === userId)
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  onClick: () => void
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const kpiName = getKpiName(task.kpiId)
  const creator = getUser(task.createdBy)
  const progress = statusProgressPct(task.status)

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 hover:bg-surface-2 transition-colors group"
    >
      {/* Top row: KPI name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-bold text-white leading-snug flex-1 min-w-0">
          {kpiName}
        </span>
        <span className={cn(
          'shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full leading-none',
          statusBadgeClass(task.status),
        )}>
          {statusLabel(task.status)}
        </span>
      </div>

      {/* Title (if different from KPI name) */}
      {task.title && task.title !== kpiName && (
        <p className="text-xs text-slate-400 -mt-1 leading-snug">{task.title}</p>
      )}

      {/* Goal + Target */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>Goal: <span className="text-slate-300 font-medium">{task.goalValue}</span></span>
        <span>Target: <span className="text-slate-300 font-medium">{task.targetQuarter}</span></span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', statusProgressClass(task.status))}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom row: assignees + comment count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Assignee avatars */}
          <div className="flex items-center -space-x-1.5">
            {task.assignedTo.slice(0, 3).map(uid => {
              const u = getUser(uid)
              return (
                <div
                  key={uid}
                  className="w-6 h-6 rounded-full bg-premier-muted border border-surface-2 flex items-center justify-center text-[9px] font-bold text-premier shrink-0"
                  title={u?.name ?? uid}
                >
                  {u?.initials ?? uid.slice(0, 2).toUpperCase()}
                </div>
              )
            })}
            {task.assignedTo.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-surface-3 border border-surface-2 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
          <span className="text-[11px] text-slate-500 truncate">
            by {creator?.firstName ?? task.createdBy}
          </span>
        </div>

        {/* Comment count */}
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <MessageSquare size={12} strokeWidth={2} />
          <span className="text-[11px]">{task.comments.length}</span>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
        <ClipboardList size={22} strokeWidth={1.5} className="text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">No tasks yet</p>
        <p className="text-xs text-slate-600 mt-1">Create a task to start tracking progress toward a goal.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 text-xs font-semibold text-premier hover:text-premier-light transition-colors"
      >
        <Plus size={13} strokeWidth={2.5} />
        Create your first task
      </button>
    </div>
  )
}

// ─── TasksView ────────────────────────────────────────────────────────────────

export default function TasksView({ currentUserId, onCreateTask }: TasksViewProps) {
  const { tasks, deleteTask } = useTasksStore()
  const [subTab, setSubTab] = useState<SubTab>('assigned')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filteredTasks = tasks.filter(t => {
    if (subTab === 'assigned') return t.assignedTo.includes(currentUserId)
    if (subTab === 'created')  return t.createdBy === currentUserId
    return true
  })

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'assigned', label: 'Assigned to Me' },
    { id: 'created',  label: 'Created by Me' },
    { id: 'all',      label: 'All Tasks' },
  ]

  function handleDelete(taskId: string) {
    deleteTask(taskId)
    setSelectedTask(null)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Tasks</h1>
        <button
          onClick={() => onCreateTask(null)}
          className="flex items-center gap-1.5 bg-premier hover:bg-premier-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Task
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-0 px-6 border-b border-border">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all',
              subTab === tab.id
                ? 'text-white border-premier'
                : 'text-slate-500 border-transparent hover:text-slate-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="px-6 py-6">
        {filteredTasks.length === 0 ? (
          <EmptyState onNew={() => onCreateTask(null)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onDelete={handleDelete}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
