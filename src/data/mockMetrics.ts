import type { ViewContext } from '../types/wizard'

export type PerformanceDirection = 'lower_better' | 'higher_better' | 'neutral'

// Benchmark keys that appear in MetricSnapshot.benchmarks
export type BenchmarkValues = Partial<Record<string, number>>

export interface MetricSnapshot {
  kpiId: string
  direction: PerformanceDirection
  current: number
  prior: number
  format: 'ratio' | 'percent' | 'stars' | 'score' | 'days' | 'index' | 'currency' | 'rate'
  benchmarks: BenchmarkValues
  /** 12 quarterly values Q1'23 → Q4'25, last value matches current */
  trend: number[]
}

export const MOCK_METRICS: MetricSnapshot[] = [
  // ── Mortality ─────────────────────────────────────────────────────────────
  {
    kpiId: 'mortality_oe_csa',
    direction: 'lower_better',
    current: 0.83, prior: 0.84,
    format: 'ratio',
    trend: [0.98, 0.96, 0.94, 0.93, 0.95, 0.91, 0.89, 0.87, 0.85, 0.84, 0.84, 0.83],
    benchmarks: { national_avg: 1.00, peer_group: 0.91, state_avg: 0.94, top_decile: 0.72 },
  },
  {
    kpiId: 'mortality_30d_hf',
    direction: 'lower_better',
    current: 10.7, prior: 10.8,
    format: 'percent',
    trend: [13.1, 12.8, 12.5, 12.4, 12.2, 11.9, 11.5, 11.2, 11.0, 10.8, 10.8, 10.7],
    benchmarks: { national_avg: 12.4, peer_group: 11.9, state_avg: 12.1, top_decile: 9.8 },
  },
  {
    kpiId: 'mortality_30d_stroke',
    direction: 'lower_better',
    current: 13.8, prior: 13.9,
    format: 'percent',
    trend: [16.2, 15.9, 15.6, 15.4, 15.1, 14.9, 14.6, 14.3, 14.1, 13.9, 13.9, 13.8],
    benchmarks: { national_avg: 15.1, peer_group: 14.7, state_avg: 14.9, top_decile: 12.5 },
  },
  {
    kpiId: 'mortality_30d_cardiac',
    direction: 'lower_better',
    current: 3.6, prior: 3.6,
    format: 'percent',
    trend: [4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.0, 3.8, 3.7, 3.6, 3.6, 3.6],
    benchmarks: { national_avg: 4.2, peer_group: 4.0, state_avg: 4.1, top_decile: 3.1 },
  },

  // ── Patient Safety ────────────────────────────────────────────────────────
  {
    kpiId: 'complication_oe_csa',
    direction: 'lower_better',
    current: 1.11, prior: 1.10,
    format: 'ratio',
    trend: [0.99, 1.01, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.10, 1.11],
    benchmarks: { national_avg: 1.00, peer_group: 1.05, state_avg: 1.07, top_decile: 0.79 },
  },
  {
    kpiId: 'psi_03',
    direction: 'lower_better',
    current: 0.38, prior: 0.39,
    format: 'rate',
    trend: [0.54, 0.52, 0.50, 0.49, 0.47, 0.46, 0.44, 0.42, 0.40, 0.39, 0.39, 0.38],
    benchmarks: { national_avg: 0.49, peer_group: 0.45, state_avg: 0.47, top_decile: 0.28 },
  },
  {
    kpiId: 'psi_04',
    direction: 'lower_better',
    current: 84.2, prior: 85.8,
    format: 'rate',
    trend: [101.4, 98.8, 97.2, 96.1, 94.5, 93.2, 91.4, 89.2, 87.4, 85.8, 85.8, 84.2],
    benchmarks: { national_avg: 97.3, peer_group: 92.5, state_avg: 94.8, top_decile: 71.2 },
  },
  {
    kpiId: 'psi_11',
    direction: 'lower_better',
    current: 8.0, prior: 8.2,
    format: 'rate',
    trend: [10.8, 10.4, 10.1, 9.9, 9.7, 9.5, 9.1, 8.7, 8.4, 8.2, 8.2, 8.0],
    benchmarks: { national_avg: 9.8, peer_group: 9.3, state_avg: 9.5, top_decile: 6.8 },
  },

  // ── Efficiency ────────────────────────────────────────────────────────────
  {
    kpiId: 'los_geo_oe',
    direction: 'lower_better',
    current: 0.94, prior: 0.94,
    format: 'ratio',
    trend: [1.03, 1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.94, 0.94],
    benchmarks: { national_avg: 1.00, peer_group: 0.98, state_avg: 0.99, top_decile: 0.88 },
  },
  {
    kpiId: 'cost_case_geo_oe',
    direction: 'lower_better',
    current: 0.91, prior: 0.92,
    format: 'ratio',
    trend: [1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.96, 0.94, 0.93, 0.92, 0.92, 0.91],
    benchmarks: { national_avg: 1.00, peer_group: 0.97, state_avg: 0.98, top_decile: 0.87 },
  },
  {
    kpiId: 'icu_return_48h',
    direction: 'lower_better',
    current: 2.4, prior: 2.5,
    format: 'percent',
    trend: [3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.0, 2.8, 2.6, 2.5, 2.5, 2.4],
    benchmarks: { national_avg: 3.4, peer_group: 3.1, state_avg: 3.2, top_decile: 2.1 },
  },
  {
    kpiId: 'icu_admission',
    direction: 'lower_better',
    current: 17.2, prior: 17.5,
    format: 'percent',
    trend: [21.4, 21.0, 20.6, 20.2, 19.8, 19.5, 18.9, 18.2, 17.8, 17.5, 17.5, 17.2],
    benchmarks: { national_avg: 19.8, peer_group: 19.2, state_avg: 19.5, top_decile: 15.4 },
  },

  // ── Readmissions ──────────────────────────────────────────────────────────
  {
    kpiId: 'readmit_oe_csa',
    direction: 'lower_better',
    current: 0.90, prior: 0.91,
    format: 'ratio',
    trend: [1.02, 1.00, 0.99, 0.98, 0.97, 0.97, 0.96, 0.94, 0.92, 0.91, 0.91, 0.90],
    benchmarks: { national_avg: 1.00, peer_group: 0.97, state_avg: 0.98, top_decile: 0.84 },
  },
  {
    kpiId: 'readmit_hw_oe_csa',
    direction: 'lower_better',
    current: 0.87, prior: 0.88,
    format: 'ratio',
    trend: [1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.93, 0.91, 0.89, 0.88, 0.88, 0.87],
    benchmarks: { national_avg: 1.00, peer_group: 0.95, state_avg: 0.97, top_decile: 0.82 },
  },
  {
    kpiId: 'ed_return_7d',
    direction: 'lower_better',
    current: 2.8, prior: 2.9,
    format: 'percent',
    trend: [4.2, 4.1, 3.9, 3.8, 3.7, 3.6, 3.4, 3.2, 3.0, 2.9, 2.9, 2.8],
    benchmarks: { national_avg: 4.1, peer_group: 3.8, state_avg: 3.9, top_decile: 2.6 },
  },
  {
    kpiId: 'ed_return_ip_30d',
    direction: 'lower_better',
    current: 5.3, prior: 5.4,
    format: 'percent',
    trend: [7.4, 7.2, 7.0, 6.8, 6.6, 6.4, 6.1, 5.8, 5.6, 5.4, 5.4, 5.3],
    benchmarks: { national_avg: 7.2, peer_group: 6.8, state_avg: 6.9, top_decile: 4.8 },
  },

  // ── Clinical Effectiveness ────────────────────────────────────────────────
  {
    kpiId: 'sepsis_bundle',
    direction: 'higher_better',
    current: 79.2, prior: 77.8,
    format: 'percent',
    trend: [62.1, 63.8, 65.4, 67.1, 68.5, 70.2, 72.1, 74.2, 76.1, 77.8, 77.8, 79.2],
    benchmarks: { national_avg: 68.4, peer_group: 71.2, state_avg: 70.1, top_decile: 88.5 },
  },
  {
    kpiId: 'vte_ppx',
    direction: 'higher_better',
    current: 94.2, prior: 93.7,
    format: 'percent',
    trend: [87.4, 88.1, 88.8, 89.4, 90.1, 90.8, 91.5, 92.4, 93.1, 93.7, 93.7, 94.2],
    benchmarks: { national_avg: 89.7, peer_group: 91.5, state_avg: 90.8, top_decile: 97.2 },
  },
  {
    kpiId: 'ha_vte',
    direction: 'lower_better',
    current: 0.43, prior: 0.44,
    format: 'rate',
    trend: [0.62, 0.60, 0.58, 0.56, 0.55, 0.53, 0.51, 0.48, 0.46, 0.44, 0.44, 0.43],
    benchmarks: { national_avg: 0.58, peer_group: 0.54, state_avg: 0.56, top_decile: 0.38 },
  },
  {
    kpiId: 'oud_pharmacotherapy',
    direction: 'higher_better',
    current: 49.5, prior: 47.2,
    format: 'percent',
    trend: [28.4, 30.2, 32.1, 34.5, 36.8, 38.4, 40.2, 42.1, 44.8, 47.2, 47.2, 49.5],
    benchmarks: { national_avg: 35.2, peer_group: 38.4, state_avg: 37.1, top_decile: 68.4 },
  },

  // ── Health Equity ─────────────────────────────────────────────────────────
  {
    kpiId: 'sdoh_dx',
    direction: 'higher_better',
    current: 36.4, prior: 33.8,
    format: 'percent',
    trend: [14.2, 16.8, 18.4, 20.1, 22.3, 24.1, 26.2, 28.4, 31.2, 33.8, 33.8, 36.4],
    benchmarks: { national_avg: 22.3, peer_group: 25.1, state_avg: 23.8, top_decile: 45.2 },
  },
  {
    kpiId: 'vulnerability_idx_pct',
    direction: 'higher_better',
    current: 78.4, prior: 76.1,
    format: 'percent',
    trend: [52.1, 55.4, 58.2, 61.0, 63.8, 66.1, 68.8, 71.2, 73.8, 76.1, 76.1, 78.4],
    benchmarks: { national_avg: 58.4, peer_group: 62.1, state_avg: 60.8, top_decile: 89.4 },
  },
  {
    kpiId: 'clinical_vuln_idx',
    direction: 'neutral',
    current: 0.67, prior: 0.65,
    format: 'index',
    trend: [0.51, 0.53, 0.54, 0.56, 0.57, 0.58, 0.60, 0.62, 0.64, 0.65, 0.65, 0.67],
    benchmarks: { national_avg: 0.54, peer_group: 0.58, state_avg: 0.56, top_decile: 0.78 },
  },
  {
    kpiId: 'social_vuln_idx',
    direction: 'neutral',
    current: 0.55, prior: 0.53,
    format: 'index',
    trend: [0.34, 0.36, 0.38, 0.40, 0.41, 0.43, 0.45, 0.48, 0.51, 0.53, 0.53, 0.55],
    benchmarks: { national_avg: 0.41, peer_group: 0.44, state_avg: 0.43, top_decile: 0.72 },
  },
]

