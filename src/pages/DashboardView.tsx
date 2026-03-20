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
  ReferenceArea,
  CartesianGrid,
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

// ─── TrendView helpers ────────────────────────────────────────────────────────

// 24 quarters: Q1'20 (index 0) → Q4'25 (index 23)
const ALL_QUARTER_IDS = [
  '1Q2020','2Q2020','3Q2020','4Q2020',
  '1Q2021','2Q2021','3Q2021','4Q2021',
  '1Q2022','2Q2022','3Q2022','4Q2022',
  '1Q2023','2Q2023','3Q2023','4Q2023',
  '1Q2024','2Q2024','3Q2024','4Q2024',
  '1Q2025','2Q2025','3Q2025','4Q2025',
]

const ALL_QUARTER_LABELS = [
  "Q1'20","Q2'20","Q3'20","Q4'20",
  "Q1'21","Q2'21","Q3'21","Q4'21",
  "Q1'22","Q2'22","Q3'22","Q4'22",
  "Q1'23","Q2'23","Q3'23","Q4'23",
  "Q1'24","Q2'24","Q3'24","Q4'24",
  "Q1'25","Q2'25","Q3'25","Q4'25",
]

const QTR_STARTS: Record<number, string> = { 1: '1/1',  2: '4/1',  3: '7/1',  4: '10/1' }
const QTR_ENDS:   Record<number, string> = { 1: '3/31', 2: '6/30', 3: '9/30', 4: '12/31' }

function parseQ(q: string): { qNum: number; year: number } {
  return { qNum: parseInt(q[0]), year: parseInt(q.slice(2)) }
}

function computePeriodValue(rawTrend: number[], rawIdx: number, periodType: PeriodType): number {
  switch (periodType) {
    case '1Q':
      return rawTrend[rawIdx]
    case 'R12': {
      const start = Math.max(0, rawIdx - 3)
      const slice = rawTrend.slice(start, rawIdx + 1)
      return slice.reduce((a, b) => a + b, 0) / slice.length
    }
    case 'YTD': {
      const quarterInYear = rawIdx % 4   // 0=Q1, 1=Q2, 2=Q3, 3=Q4
      const start = rawIdx - quarterInYear
      const slice = rawTrend.slice(start, rawIdx + 1)
      return slice.reduce((a, b) => a + b, 0) / slice.length
    }
    case 'R36': {
      const start = Math.max(0, rawIdx - 11)
      const slice = rawTrend.slice(start, rawIdx + 1)
      return slice.reduce((a, b) => a + b, 0) / slice.length
    }
    default:
      return rawTrend[rawIdx]
  }
}

function getPeriodDateRange(endingQuarter: string, periodType: PeriodType): string {
  const endRawIdx = ALL_QUARTER_IDS.indexOf(endingQuarter)
  const { qNum: endQNum, year: endYear } = parseQ(endingQuarter)

  let startRawIdx: number
  switch (periodType) {
    case '1Q':  startRawIdx = endRawIdx; break
    case 'R12': startRawIdx = Math.max(0, endRawIdx - 3); break
    case 'YTD': {
      const q1Id = `1Q${endYear}`
      const q1Idx = ALL_QUARTER_IDS.indexOf(q1Id)
      startRawIdx = q1Idx >= 0 ? q1Idx : endRawIdx
      break
    }
    case 'R36': startRawIdx = Math.max(0, endRawIdx - 11); break
  }
  const { qNum: startQNum, year: startYear } = parseQ(ALL_QUARTER_IDS[startRawIdx])
  return `${QTR_STARTS[startQNum]}/${startYear} – ${QTR_ENDS[endQNum]}/${endYear}`
}

function getPeriodHighlight(endingQuarter: string, periodType: PeriodType, chartStartRawIdx: number): { x1: string; x2: string } {
  const endRawIdx = ALL_QUARTER_IDS.indexOf(endingQuarter)
  const { year: endYear } = parseQ(endingQuarter)
  let hlStartRawIdx: number
  switch (periodType) {
    case '1Q':  hlStartRawIdx = endRawIdx; break
    case 'R12': hlStartRawIdx = Math.max(0, endRawIdx - 3); break
    case 'YTD': {
      const q1Id = `1Q${endYear}`
      const q1Idx = ALL_QUARTER_IDS.indexOf(q1Id)
      hlStartRawIdx = Math.max(0, q1Idx >= 0 ? q1Idx : endRawIdx)
      break
    }
    case 'R36': hlStartRawIdx = Math.max(0, endRawIdx - 11); break
  }
  // Clamp to the visible chart window
  const clampedStart = Math.max(hlStartRawIdx, chartStartRawIdx)
  return { x1: ALL_QUARTER_LABELS[clampedStart], x2: ALL_QUARTER_LABELS[endRawIdx] }
}

