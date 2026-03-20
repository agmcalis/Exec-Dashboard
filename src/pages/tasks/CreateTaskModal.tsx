import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Check } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '../../lib/utils'
import { KPI_DEFS, KPI_CATEGORIES } from '../../data/kpis'
import type { KpiCategory } from '../../data/kpis'
import { MOCK_METRICS } from '../../data/mockMetrics'
import { MOCK_USERS } from '../../data/mockUsers'
import type { Task } from '../../types/tasks'
import { linearForecast, forecastGoalQuarter, quartersUntil } from '../../lib/forecast'

// ─── Constants ────────────────────────────────────────────────────────────────

const TARGET_QUARTERS = [
  '1Q 2026', '2Q 2026', '3Q 2026', '4Q 2026',
  '1Q 2027', '2Q 2027', '3Q 2027', '4Q 2027',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUnitLabel(unit: string): string {
  if (unit === '%') return 'Percentage (%)'
  if (unit === 'ratio') return 'Ratio'
  if (unit === 'rate per 1,000') return 'Rate per 1,000'
  return unit.charAt(0).toUpperCase() + unit.slice(1)
}

function formatMetricValue(value: number, format: string): string {
  switch (format) {
    case 'ratio': return value.toFixed(2)
    case 'percent': return `${parseFloat(value.toFixed(2))}%`
    case 'rate': return parseFloat(value.toFixed(2)).toString()
    case 'index': return value.toFixed(2)
    default: return parseFloat(value.toFixed(2)).toString()
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: Task) => void
  currentUserId: string
  prefillKpiId?: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTaskModal({
  open,
  onClose,
  onSave,
  currentUserId,
  prefillKpiId,
}: CreateTaskModalProps) {
  const [search, setSearch] = useState('')
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(prefillKpiId ?? null)
  const [goalValue, setGoalValue] = useState('')
  const [targetQuarter, setTargetQuarter] = useState('')
  const [titleOverride, setTitleOverride] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState<string[]>([currentUserId])
  const searchRef = useRef<HTMLInputElement>(null)

  // Sync prefillKpiId when it changes
  useEffect(() => {
    if (open) {
      setSelectedKpiId(prefillKpiId ?? null)
      setGoalValue('')
      setTargetQuarter('')
      setTitleOverride('')
      setDescription('')
      setAssignedTo([currentUserId])
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 80)
    }
  }, [open, prefillKpiId, currentUserId])

  if (!open) return null

  const selectedKpiDef = KPI_DEFS.find(k => k.id === selectedKpiId)
  const selectedMetric = selectedKpiId ? MOCK_METRICS.find(m => m.kpiId === selectedKpiId) : null

  // Last 8 quarters of trend for mini sparkline
  const last8 = selectedMetric ? selectedMetric.rawTrend.slice(-8) : []
  const sparklineData = last8.map((v, i) => ({ i, v }))

  // AI Forecast
  let forecastText: string | null = null
  let suggestedGoal: number | null = null
  let suggestedQuarter: string | null = null

  if (selectedMetric) {
    const dir = selectedMetric.direction === 'higher_better' ? 'higher_better' : 'lower_better'
    // Suggest a realistic target: 10% improvement from current
    const current = selectedMetric.current
    const realistic = dir === 'lower_better'
      ? parseFloat((current * 0.90).toFixed(3))
      : parseFloat((current * 1.10).toFixed(3))

    suggestedQuarter = forecastGoalQuarter(selectedMetric.rawTrend, realistic, dir)
    suggestedGoal = realistic

    if (suggestedQuarter) {
      const qAhead = quartersUntil(suggestedQuarter)
      const forecasted = linearForecast(selectedMetric.rawTrend, qAhead)
      forecastText = `At your current trend, you'll reach ${formatMetricValue(forecasted, selectedMetric.format)} by ${suggestedQuarter}.`
    } else {
      forecastText = null
    }
  }

  // Filter KPIs by search
  const filteredKpis = KPI_DEFS.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.category.toLowerCase().includes(search.toLowerCase()),
  )

  // Group filtered KPIs by category
  const groupedFiltered = KPI_CATEGORIES
    .map(cat => ({
      cat,
      kpis: filteredKpis.filter(k => k.category === cat.id),
    }))
    .filter(g => g.kpis.length > 0)

  function toggleAssignee(userId: string) {
    setAssignedTo(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    )
  }

  function useSuggestedGoal() {
    if (suggestedGoal !== null) setGoalValue(String(suggestedGoal))
    if (suggestedQuarter) setTargetQuarter(suggestedQuarter)
  }

  function handleSave() {
    if (!selectedKpiDef || !selectedMetric || !goalValue || !targetQuarter) return
    const dir = selectedMetric.direction === 'higher_better' ? 'higher_better' : 'lower_better'
    const task: Task = {
      id: `task-${crypto.randomUUID()}`,
      kpiId: selectedKpiId!,
      title: titleOverride.trim() || selectedKpiDef.name,
      description: description.trim(),
      goalValue: parseFloat(goalValue),
      targetQuarter,
      currentValue: selectedMetric.current,
      direction: dir,
      status: 'on_track',
      createdBy: currentUserId,
      assignedTo: assignedTo.length > 0 ? assignedTo : [currentUserId],
      createdAt: new Date().toISOString(),
      comments: [],
    }
    onSave(task)
    onClose()
  }

  const canSave = !!selectedKpiId && !!goalValue && !isNaN(parseFloat(goalValue)) && !!targetQuarter

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
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-white">Create Task</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-2"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Section 1: Select KPI ── */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Select KPI
            </label>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search KPIs..."
              className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors mb-2"
            />
            <div className="max-h-52 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {groupedFiltered.map(({ cat, kpis }) => (
                <div key={cat.id}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 py-1.5 bg-surface-2">
                    {cat.label}
                  </p>
                  {kpis.map(kpi => {
                    const isSelected = selectedKpiId === kpi.id
                    return (
                      <button
                        key={kpi.id}
                        onClick={() => setSelectedKpiId(kpi.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-premier-muted border-l-2 border-premier'
                            : 'hover:bg-surface-2',
                        )}
                      >
                        <span className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-white' : 'text-slate-300',
                        )}>
                          {kpi.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium bg-surface-2 px-2 py-0.5 rounded-full">
                            {formatUnitLabel(kpi.unit)}
                          </span>
                          {isSelected && (
                            <Check size={13} strokeWidth={2.5} className="text-premier" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
              {groupedFiltered.length === 0 && (
                <p className="text-sm text-slate-500 px-3 py-4 text-center">No KPIs match your search</p>
              )}
            </div>
          </div>

          {/* ── Section 2: KPI Context (shown after KPI selected) ── */}
          {selectedMetric && selectedKpiDef && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
                  Current Performance
                </label>
                <div className="bg-surface-2 rounded-xl p-4 flex items-start gap-4">
                  {/* Current value */}
                  <div className="shrink-0">
                    <p className="text-2xl font-black text-white">
                      {formatMetricValue(selectedMetric.current, selectedMetric.format)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Current value</p>
                  </div>

                  {/* Sparkline */}
                  <div className="flex-1 h-[60px]">
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke="#24a3e3"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Benchmarks */}
                  <div className="shrink-0 text-right space-y-1">
                    {(Object.entries(selectedMetric.benchmarks) as [string, number][])
                    .filter(([, val]) => val !== undefined)
                    .slice(0, 3)
                    .map(([key, val]) => (
                      <div key={key}>
                        <p className="text-[9px] text-slate-600 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          {formatMetricValue(val, selectedMetric.format)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Section 3: AI Forecast ── */}
              <div className="bg-premier-muted border-l-2 border-premier rounded-r-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Sparkles size={14} strokeWidth={2} className="text-premier shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-premier mb-0.5">AI Forecast</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {forecastText ?? 'Your current trend does not indicate reaching a goal within 4 years. Consider setting a stretch target.'}
                      </p>
                    </div>
                  </div>
                  {suggestedGoal !== null && (
                    <button
                      onClick={useSuggestedGoal}
                      className="shrink-0 text-[11px] font-medium text-premier hover:text-premier-light transition-colors border border-premier/30 rounded-lg px-2.5 py-1 whitespace-nowrap"
                    >
                      Use suggested
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Section 4: Set Goal ── */}
          {selectedKpiDef && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Set Goal
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Goal Value</label>
                  <input
                    type="number"
                    value={goalValue}
                    onChange={e => setGoalValue(e.target.value)}
                    placeholder={selectedMetric ? String(selectedMetric.current) : '0'}
                    className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Target Quarter</label>
                  <select
                    value={targetQuarter}
                    onChange={e => setTargetQuarter(e.target.value)}
                    className="w-full bg-surface-2 border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors appearance-none"
                  >
                    <option value="" disabled>Select quarter...</option>
                    {TARGET_QUARTERS.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Task title (optional)</label>
                <input
                  type="text"
                  value={titleOverride}
                  onChange={e => setTitleOverride(e.target.value)}
                  placeholder={selectedKpiDef.name}
                  className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes or action plan (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the action plan or context for this goal..."
                  className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-xl px-3 py-2.5 focus:outline-none focus:border-premier transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Section 5: Assign To ── */}
          {selectedKpiDef && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Assigned To
              </label>
              <div className="space-y-1">
                {MOCK_USERS.map(user => {
                  const isChecked = assignedTo.includes(user.id)
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (!isCurrentUser) toggleAssignee(user.id)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                        isChecked ? 'bg-premier-muted' : 'hover:bg-surface-2',
                      )}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                        {user.initials}
                      </div>
                      {/* Name + title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[10px] font-semibold text-premier">You</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.title}</p>
                      </div>
                      {/* Checkbox */}
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                        isChecked ? 'bg-premier border-premier' : 'border-border',
                        isCurrentUser && 'opacity-70 cursor-not-allowed',
                      )}>
                        {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all',
              canSave
                ? 'bg-premier hover:bg-premier-hover text-white cursor-pointer'
                : 'bg-surface-2 text-slate-600 cursor-not-allowed',
            )}
          >
            Create Task
          </button>
        </div>
      </motion.div>
    </div>
  )
}