// ── Lookup helper ─────────────────────────────────────────────────────────────
export function getMetric(kpiId: string, _context?: ViewContext): MetricSnapshot | undefined {
  return MOCK_METRICS.find(m => m.kpiId === kpiId)
}

// ── Quarter constants ──────────────────────────────────────────────────────────

// Ordered oldest → newest (matches trend array indices 0–11)
export const TREND_QUARTERS = [
  '1Q2023','2Q2023','3Q2023','4Q2023',
  '1Q2024','2Q2024','3Q2024','4Q2024',
  '1Q2025','2Q2025','3Q2025','4Q2025',
]

// Available quarters for the UI picker (newest first)
export const AVAILABLE_QUARTERS = [
  '4Q2025','3Q2025','2Q2025','1Q2025',
  '4Q2024','3Q2024','2Q2024','1Q2024',
]

export function formatQuarterLabel(q: string): string {
  // '4Q2025' → '4Q 2025'
  const match = q.match(/^(\dQ)(\d{4})$/)
  return match ? `${match[1]} ${match[2]}` : q
}

export type { TimePeriod, PeriodType } from '../types/wizard'

/**
 * Derive current and prior values for a MetricSnapshot based on
 * the selected ending quarter and period type.
 *
 * Returns { current, prior, periodLabel } where periodLabel describes
 * what "prior" means (e.g. "vs prior qtr", "vs prior year").
 */