// Short label shown on benchmark reference lines
const BENCH_SHORT: Record<string, string> = {
  national_avg: 'Natl',
  top_decile:   'Top 10%',
  top_quartile: 'Top 25%',
  premier_peer: 'Peer',
  state_avg:    'State',
  system_avg:   'System',
}
// Color per benchmark
const BENCH_COLOR: Record<string, string> = {
  national_avg: '#94a3b8',
  top_decile:   '#22c55e',
  top_quartile: '#a3d7ef',
  premier_peer: '#24a3e3',
  state_avg:    '#fbbf24',
  system_avg:   '#a855f7',
}

function formatTick(value: number, format: MetricSnapshot['format']): string {
  switch (format) {
    case 'ratio': return value.toFixed(2)
    case 'percent': return `${parseFloat(value.toFixed(1))}%`
    case 'rate':    return parseFloat(value.toFixed(1)).toString()
    case 'index':   return value.toFixed(2)
    default:        return String(parseFloat(value.toFixed(1)))
  }
}

// ─── TrendView ────────────────────────────────────────────────────────────────

interface TrendViewProps {
  grouped: GroupedCategory[]
  selectedBenchmarkIds: string[]
  metricsMap: Record<string, MetricSnapshot>
  timePeriod: TimePeriod
}

interface TrendTooltipPayload {
  value: number
  payload: Record<string, number>
}

interface TrendTooltipProps {
  active?: boolean
  payload?: TrendTooltipPayload[]
  label?: string
  format: MetricSnapshot['format']
  selectedBenchmarkIds: string[]
}

