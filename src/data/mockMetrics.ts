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
  /** 24 quarterly values Q1'20 → Q4'25, last value matches current */
  rawTrend: number[]
}

export const MOCK_METRICS: MetricSnapshot[] = [
  // ── Mortality ─────────────────────────────────────────────────────────────
  {
    kpiId: 'mortality_oe_csa',
    direction: 'lower_better',
    current: 0.83, prior: 0.84,
    format: 'ratio',
    rawTrend: [
      1.12, 1.18, 1.15, 1.10, 1.08, 1.05, 1.03, 1.02, 1.01, 1.00, 0.99, 0.99,
      0.98, 0.96, 0.94, 0.93, 0.95, 0.91, 0.89, 0.87, 0.85, 0.84, 0.84, 0.83,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 0.91, state_avg: 0.94, top_decile: 0.72 },
  },
  {
    kpiId: 'mortality_30d_hf',
    direction: 'lower_better',
    current: 10.7, prior: 10.8,
    format: 'percent',
    rawTrend: [
      14.2, 15.5, 15.0, 14.0, 13.5, 13.2, 13.0, 12.8, 12.5, 12.2, 12.0, 11.8,
      11.4, 11.2, 11.0, 11.0, 10.9, 10.8, 10.8, 10.8, 11.0, 10.8, 10.8, 10.7,
    ],
    benchmarks: { national_avg: 12.4, premier_peer: 11.9, state_avg: 12.1, top_decile: 9.8 },
  },
  {
    kpiId: 'mortality_30d_stroke',
    direction: 'lower_better',
    current: 13.8, prior: 13.9,
    format: 'percent',
    rawTrend: [
      20.5, 22.0, 21.5, 20.5, 20.0, 19.5, 19.0, 18.8, 18.5, 18.0, 17.5, 17.2,
      16.8, 16.4, 16.2, 16.2, 16.0, 15.8, 15.5, 15.3, 14.6, 14.4, 14.4, 13.8,
    ],
    benchmarks: { national_avg: 15.1, premier_peer: 14.7, state_avg: 14.9, top_decile: 12.5 },
  },
  {
    kpiId: 'mortality_30d_cardiac',
    direction: 'lower_better',
    current: 3.6, prior: 3.6,
    format: 'percent',
    rawTrend: [
      4.8, 5.2, 5.0, 4.7, 4.5, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8, 3.7,
      3.6, 3.5, 3.5, 3.4, 3.4, 3.4, 3.4, 3.4, 3.7, 3.6, 3.6, 3.6,
    ],
    benchmarks: { national_avg: 4.2, premier_peer: 4.0, state_avg: 4.1, top_decile: 3.1 },
  },

  // ── Patient Safety ────────────────────────────────────────────────────────
  {
    kpiId: 'complication_oe_csa',
    direction: 'lower_better',
    current: 1.11, prior: 1.10,
    format: 'ratio',
    rawTrend: [
      1.22, 1.25, 1.23, 1.20, 1.18, 1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11,
      1.12, 1.10, 1.09, 1.08, 1.06, 1.05, 1.06, 1.08, 1.10, 1.09, 1.08, 1.08,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 1.05, state_avg: 1.07, top_decile: 0.79 },
  },
  {
    kpiId: 'psi_03',
    direction: 'lower_better',
    current: 0.38, prior: 0.39,
    format: 'rate',
    rawTrend: [
      1.8, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4,
      1.3, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, 1.0, 0.9, 0.9, 0.8, 0.8,
    ],
    benchmarks: { national_avg: 0.49, premier_peer: 0.45, state_avg: 0.47, top_decile: 0.28 },
  },
  {
    kpiId: 'psi_04',
    direction: 'lower_better',
    current: 84.2, prior: 85.8,
    format: 'rate',
    rawTrend: [
      1.2, 1.4, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9, 0.9,
      0.85, 0.82, 0.80, 0.79, 0.78, 0.76, 0.74, 0.72, 0.70, 0.68, 0.66, 0.64,
    ],
    benchmarks: { national_avg: 97.3, premier_peer: 92.5, state_avg: 94.8, top_decile: 71.2 },
  },
  {
    kpiId: 'psi_11',
    direction: 'lower_better',
    current: 8.0, prior: 8.2,
    format: 'rate',
    rawTrend: [
      3.2, 3.8, 3.6, 3.4, 3.2, 3.0, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3,
      2.2, 2.1, 2.0, 1.9, 1.8, 1.8, 1.7, 1.7, 1.6, 1.5, 1.5, 1.4,
    ],
    benchmarks: { national_avg: 9.8, premier_peer: 9.3, state_avg: 9.5, top_decile: 6.8 },
  },

  // ── Efficiency ────────────────────────────────────────────────────────────
  {
    kpiId: 'los_geo_oe',
    direction: 'lower_better',
    current: 0.94, prior: 0.94,
    format: 'ratio',
    rawTrend: [
      1.12, 1.08, 1.06, 1.05, 1.05, 1.04, 1.04, 1.03, 1.03, 1.03, 1.02, 1.02,
      1.03, 1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.96, 0.96, 0.96, 0.95, 0.94,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 0.98, state_avg: 0.99, top_decile: 0.88 },
  },
  {
    kpiId: 'cost_case_geo_oe',
    direction: 'lower_better',
    current: 0.91, prior: 0.92,
    format: 'ratio',
    rawTrend: [
      1.15, 1.12, 1.10, 1.08, 1.07, 1.06, 1.05, 1.04, 1.04, 1.03, 1.02, 1.02,
      1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 0.97, state_avg: 0.98, top_decile: 0.87 },
  },
  {
    kpiId: 'icu_return_48h',
    direction: 'lower_better',
    current: 2.4, prior: 2.5,
    format: 'percent',
    rawTrend: [
      3.8, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9,
      2.8, 2.7, 2.6, 2.5, 2.5, 2.4, 2.3, 2.2, 2.2, 2.1, 2.1, 2.0,
    ],
    benchmarks: { national_avg: 3.4, premier_peer: 3.1, state_avg: 3.2, top_decile: 2.1 },
  },
  {
    kpiId: 'icu_admission',
    direction: 'lower_better',
    current: 17.2, prior: 17.5,
    format: 'percent',
    rawTrend: [
      18.5, 20.2, 19.8, 18.8, 18.0, 17.5, 17.0, 16.8, 16.5, 16.2, 16.0, 15.8,
      15.5, 15.2, 15.0, 14.8, 14.6, 14.4, 14.2, 14.0, 13.8, 13.6, 13.4, 13.2,
    ],
    benchmarks: { national_avg: 19.8, premier_peer: 19.2, state_avg: 19.5, top_decile: 15.4 },
  },

  // ── Readmissions ──────────────────────────────────────────────────────────
  {
    kpiId: 'readmit_oe_csa',
    direction: 'lower_better',
    current: 0.90, prior: 0.91,
    format: 'ratio',
    rawTrend: [
      1.12, 1.10, 1.08, 1.06, 1.05, 1.04, 1.04, 1.03, 1.03, 1.02, 1.02, 1.01,
      1.02, 1.00, 0.99, 0.98, 0.97, 0.97, 0.96, 0.94, 0.93, 0.92, 0.92, 0.91,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 0.97, state_avg: 0.98, top_decile: 0.84 },
  },
  {
    kpiId: 'readmit_hw_oe_csa',
    direction: 'lower_better',
    current: 0.87, prior: 0.88,
    format: 'ratio',
    rawTrend: [
      1.14, 1.12, 1.10, 1.08, 1.07, 1.06, 1.05, 1.04, 1.04, 1.03, 1.02, 1.02,
      1.01, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90,
    ],
    benchmarks: { national_avg: 1.00, premier_peer: 0.95, state_avg: 0.97, top_decile: 0.82 },
  },
  {
    kpiId: 'ed_return_7d',
    direction: 'lower_better',
    current: 2.8, prior: 2.9,
    format: 'percent',
    rawTrend: [
      5.8, 6.2, 6.0, 5.8, 5.6, 5.4, 5.3, 5.2, 5.1, 5.0, 4.9, 4.8,
      4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8, 3.7, 3.6,
    ],
    benchmarks: { national_avg: 4.1, premier_peer: 3.8, state_avg: 3.9, top_decile: 2.6 },
  },
  {
    kpiId: 'ed_return_ip_30d',
    direction: 'lower_better',
    current: 5.3, prior: 5.4,
    format: 'percent',
    rawTrend: [
      3.5, 3.8, 3.7, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7,
      2.6, 2.5, 2.4, 2.3, 2.3, 2.2, 2.2, 2.1, 2.1, 2.0, 2.0, 1.9,
    ],
    benchmarks: { national_avg: 7.2, premier_peer: 6.8, state_avg: 6.9, top_decile: 4.8 },
  },

  // ── Clinical Effectiveness ────────────────────────────────────────────────
  {
    kpiId: 'sepsis_bundle',
    direction: 'higher_better',
    current: 79.2, prior: 77.8,
    format: 'percent',
    rawTrend: [
      45, 48, 50, 52, 54, 55, 57, 58, 60, 61, 62, 63,
      65, 67, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    ],
    benchmarks: { national_avg: 68.4, premier_peer: 71.2, state_avg: 70.1, top_decile: 88.5 },
  },
  {
    kpiId: 'vte_ppx',
    direction: 'higher_better',
    current: 94.2, prior: 93.7,
    format: 'percent',
    rawTrend: [
      72, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
      85, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 91,
    ],
    benchmarks: { national_avg: 89.7, premier_peer: 91.5, state_avg: 90.8, top_decile: 97.2 },
  },
  {
    kpiId: 'ha_vte',
    direction: 'lower_better',
    current: 0.43, prior: 0.44,
    format: 'rate',
    rawTrend: [
      1.8, 2.0, 1.9, 1.8, 1.7, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4,
      1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, 1.0, 0.9, 0.9, 0.9,
    ],
    benchmarks: { national_avg: 0.58, premier_peer: 0.54, state_avg: 0.56, top_decile: 0.38 },
  },
  {
    kpiId: 'oud_pharmacotherapy',
    direction: 'higher_better',
    current: 49.5, prior: 47.2,
    format: 'percent',
    rawTrend: [
      28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56,
    ],
    benchmarks: { national_avg: 35.2, premier_peer: 38.4, state_avg: 37.1, top_decile: 68.4 },
  },

  // ── Health Equity ─────────────────────────────────────────────────────────
  {
    kpiId: 'sdoh_dx',
    direction: 'higher_better',
    current: 36.4, prior: 33.8,
    format: 'percent',
    rawTrend: [
      8, 9, 10, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 21, 22, 23, 25, 26, 28, 29, 31, 32, 34, 35,
    ],
    benchmarks: { national_avg: 22.3, premier_peer: 25.1, state_avg: 23.8, top_decile: 45.2 },
  },
  {
    kpiId: 'vulnerability_idx_pct',
    direction: 'higher_better',
    current: 78.4, prior: 76.1,
    format: 'percent',
    rawTrend: [
      30, 32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44,
      45, 47, 48, 49, 51, 52, 53, 54, 56, 57, 58, 59,
    ],
    benchmarks: { national_avg: 58.4, premier_peer: 62.1, state_avg: 60.8, top_decile: 89.4 },
  },
  {
    kpiId: 'clinical_vuln_idx',
    direction: 'neutral',
    current: 0.67, prior: 0.65,
    format: 'index',
    rawTrend: [
      52, 53, 54, 54, 55, 55, 56, 56, 57, 57, 58, 58,
      59, 60, 60, 61, 61, 62, 62, 63, 63, 64, 64, 65,
    ],
    benchmarks: { national_avg: 0.54, premier_peer: 0.58, state_avg: 0.56, top_decile: 0.78 },
  },
  {
    kpiId: 'social_vuln_idx',
    direction: 'neutral',
    current: 0.55, prior: 0.53,
    format: 'index',
    rawTrend: [
      48, 49, 50, 50, 51, 51, 52, 52, 53, 53, 54, 54,
      55, 56, 56, 57, 57, 58, 58, 59, 59, 60, 60, 61,
    ],
    benchmarks: { national_avg: 0.41, premier_peer: 0.44, state_avg: 0.43, top_decile: 0.72 },
  },
]

// ── Lookup helper ─────────────────────────────────────────────────────────────
export function getMetric(kpiId: string, _context?: ViewContext): MetricSnapshot | undefined {
  return MOCK_METRICS.find(m => m.kpiId === kpiId)
}

// ── Quarter constants ──────────────────────────────────────────────────────────

// All 24 quarters oldest → newest (matches rawTrend array indices 0–23)
export const TREND_QUARTERS = [
  '1Q2020','2Q2020','3Q2020','4Q2020',
  '1Q2021','2Q2021','3Q2021','4Q2021',
  '1Q2022','2Q2022','3Q2022','4Q2022',
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
    const valid = indices.filter(i => i >= 0 && i < metric.rawTrend.length)
    if (valid.length === 0) return metric.rawTrend[endIdx] ?? metric.current
    return valid.reduce((s, i) => s + metric.rawTrend[i], 0) / valid.length
  }

  // Quarter number within year (1–4) and year
  const qNum = parseInt(endingQuarter[0])   // 1,2,3,4
  const year = parseInt(endingQuarter.slice(2)) // 2025

  let current: number
  let priorIndices: number[]
  let periodLabel: string

  switch (periodType) {
    case '1Q':
      current = metric.rawTrend[endIdx] ?? metric.current
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