export function getValuesForPeriod(
  metric: MetricSnapshot,
  endingQuarter: string,
  periodType: import('../types/wizard').PeriodType,
): { current: number; prior: number; periodLabel: string } {
  const endIdx = TREND_QUARTERS.indexOf(endingQuarter)
  if (endIdx === -1) {
    return { current: metric.current, prior: metric.prior, periodLabel: 'vs prior period' }
  }

  const avg = (indices: number[]): number => {
    const valid = indices.filter(i => i >= 0 && i < metric.trend.length)
    if (valid.length === 0) return metric.trend[endIdx] ?? metric.current
    return valid.reduce((s, i) => s + metric.trend[i], 0) / valid.length
  }

  // Quarter number within year (1–4) and year
  const qNum = parseInt(endingQuarter[0])   // 1,2,3,4
  const year = parseInt(endingQuarter.slice(2)) // 2025

  let current: number
  let priorIndices: number[]
  let periodLabel: string

  switch (periodType) {
    case '1Q':
      current = metric.trend[endIdx] ?? metric.current
      priorIndices = [endIdx - 1]
      periodLabel = 'vs prior qtr'
      break

    case 'R12': {
      const curIndices = [endIdx - 3, endIdx - 2, endIdx - 1, endIdx]
      current = avg(curIndices)
      // Prior = same rolling 12M ending 4 quarters earlier
      priorIndices = curIndices.map(i => i - 4)
      periodLabel = 'vs prior year'
      break
    }

    case 'YTD': {
      // Q1 of ending year index
      const q1Idx = TREND_QUARTERS.indexOf(`1Q${year}`)
      const curIndices = Array.from({ length: qNum }, (_, i) => (q1Idx >= 0 ? q1Idx + i : endIdx))
      current = avg(curIndices)
      // Prior = same YTD period one year earlier
      const q1PriorIdx = TREND_QUARTERS.indexOf(`1Q${year - 1}`)
      priorIndices = Array.from({ length: qNum }, (_, i) => (q1PriorIdx >= 0 ? q1PriorIdx + i : endIdx - 4))
      periodLabel = 'vs prior YTD'
      break
    }

    case 'R36': {
      const curIndices = Array.from({ length: 12 }, (_, i) => endIdx - 11 + i)
      current = avg(curIndices)
      // Prior = same 36M ending 4 quarters earlier
      priorIndices = curIndices.map(i => i - 4)
      periodLabel = 'vs prior 3Y'
      break
    }
  }

  const prior = avg(priorIndices)
  return { current: parseFloat(current.toFixed(4)), prior: parseFloat(prior.toFixed(4)), periodLabel }
}
