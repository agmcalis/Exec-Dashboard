import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { X, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { MOCK_METRICS } from '../data/mockMetrics'
import type { MetricSnapshot } from '../data/mockMetrics'
import { HEALTH_SYSTEM } from '../data/facilities'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompareModalProps {
  open: boolean
  onClose: () => void
  kpiId: string
  kpiName: string
  hospitalIds: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(value: number, format: MetricSnapshot['format']): string {
  switch (format) {
    case 'ratio':    return value.toFixed(2)
    case 'percent':  return `${parseFloat(value.toFixed(2))}%`
    case 'stars':    return `${value} ★`
    case 'score':    return value.toFixed(1)
    case 'days':     return `${value.toFixed(1)}d`
    case 'index':    return value.toFixed(2)
    case 'currency': return `$${Math.round(value).toLocaleString()}`
    case 'rate':     return parseFloat(value.toFixed(2)).toString()
    default:         return String(value)
  }
}

function formatDelta(delta: number, format: MetricSnapshot['format']): string {
  const abs = Math.abs(delta)
  const sign = delta >= 0 ? '+' : '−'
  switch (format) {
    case 'ratio':    return `${sign}${abs.toFixed(2)}`
    case 'percent':  return `${sign}${parseFloat(abs.toFixed(2))}%`
    case 'stars':    return `${sign}${abs.toFixed(0)}`
    case 'score':    return `${sign}${abs.toFixed(1)}`
    case 'days':     return `${sign}${abs.toFixed(1)}d`
    case 'index':    return `${sign}${abs.toFixed(2)}`
    case 'currency': return `${sign}$${Math.round(abs).toLocaleString()}`
    case 'rate':     return `${sign}${parseFloat(abs.toFixed(2))}`
    default:         return `${sign}${abs}`
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { name: string; value: number } }>
  format: MetricSnapshot['format']
}

function ChartTooltip({ active, payload, format }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const { name, value } = payload[0].payload
  return (
    <div style={{
      background: '#0C2035',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8,
      fontSize: 11,
      padding: '7px 10px',
      color: '#fff',
      minWidth: 160,
    }}>
      <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>Value</span>
        <span style={{ fontWeight: 600 }}>{formatValue(value, format)}</span>
      </div>
    </div>
  )
}

// ─── CompareModal ─────────────────────────────────────────────────────────────

export default function CompareModal({ open, onClose, kpiId, kpiName, hospitalIds }: CompareModalProps) {
  const metric = MOCK_METRICS.find(m => m.kpiId === kpiId)

  if (!open) return null

  const sysAvg = metric?.current ?? 0

  // Build chart data sorted best-to-worst
  const chartData = hospitalIds.map(hid => {
    const hospital = HEALTH_SYSTEM.hospitals.find(h => h.id === hid)
    const value = metric?.byHospital[hid] ?? metric?.current ?? 0
    return {
      name: hospital?.name ?? hid,
      shortName: hospital?.city ?? hid,
      value,
      id: hid,
    }
  }).sort((a, b) => {
    if (metric?.direction === 'higher_better') return b.value - a.value
    if (metric?.direction === 'lower_better') return a.value - b.value
    return 0
  })

  function isBetter(value: number): boolean {
    if (!metric) return true
    if (metric.direction === 'lower_better') return value <= sysAvg
    if (metric.direction === 'higher_better') return value >= sysAvg
    return true
  }

  function getStatus(value: number): 'better' | 'worse' | 'equal' {
    if (!metric || metric.direction === 'neutral') return 'equal'
    if (metric.direction === 'lower_better') {
      if (value < sysAvg) return 'better'
      if (value > sysAvg) return 'worse'
      return 'equal'
    }
    if (value > sysAvg) return 'better'
    if (value < sysAvg) return 'worse'
    return 'equal'
  }

  const barHeight = hospitalIds.length * 52 + 40

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="compare-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="compare-modal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Hospital Comparison
                  </span>
                  <span className="text-lg font-bold text-white leading-tight">
                    {kpiName}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-2 shrink-0 mt-0.5"
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* System average callout */}
              <div className="bg-surface-2 px-5 py-3 flex items-center gap-4 border-b border-border shrink-0">
                <span className="text-sm text-slate-300">
                  <span className="font-semibold">System Avg:</span>{' '}
                  {metric ? formatValue(sysAvg, metric.format) : '—'}
                </span>
                <span className="text-xs text-slate-500">Rolling 12M · 4Q 2025</span>
              </div>

              {/* Bar chart */}
              {metric && (
                <div className="px-5 pt-5 pb-2 shrink-0">
                  <ResponsiveContainer width="100%" height={barHeight}>
                    <BarChart
                      layout="vertical"
                      data={chartData}
                      margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        type="number"
                        hide={true}
                        domain={['auto', 'auto']}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={80}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={(props) => (
                          <ChartTooltip
                            active={props.active}
                            payload={props.payload as unknown as ChartTooltipProps['payload']}
                            format={metric.format}
                          />
                        )}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <ReferenceLine
                        x={sysAvg}
                        stroke="rgba(255,255,255,0.3)"
                        strokeDasharray="4 3"
                        label={{ value: 'System Avg', position: 'top', fill: '#64748b', fontSize: 10 }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={isBetter(entry.value) ? '#22c55e' : '#ef4444'}
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="right"
                          formatter={(v: unknown) => formatValue(v as number, metric.format)}
                          style={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Ranked table */}
              <div className="border-t border-border">
                {/* Table header */}
                <div className="bg-surface-2 px-5 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Hospital</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">vs Sys Avg</span>
                  <span className="text-right">Status</span>
                </div>

                {/* Table rows */}
                {metric && chartData.map((entry) => {
                  const delta = entry.value - sysAvg
                  const status = getStatus(entry.value)
                  const deltaColor = status === 'better'
                    ? 'text-better'
                    : status === 'worse'
                      ? 'text-worse'
                      : 'text-slate-400'

                  const StatusIcon =
                    status === 'better' ? ArrowUpRight
                    : status === 'worse' ? ArrowDownRight
                    : Minus

                  return (
                    <div
                      key={entry.id}
                      className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 border-t border-border hover:bg-surface-2 transition-colors items-center"
                    >
                      {/* Hospital name */}
                      <span className="text-sm font-medium text-white truncate">
                        {entry.name}
                      </span>

                      {/* Value */}
                      <span className="text-sm font-semibold text-white tabular-nums text-right">
                        {formatValue(entry.value, metric.format)}
                      </span>

                      {/* vs Sys Avg */}
                      <span className={`text-sm font-semibold tabular-nums text-right ${deltaColor}`}>
                        {formatDelta(delta, metric.format)}
                      </span>

                      {/* Status pill */}
                      <div className="flex justify-end">
                        {status === 'better' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-900/40 text-better">
                            <StatusIcon size={10} strokeWidth={2.5} />
                            Better
                          </span>
                        )}
                        {status === 'worse' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-900/40 text-worse">
                            <StatusIcon size={10} strokeWidth={2.5} />
                            Worse
                          </span>
                        )}
                        {status === 'equal' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400">
                            <StatusIcon size={10} strokeWidth={2.5} />
                            Equal
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 py-3 flex justify-end shrink-0">
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-slate-400 hover:text-white border border-border hover:border-border-hi bg-transparent hover:bg-surface-2 px-4 py-2 rounded-lg transition-all duration-150"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
