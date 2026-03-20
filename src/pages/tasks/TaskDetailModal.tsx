import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Trash2, MessageSquare } from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { cn } from '../../lib/utils'
import type { Task, TaskStatus, TaskComment } from '../../types/tasks'
import { KPI_DEFS } from '../../data/kpis'
import { MOCK_METRICS, TREND_QUARTERS } from '../../data/mockMetrics'
import { MOCK_USERS } from '../../data/mockUsers'
import { linearForecast, quartersUntil } from '../../lib/forecast'
import { useTasksStore } from '../../store/tasksStore'

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

function formatMetricValue(value: number, format: string): string {
  switch (format) {
    case 'ratio':   return value.toFixed(2)
    case 'percent': return `${parseFloat(value.toFixed(2))}%`
    case 'rate':    return parseFloat(value.toFixed(2)).toString()
    case 'index':   return value.toFixed(2)
    default:        return parseFloat(value.toFixed(2)).toString()
  }
}

function formatCommentDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getUser(userId: string) {
  return MOCK_USERS.find(u => u.id === userId)
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailModalProps {
  task: Task | null
  onClose: () => void
  onDelete: (taskId: string) => void
  currentUserId: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskDetailModal({
  task,
  onClose,
  onDelete,
  currentUserId,
}: TaskDetailModalProps) {
  const { addComment } = useTasksStore()
  const [commentText, setCommentText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setCommentText('')
    setShowDeleteConfirm(false)
  }, [task?.id])

  if (!task) return null

  const kpiDef = KPI_DEFS.find(k => k.id === task.kpiId)
  const metric = MOCK_METRICS.find(m => m.kpiId === task.kpiId)
  const creator = getUser(task.createdBy)
  const isCreator = task.createdBy === currentUserId

  // ── Build chart data ──────────────────────────────────────────────────────
  // Show last 12 quarters of historical data + projected quarters up to target
  const historyCount = 12
  const historicalTrend = metric ? metric.rawTrend.slice(-historyCount) : []
  const historyQuarters = TREND_QUARTERS.slice(-historyCount)

  // How many quarters until target quarter
  const qAhead = quartersUntil(task.targetQuarter)

  // Build projected data points
  const projectedPoints: { quarter: string; projected: number }[] = []
  if (metric && qAhead > 0) {
    for (let i = 1; i <= Math.min(qAhead, 8); i++) {
      const v = linearForecast(metric.rawTrend, i)
      // Build quarter label
      const baseQ = 4, baseY = 2025
      const totalQ = baseQ + i
      const q = ((totalQ - 1) % 4) + 1
      const y = baseY + Math.floor((totalQ - 1) / 4)
      projectedPoints.push({ quarter: `${q}Q ${y}`, projected: parseFloat(v.toFixed(4)) })
    }
  }

  // Merge into chart data
  const chartData: { quarter: string; actual?: number; projected?: number }[] = [
    ...historicalTrend.map((v, i) => ({
      quarter: historyQuarters[i] ?? `Q${i}`,
      actual: v,
    })),
    // Transition point — last historical value starts the projected line
    ...(projectedPoints.length > 0
      ? [{ quarter: projectedPoints[0].quarter, actual: undefined, projected: historicalTrend[historicalTrend.length - 1] }]
      : []),
    ...projectedPoints.slice(1).map(p => ({ quarter: p.quarter, projected: p.projected })),
  ]

  // AI insight
  const forecastedValue = metric && qAhead > 0
    ? formatMetricValue(linearForecast(metric.rawTrend, qAhead), metric.format)
    : null

  const insightClass = task.status === 'on_track' || task.status === 'achieved'
    ? 'text-better'
    : 'text-amber-400'

  function handlePostComment() {
    if (!commentText.trim() || !task) return
    const comment: TaskComment = {
      id: `c-${crypto.randomUUID()}`,
      userId: currentUserId,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    }
    addComment(task.id, comment)
    setCommentText('')
  }

  function handleDelete() {
    if (!task) return
    onDelete(task.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="bg-surface border border-border-hi rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white leading-tight">
                {kpiDef?.name ?? task.kpiId}
              </h2>
              {task.title && task.title !== kpiDef?.name && (
                <p className="text-xs text-slate-400 mt-0.5">{task.title}</p>
              )}
            </div>
            <span className={cn(
              'shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full leading-none mt-0.5',
              statusBadgeClass(task.status),
            )}>
              {statusLabel(task.status)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-2 shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Top info row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-2 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Goal</p>
              <p className="text-xl font-black text-white">
                {metric ? formatMetricValue(task.goalValue, metric.format) : task.goalValue}
              </p>
              <p className="text-xs text-slate-400">by {task.targetQuarter}</p>
            </div>
            <div className="bg-surface-2 rounded-xl p-3 space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Team</p>
              <p className="text-xs text-slate-400">
                Created by <span className="text-slate-300 font-medium">{creator?.name ?? task.createdBy}</span>
              </p>
              {task.assignedTo.length > 0 && (
                <div className="flex items-center -space-x-1.5">
                  {task.assignedTo.map(uid => {
                    const u = getUser(uid)
                    return (
                      <div
                        key={uid}
                        title={u?.name ?? uid}
                        className="w-6 h-6 rounded-full bg-premier-muted border border-surface flex items-center justify-center text-[9px] font-bold text-premier"
                      >
                        {u?.initials ?? uid.slice(0, 2).toUpperCase()}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chart section */}
          {metric && chartData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trend & Forecast</p>
              <div className="bg-surface-2 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="quarter"
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0C2035',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8,
                        fontSize: 11,
                        color: '#e2e8f0',
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: 2 }}
                    />
                    {/* Goal reference line */}
                    <ReferenceLine
                      y={task.goalValue}
                      stroke="#24a3e3"
                      strokeDasharray="4 4"
                      label={{ value: 'Goal', fill: '#24a3e3', fontSize: 9, position: 'insideTopRight' }}
                    />
                    {/* Historical line */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                    {/* Projected line */}
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* AI insight */}
                {forecastedValue && (
                  <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
                    <Sparkles size={13} strokeWidth={2} className="text-premier shrink-0" />
                    <p className="text-xs text-slate-400">
                      At current pace:{' '}
                      <span className={cn('font-semibold', insightClass)}>
                        {forecastedValue}
                      </span>
                      {' '}forecasted by {task.targetQuarter}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <div className="h-px bg-border mb-4" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Comments */}
          <div>
            <div className="h-px bg-border mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} strokeWidth={2} className="text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Discussion
              </p>
              {task.comments.length > 0 && (
                <span className="text-[10px] font-bold bg-surface-2 text-slate-400 px-2 py-0.5 rounded-full">
                  {task.comments.length}
                </span>
              )}
            </div>

            {/* Comment list */}
            {task.comments.length > 0 && (
              <div className="space-y-4 mb-4">
                {task.comments.map(comment => {
                  const author = getUser(comment.userId)
                  return (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-premier-muted flex items-center justify-center text-[10px] font-bold text-premier shrink-0">
                        {author?.initials ?? comment.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-semibold text-white">
                            {author?.name ?? comment.userId}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add comment */}
            <div className="space-y-2">
              <textarea
                ref={commentInputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                placeholder="Add a note or update..."
                className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className={cn(
                    'text-sm font-semibold px-4 py-2 rounded-xl transition-all',
                    commentText.trim()
                      ? 'bg-premier hover:bg-premier-hover text-white cursor-pointer'
                      : 'bg-surface-2 text-slate-600 cursor-not-allowed',
                  )}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          {isCreator ? (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Delete this task?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs font-semibold text-white bg-worse hover:bg-red-600 transition-colors px-3 py-1.5 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-worse hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} strokeWidth={2} />
                Delete Task
              </button>
            )
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
