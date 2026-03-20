import { useState } from 'react'
import { TrendingDown, TrendingUp, Minus, LayoutGrid, TableProperties, TrendingUp as TrendingUpIcon, Settings2, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import type { SavedView, ViewContext } from '../types/wizard'
import { DEFAULT_TIME_PERIOD } from '../types/wizard'
import type { TimePeriod, PeriodType } from '../types/wizard'
import { KPI_DEFS, KPI_CATEGORIES } from '../data/kpis'
import type { KpiDef } from '../data/kpis'
import { BENCHMARK_DEFS } from '../data/benchmarks'
import type { BenchmarkDef } from '../data/benchmarks'
import { HEALTH_SYSTEM } from '../data/facilities'
import { MOCK_METRICS, AVAILABLE_QUARTERS, formatQuarterLabel, getValuesForPeriod } from '../data/mockMetrics'
import type { MetricSnapshot, PerformanceDirection } from '../data/mockMetrics'
import ViewTabs from '../components/layout/ViewTabs'
import KpiManageModal from '../components/KpiManageModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'card' | 'table' | 'trend'

interface GroupedCategory {
  category: { id: string; label: string; shortLabel: string }
  kpis: KpiDef[]
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

function isBetter(current: number, benchmark: number, direction: PerformanceDirection): boolean {
  if (direction === 'lower_better') return current < benchmark
  if (direction === 'higher_better') return current > benchmark
  return true // neutral
}

function getCardBorderClass(
  current: number,
  metric: MetricSnapshot,
  selectedBenchmarkIds: string[]
): string {
  const values = selectedBenchmarkIds
    .map(id => metric.benchmarks[id])
    .filter((v): v is number => v !== undefined)

  if (values.length === 0) return ''

  const betterCount = values.filter(v => isBetter(current, v, metric.direction)).length

  if (betterCount === values.length)  return 'border-l-4 border-l-better'
  if (betterCount === 0)              return 'border-l-4 border-l-worse'
  return 'border-l-4 border-l-amber-500'
}

function getPerformanceDotClass(
  current: number,
  metric: MetricSnapshot,
  selectedBenchmarkIds: string[]
): string {
  const values = selectedBenchmarkIds
    .map(id => metric.benchmarks[id])
    .filter((v): v is number => v !== undefined)

  if (values.length === 0) return 'bg-slate-500'

  const betterCount = values.filter(v => isBetter(current, v, metric.direction)).length

  if (betterCount === values.length)  return 'bg-better'
  if (betterCount === 0)              return 'bg-worse'
  return 'bg-amber-500'
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  metric: MetricSnapshot
  kpiName: string
  selectedBenchmarkIds: string[]
  timePeriod: TimePeriod
  delay: number
}

function KpiCard({ metric, kpiName, selectedBenchmarkIds, timePeriod, delay }: KpiCardProps) {
  const { current, prior, periodLabel } = getValuesForPeriod(metric, timePeriod.endingQuarter, timePeriod.type)
  const borderClass = getCardBorderClass(current, metric, selectedBenchmarkIds)

  // Delta
  const delta = current - prior
  const deltaAbs = Math.abs(delta)

  let deltaGood: boolean
  if (metric.direction === 'neutral') {
    deltaGood = true
  } else if (metric.direction === 'lower_better') {
    deltaGood = delta < 0
  } else {
    deltaGood = delta > 0
  }

  const deltaColor =
    metric.direction === 'neutral'
      ? 'bg-slate-700/60 text-slate-300'
      : deltaGood
        ? 'bg-green-900/40 text-better'
        : 'bg-red-900/40 text-worse'

  const DeltaIcon =
    metric.direction === 'neutral'
      ? Minus
      : delta < 0
        ? TrendingDown
        : TrendingUp

  // Benchmark rows — cap at 3
  const benchmarksToShow = selectedBenchmarkIds.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 ${borderClass}`}
    >
      {/* Top — KPI name */}
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">
        {kpiName}
      </p>

      {/* Middle — value + delta */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-white leading-none">
          {formatValue(current, metric.format)}
        </span>
        <div className="flex flex-col gap-0.5 pb-0.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${deltaColor}`}
          >
            <DeltaIcon size={10} strokeWidth={2.5} />
            {formatValue(deltaAbs, metric.format)}
          </span>
          <span className="text-[10px] text-slate-600">{periodLabel}</span>
        </div>
      </div>

      {/* Bottom — benchmark comparisons */}
      {benchmarksToShow.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-border">
          {benchmarksToShow.map(benchId => {
            const benchValue = metric.benchmarks[benchId]
            if (benchValue === undefined) return null

            const benchDef = BENCHMARK_DEFS.find(b => b.id === benchId)
            const label = benchDef?.name ?? benchId
            const better = isBetter(current, benchValue, metric.direction)

            return (
              <div key={benchId} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 truncate">{label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-slate-400">
                    {formatValue(benchValue, metric.format)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      better
                        ? 'bg-green-900/40 text-better'
                        : 'bg-red-900/40 text-worse'
                    }`}
                  >
                    {better ? 'Better' : 'Worse'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─── CardContent ──────────────────────────────────────────────────────────────

interface CardContentProps {
  grouped: GroupedCategory[]
  selectedBenchmarkIds: string[]
  metricsMap: Record<string, MetricSnapshot>
  timePeriod: TimePeriod
}

function CardContent({ grouped, selectedBenchmarkIds, metricsMap, timePeriod }: CardContentProps) {
  return (
    <div className="px-6 py-6 space-y-8">
      {grouped.map((group, groupIndex) => {
        const sectionDelay = groupIndex * 0.06

        return (
          <motion.section
            key={group.category.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: sectionDelay,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {group.category.label}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.kpis.map((kpi, cardIndex) => {
                const metric = metricsMap[kpi.id]
                if (!metric) return null

                const cardDelay = sectionDelay + cardIndex * 0.04

                return (
                  <KpiCard
                    key={kpi.id}
                    metric={metric}
                    kpiName={kpi.name}
                    selectedBenchmarkIds={selectedBenchmarkIds}
                    timePeriod={timePeriod}
                    delay={cardDelay}
                  />
                )
              })}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}

// ─── TableView ────────────────────────────────────────────────────────────────

interface TableViewProps {
  grouped: GroupedCategory[]
  selectedBenchmarkIds: string[]
  benchmarkDefs: BenchmarkDef[]
  metricsMap: Record<string, MetricSnapshot>
  timePeriod: TimePeriod
}

type SortState = { col: string; dir: 'asc' | 'desc' }

function TableView({ grouped, selectedBenchmarkIds, benchmarkDefs, metricsMap, timePeriod }: TableViewProps) {
  const [sort, setSort] = useState<SortState>({ col: 'name', dir: 'asc' })

  function handleHeaderClick(col: string) {
    setSort(prev =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    )
  }

  function sortKpis(kpis: KpiDef[]): KpiDef[] {
    return [...kpis].sort((a, b) => {
      const ma = metricsMap[a.id]
      const mb = metricsMap[b.id]
      if (!ma || !mb) return 0

      const va = getValuesForPeriod(ma, timePeriod.endingQuarter, timePeriod.type)
      const vb = getValuesForPeriod(mb, timePeriod.endingQuarter, timePeriod.type)

      let diff = 0
      if (sort.col === 'name') {
        diff = a.name.localeCompare(b.name)
      } else if (sort.col === 'current') {
        diff = va.current - vb.current
      } else if (sort.col === 'delta') {
        diff = (va.current - va.prior) - (vb.current - vb.prior)
      } else {
        // benchmark column
        const bva = ma.benchmarks[sort.col] ?? Infinity
        const bvb = mb.benchmarks[sort.col] ?? Infinity
        diff = bva - bvb
      }

      return sort.dir === 'asc' ? diff : -diff
    })
  }

  function SortIndicator({ col }: { col: string }) {
    if (sort.col !== col) return null
    return <span className="ml-1 opacity-70">{sort.dir === 'asc' ? '↑' : '↓'}</span>
  }

  const colCount = 3 + selectedBenchmarkIds.length

  return (
    <div className="px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-full overflow-x-auto rounded-xl border border-border"
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-2 sticky top-0 z-10">
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                onClick={() => handleHeaderClick('name')}
              >
                Name <SortIndicator col="name" />
              </th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                onClick={() => handleHeaderClick('current')}
              >
                Current <SortIndicator col="current" />
              </th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                onClick={() => handleHeaderClick('delta')}
              >
                Δ vs Prior <SortIndicator col="delta" />
              </th>
              {selectedBenchmarkIds.map(benchId => {
                const def = benchmarkDefs.find(b => b.id === benchId)
                return (
                  <th
                    key={benchId}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                    onClick={() => handleHeaderClick(benchId)}
                  >
                    {def?.name ?? benchId} <SortIndicator col={benchId} />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group, groupIndex) => {
              const sortedKpis = sortKpis(group.kpis)
              const sectionDelay = groupIndex * 0.06

              return (
                <motion.tbody
                  key={group.category.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: sectionDelay, ease: [0.4, 0, 0.2, 1] }}
                  className="contents"
                >
                  {/* Category sub-header */}
                  <tr className="bg-surface-3/50">
                    <td
                      colSpan={colCount}
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5"
                    >
                      {group.category.label}
                    </td>
                  </tr>

                  {sortedKpis.map((kpi, rowIndex) => {
                    const metric = metricsMap[kpi.id]
                    if (!metric) return null

                    const { current, prior, periodLabel } = getValuesForPeriod(metric, timePeriod.endingQuarter, timePeriod.type)
                    const delta = current - prior
                    const deltaAbs = Math.abs(delta)

                    let deltaGood: boolean
                    if (metric.direction === 'neutral') {
                      deltaGood = true
                    } else if (metric.direction === 'lower_better') {
                      deltaGood = delta < 0
                    } else {
                      deltaGood = delta > 0
                    }

                    const DeltaIcon =
                      metric.direction === 'neutral'
                        ? Minus
                        : delta < 0
                          ? TrendingDown
                          : TrendingUp

                    const dotClass = getPerformanceDotClass(current, metric, selectedBenchmarkIds)
                    const rowBg = rowIndex % 2 === 0 ? 'bg-surface' : 'bg-surface/60'

                    return (
                      <tr
                        key={kpi.id}
                        className={`${rowBg} hover:bg-surface-2 border-b border-border transition-colors duration-100`}
                      >
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                            <span className="text-white font-medium">{kpi.name}</span>
                          </div>
                        </td>

                        {/* Current */}
                        <td className="py-3 px-4 text-white font-semibold">
                          {formatValue(current, metric.format)}
                        </td>

                        {/* Delta */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                                metric.direction === 'neutral'
                                  ? 'bg-slate-700/60 text-slate-300'
                                  : deltaGood
                                    ? 'bg-green-900/40 text-better'
                                    : 'bg-red-900/40 text-worse'
                              }`}
                            >
                              <DeltaIcon size={10} strokeWidth={2.5} />
                              {formatValue(deltaAbs, metric.format)}
                            </span>
                            <span className="text-[10px] text-slate-600 px-2">{periodLabel}</span>
                          </div>
                        </td>

                        {/* Benchmark columns */}
                        {selectedBenchmarkIds.map(benchId => {
                          const benchValue = metric.benchmarks[benchId]
                          if (benchValue === undefined) {
                            return (
                              <td key={benchId} className="py-3 px-4 text-slate-600 text-xs">
                                —
                              </td>
                            )
                          }
                          const better = isBetter(current, benchValue, metric.direction)
                          return (
                            <td key={benchId} className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-300 text-xs">
                                  {formatValue(benchValue, metric.format)}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    better
                                      ? 'bg-green-900/40 text-better'
                                      : 'bg-red-900/40 text-worse'
                                  }`}
                                >
                                  {better ? 'Better' : 'Worse'}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </motion.tbody>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}

// ─── TrendView ────────────────────────────────────────────────────────────────

const QUARTER_LABELS = ["Q1'23", "Q2'23", "Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25", "Q2'25", "Q3'25", "Q4'25"]

interface TrendViewProps {
  grouped: GroupedCategory[]
  selectedBenchmarkIds: string[]
  metricsMap: Record<string, MetricSnapshot>
  timePeriod: TimePeriod
}

interface TrendTooltipPayload {
  value: number
}

interface TrendTooltipProps {
  active?: boolean
  payload?: TrendTooltipPayload[]
  format: MetricSnapshot['format']
}

function TrendTooltipContent({ active, payload, format }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        background: '#0C2035',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        fontSize: 11,
        padding: '4px 8px',
        color: '#fff',
      }}
    >
      {formatValue(payload[0].value, format)}
    </div>
  )
}

function TrendView({ grouped, selectedBenchmarkIds, metricsMap, timePeriod }: TrendViewProps) {
  return (
    <div className="px-6 py-6 space-y-8">
      {grouped.map((group, groupIndex) => {
        const sectionDelay = groupIndex * 0.06

        return (
          <motion.section
            key={group.category.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: sectionDelay,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {group.category.label}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.kpis.map((kpi, cardIndex) => {
                const metric = metricsMap[kpi.id]
                if (!metric) return null

                const cardDelay = sectionDelay + cardIndex * 0.04
                const { trend, direction, format } = metric
                const { current } = getValuesForPeriod(metric, timePeriod.endingQuarter, timePeriod.type)

                // Determine if trend is improving overall
                const firstVal = trend[0]
                const lastVal = trend[trend.length - 1]
                const improving =
                  direction === 'lower_better'
                    ? lastVal < firstVal
                    : direction === 'higher_better'
                      ? lastVal > firstVal
                      : true // neutral — treat as green

                const lineColor = improving ? '#22c55e' : '#ef4444'

                // Build recharts data
                const chartData = trend.map((v, i) => ({
                  q: QUARTER_LABELS[i],
                  v,
                }))

                // First selected benchmark that has a value for this metric
                const firstBenchId = selectedBenchmarkIds.find(
                  id => metric.benchmarks[id] !== undefined
                )
                const benchValue = firstBenchId !== undefined
                  ? metric.benchmarks[firstBenchId]
                  : undefined
                const benchDef = firstBenchId !== undefined
                  ? BENCHMARK_DEFS.find(b => b.id === firstBenchId)
                  : undefined
                const benchLabel = benchDef?.name.split(' ')[0] ?? ''

                return (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: cardDelay, ease: [0.4, 0, 0.2, 1] }}
                    className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2"
                  >
                    {/* Top row: name + current value */}
                    <div className="flex items-start gap-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight flex-1">
                        {kpi.name}
                      </p>
                      <span className="text-xl font-black text-white ml-auto shrink-0">
                        {formatValue(current, format)}
                      </span>
                    </div>

                    {/* Chart */}
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <XAxis dataKey="q" hide={true} />
                        <YAxis hide={true} domain={['auto', 'auto']} />
                        <Tooltip
                          content={
                            <TrendTooltipContent format={format} />
                          }
                        />
                        {benchValue !== undefined && (
                          <ReferenceLine
                            y={benchValue}
                            stroke="rgba(255,255,255,0.2)"
                            strokeDasharray="3 3"
                            label={{
                              value: benchLabel,
                              position: 'insideTopRight',
                              fontSize: 9,
                              fill: 'rgba(255,255,255,0.35)',
                            }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={lineColor}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}

// ─── PeriodBar ────────────────────────────────────────────────────────────────

const PERIOD_TYPES: { id: PeriodType; label: string; title: string }[] = [
  { id: '1Q',  label: 'Single Qtr',    title: 'Single quarter value'              },
  { id: 'R12', label: 'Rolling 12M',   title: 'Average of last 4 quarters'        },
  { id: 'YTD', label: 'YTD',           title: 'Year-to-date average'              },
  { id: 'R36', label: 'Rolling 3Y',    title: '12-quarter average (CMS 30-day)'   },
]

interface PeriodBarProps {
  timePeriod: TimePeriod
  onTimePeriodChange: (updater: (prev: TimePeriod) => TimePeriod) => void
}

function PeriodBar({ timePeriod, onTimePeriodChange }: PeriodBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border bg-surface/40">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Ending Period
      </span>

      {/* Quarter select */}
      <div className="relative">
        <select
          value={timePeriod.endingQuarter}
          onChange={e => onTimePeriodChange(p => ({ ...p, endingQuarter: e.target.value }))}
          className="bg-surface-2 border border-border text-white text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:border-premier appearance-none pr-6"
        >
          {AVAILABLE_QUARTERS.map(q => (
            <option key={q} value={q}>{formatQuarterLabel(q)}</option>
          ))}
        </select>
        <ChevronDown size={12} className="text-slate-500 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Period type pills */}
      <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5">
        {PERIOD_TYPES.map(({ id: pid, label, title }) => (
          <button
            key={pid}
            title={title}
            onClick={() => onTimePeriodChange(p => ({ ...p, type: pid }))}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              timePeriod.type === pid
                ? 'bg-surface-3 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── ViewContextBar ───────────────────────────────────────────────────────────

interface ViewContextBarProps {
  context: ViewContext
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onManageKpis: () => void
}

function ViewContextBar({ context, viewMode, onViewModeChange, onManageKpis }: ViewContextBarProps) {
  let contextLabel = ''

  if (context.type === 'system') {
    contextLabel = `${HEALTH_SYSTEM.name} · Health System`
  } else if (context.type === 'hospital' && context.hospitalIds.length === 1) {
    const hospital = HEALTH_SYSTEM.hospitals.find(h => h.id === context.hospitalIds[0])
    contextLabel = hospital?.name ?? 'Hospital'
  } else if (context.type === 'group') {
    contextLabel = `Custom Group · ${context.hospitalIds.length} hospital${context.hospitalIds.length !== 1 ? 's' : ''}`
  }

  const modes: { id: ViewMode; label: string; Icon: LucideIcon }[] = [
    { id: 'card',  label: 'Card',  Icon: LayoutGrid },
    { id: 'table', label: 'Table', Icon: TableProperties },
    { id: 'trend', label: 'Trend', Icon: TrendingUpIcon },
  ]

  return (
    <div className="bg-surface border-b border-border px-6 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-white">{contextLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Manage KPIs button */}
        <button
          onClick={onManageKpis}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white border border-border hover:border-border-hi bg-transparent hover:bg-surface-2 px-3 py-1.5 rounded-lg transition-all duration-150"
          aria-label="Manage KPIs"
        >
          <Settings2 size={12} strokeWidth={2} />
          Manage KPIs
        </button>

        {/* View mode segmented control */}
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5 gap-0.5">
          {modes.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onViewModeChange(id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                viewMode === id
                  ? 'bg-surface-3 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={12} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DashboardView ────────────────────────────────────────────────────────────

interface DashboardViewProps {
  view: SavedView
  views: SavedView[]
  context: ViewContext
  activeViewId: string | null
  onSelectView: (id: string) => void
  onNewView: () => void
  onUpdateView: (viewId: string, updates: Partial<SavedView>) => void
  onDeleteView: (viewId: string) => void
  onRenameView: (viewId: string, name: string) => void
}

export default function DashboardView({
  view,
  views,
  context,
  activeViewId,
  onSelectView,
  onNewView,
  onUpdateView,
  onDeleteView,
  onRenameView,
}: DashboardViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(
    view.timePeriod ?? DEFAULT_TIME_PERIOD
  )
  const [isManageKpisOpen, setIsManageKpisOpen] = useState(false)

  // Build metrics lookup map (context-aware in future; uses flat mock data for now)
  const metricsMap = Object.fromEntries(MOCK_METRICS.map(m => [m.kpiId, m]))

  // Filter to selected KPIs only
  const selectedKpiDefs = KPI_DEFS.filter(k => view.selectedKpiIds.includes(k.id))

  // Group by category, preserving KPI_CATEGORIES order
  const grouped: GroupedCategory[] = KPI_CATEGORIES.map(cat => ({
    category: cat,
    kpis: selectedKpiDefs.filter(k => k.category === cat.id),
  })).filter(g => g.kpis.length > 0)

  function handleSaveKpis(newIds: string[]) {
    onUpdateView(view.id, { selectedKpiIds: newIds })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab strip */}
      <ViewTabs
        views={views}
        activeViewId={activeViewId}
        onSelect={onSelectView}
        onNew={onNewView}
        onDelete={onDeleteView}
        onRenameView={onRenameView}
      />

      {/* Context / scope bar */}
      <ViewContextBar
        context={context}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onManageKpis={() => setIsManageKpisOpen(true)}
      />

      {/* Period bar */}
      <PeriodBar timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {selectedKpiDefs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-slate-500 text-sm">No metrics selected.</p>
            <button
              onClick={() => setIsManageKpisOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-premier hover:text-premier-hover transition-colors"
            >
              <Settings2 size={12} strokeWidth={2} />
              Manage KPIs
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'card' && (
              <CardContent
                grouped={grouped}
                selectedBenchmarkIds={view.selectedBenchmarkIds}
                metricsMap={metricsMap}
                timePeriod={timePeriod}
              />
            )}
            {viewMode === 'table' && (
              <TableView
                grouped={grouped}
                selectedBenchmarkIds={view.selectedBenchmarkIds}
                benchmarkDefs={BENCHMARK_DEFS}
                metricsMap={metricsMap}
                timePeriod={timePeriod}
              />
            )}
            {viewMode === 'trend' && (
              <TrendView
                grouped={grouped}
                selectedBenchmarkIds={view.selectedBenchmarkIds}
                metricsMap={metricsMap}
                timePeriod={timePeriod}
              />
            )}
          </>
        )}
      </div>

      {/* KPI management modal */}
      {isManageKpisOpen && (
        <KpiManageModal
          view={view}
          onClose={() => setIsManageKpisOpen(false)}
          onSave={handleSaveKpis}
        />
      )}
    </div>
  )
}