function TrendTooltipContent({ active, payload, label, format, selectedBenchmarkIds }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const dataPoint = payload[0].payload
  const benchEntries = selectedBenchmarkIds
    .map(id => ({ id, value: dataPoint[id] }))
    .filter(e => e.value !== undefined)

  return (
    <div style={{ background: '#0C2035', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11, padding: '7px 10px', color: '#fff', minWidth: 130 }}>
      {label && (
        <div style={{ color: '#64748b', fontSize: 10, marginBottom: 5, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: benchEntries.length ? 3 : 0 }}>
        <span style={{ color: '#94a3b8' }}>Value</span>
        <span style={{ fontWeight: 600 }}>{formatValue(payload[0].value, format)}</span>
      </div>
      {benchEntries.map(({ id, value }) => {
        const color = BENCH_COLOR[id] ?? 'rgba(148,163,184,0.7)'
        const name  = BENCH_SHORT[id] ?? id
        return (
          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
            <span style={{ color }}>{name}</span>
            <span style={{ color }}>{formatValue(value, format)}</span>
          </div>
        )
      })}
    </div>
  )
}

const PERIOD_TYPE_LABEL: Record<PeriodType, string> = {
  '1Q':  'Single Qtr',
  'R12': 'Rolling 12M',
  'YTD': 'YTD',
  'R36': 'Rolling 3Y',
}

function TrendView({ grouped, selectedBenchmarkIds, metricsMap, timePeriod }: TrendViewProps) {
  // Compute the 12-quarter window based on the selected ending quarter
  const endRawIdx      = ALL_QUARTER_IDS.indexOf(timePeriod.endingQuarter)
  const startRawIdx    = Math.max(0, endRawIdx - 11)

  // X-axis ticks: Q1 of each visible year + the ending quarter if not already Q1
  const endLabel = ALL_QUARTER_LABELS[endRawIdx]
  const xTicks: string[] = []
  for (let i = startRawIdx; i <= endRawIdx; i++) {
    if (i % 4 === 0) xTicks.push(ALL_QUARTER_LABELS[i])  // only Q1 ticks (index 0=Q1,1=Q2,2=Q3,3=Q4)
  }
  if (!xTicks.includes(endLabel)) xTicks.push(endLabel)

  const { x1: hlX1, x2: hlX2 } = getPeriodHighlight(timePeriod.endingQuarter, timePeriod.type, startRawIdx)

  return (
    <div className="px-6 py-6 space-y-8">
      {grouped.map((group, groupIndex) => {
        const sectionDelay = groupIndex * 0.06
        return (
          <motion.section
            key={group.category.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sectionDelay, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {group.category.label}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.kpis.map((kpi, cardIndex) => {
                const metric = metricsMap[kpi.id]
                if (!metric) return null

                const cardDelay = sectionDelay + cardIndex * 0.04
                const { rawTrend, direction, format } = metric

                // Header value: period-aware, matches the rightmost chart point
                const headerValue = computePeriodValue(rawTrend, endRawIdx, timePeriod.type)

                // Determine line color from the trend over the visible window
                const firstVal = computePeriodValue(rawTrend, startRawIdx, timePeriod.type)
                const lastVal  = headerValue
                const improving =
                  direction === 'lower_better'  ? lastVal < firstVal
                  : direction === 'higher_better' ? lastVal > firstVal
                  : true
                const lineColor = improving ? '#22c55e' : '#ef4444'

                // Build 12-quarter chart data using period-aware values
                const chartData: Record<string, number | string>[] = []
                for (let rawIdx = startRawIdx; rawIdx <= endRawIdx; rawIdx++) {
                  const v = computePeriodValue(rawTrend, rawIdx, timePeriod.type)
                  const pt: Record<string, number | string> = { q: ALL_QUARTER_LABELS[rawIdx], v }
                  selectedBenchmarkIds.forEach(bid => {
                    const bv = metric.benchmarks[bid]
                    if (bv !== undefined) pt[bid] = bv
                  })
                  chartData.push(pt)
                }

                return (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: cardDelay, ease: [0.4, 0, 0.2, 1] }}
                    className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2"
                  >
                    {/* Header: name left, value + period right */}
                    <div className="flex items-start gap-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight flex-1">
                        {kpi.name}
                      </p>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xl font-black text-white leading-none">
                          {formatValue(headerValue, format)}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 text-right">
                          {PERIOD_TYPE_LABEL[timePeriod.type]}
                        </span>
                      </div>
                    </div>

                    {/* Chart */}
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.04)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="q"
                          ticks={xTicks}
                          tick={{ fill: '#94a3b8', fontSize: 9 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.07)' }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fill: '#94a3b8', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          width={38}
                          tickFormatter={v => formatTick(v, format)}
                          tickCount={4}
                        />
                        <Tooltip
                          content={(props) => (
                            <TrendTooltipContent
                              {...(props as unknown as TrendTooltipProps)}
                              format={format}
                              selectedBenchmarkIds={selectedBenchmarkIds}
                            />
                          )}
                        />

                        {/* Selected period highlight */}
                        <ReferenceArea
                          x1={hlX1}
                          x2={hlX2}
                          fill="rgba(36,163,227,0.07)"
                          stroke="rgba(36,163,227,0.18)"
                          strokeWidth={1}
                        />

                        {/* Benchmark reference lines — all selected */}
                        {selectedBenchmarkIds.map(benchId => {
                          const benchValue = metric.benchmarks[benchId]
                          if (benchValue === undefined) return null
                          const color    = BENCH_COLOR[benchId] ?? 'rgba(148,163,184,0.6)'
                          const shortLbl = BENCH_SHORT[benchId]
                          if (!shortLbl) return null   // skip if no label defined — prevents "null" rendering
                          return (
                            <ReferenceLine
                              key={benchId}
                              y={benchValue}
                              stroke={color}
                              strokeDasharray="4 3"
                              strokeWidth={1.5}
                              label={{ value: shortLbl, position: 'insideTopRight', fontSize: 9, fill: color, fontWeight: 600 }}
                            />
                          )
                        })}

                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={lineColor}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
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
  const dateRange = getPeriodDateRange(timePeriod.endingQuarter, timePeriod.type)
  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 px-5 py-2.5 border-b border-border bg-surface/40">
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

      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Time Interval
      </span>

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
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Selected discharge period */}
      <span className="text-[11px] text-slate-300">
        <span className="font-semibold uppercase tracking-wider text-slate-400">Selected Discharge Period: </span>
        {dateRange}
      </span>
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
