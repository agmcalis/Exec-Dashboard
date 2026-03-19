import type { ViewContext } from '../types/wizard'

export type PerformanceDirection = 'lower_better' | 'higher_better' | 'neutral'

// Benchmark keys that appear in MetricSnapshot.benchmarks
export type BenchmarkValues = Partial<Record<string, number>>

export interface MetricSnapshot {
  kpiId: string
  direction: PerformanceDirection
  current: number
  prior: number
  format: 'ratio' | 'percent' | 'stars' | 'score' | 'days' | 'index' | 'currency'
  benchmarks: BenchmarkValues
  /** 8 quarterly values Q1'23 → Q4'24, last value matches current */
  trend: number[]
}

export const MOCK_METRICS: MetricSnapshot[] = [
  // ── General Outcomes ──────────────────────────────────────────────────────
  {
    kpiId: 'mortality_oe',
    direction: 'lower_better',
    current: 0.87,
    prior: 0.91,
    format: 'ratio',
    trend: [0.98, 0.96, 0.94, 0.93, 0.95, 0.91, 0.89, 0.87],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.72,
      top_quartile:  0.85,
      premier_peer:  0.88,
      state_avg:     0.96,
      system_avg:    0.87,
    },
  },
  {
    kpiId: 'readmission_oe',
    direction: 'lower_better',
    current: 0.94,
    prior: 0.97,
    format: 'ratio',
    trend: [1.02, 1.00, 0.99, 0.98, 0.97, 0.97, 0.96, 0.94],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.78,
      top_quartile:  0.91,
      premier_peer:  0.93,
      state_avg:     1.02,
      system_avg:    0.94,
    },
  },
  {
    kpiId: 'complication_oe',
    direction: 'lower_better',
    current: 1.08,
    prior: 1.04,
    format: 'ratio',
    trend: [1.12, 1.10, 1.09, 1.08, 1.06, 1.05, 1.06, 1.08],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.74,
      top_quartile:  0.89,
      premier_peer:  0.97,
      state_avg:     1.05,
      system_avg:    1.01,
    },
  },
  {
    kpiId: 'psi90',
    direction: 'lower_better',
    current: 0.79,
    prior: 0.83,
    format: 'ratio',
    trend: [0.91, 0.89, 0.87, 0.86, 0.84, 0.83, 0.81, 0.79],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.65,
      top_quartile:  0.80,
      premier_peer:  0.82,
      state_avg:     0.94,
      system_avg:    0.84,
    },
  },
  {
    kpiId: 'mortality_30d',
    direction: 'lower_better',
    current: 2.3,
    prior: 2.5,
    format: 'percent',
    trend: [2.9, 2.8, 2.7, 2.6, 2.6, 2.5, 2.4, 2.3],
    benchmarks: {
      national_avg:  2.8,
      top_decile:    1.6,
      top_quartile:  2.1,
      premier_peer:  2.4,
      state_avg:     2.7,
      system_avg:    2.3,
    },
  },
  {
    kpiId: 'length_of_stay_oe',
    direction: 'lower_better',
    current: 0.96,
    prior: 0.98,
    format: 'ratio',
    trend: [1.03, 1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.96],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.82,
      top_quartile:  0.93,
      premier_peer:  0.95,
      state_avg:     1.03,
      system_avg:    0.96,
    },
  },

  // ── CMS Star Ratings ──────────────────────────────────────────────────────
  {
    kpiId: 'cms_overall',
    direction: 'higher_better',
    current: 4,
    prior: 4,
    format: 'stars',
    trend: [3, 3, 3, 4, 4, 4, 4, 4],
    benchmarks: {
      national_avg:  3,
      top_decile:    5,
      top_quartile:  4,
      premier_peer:  4,
      state_avg:     3,
    },
  },
  {
    kpiId: 'cms_mortality',
    direction: 'higher_better',
    current: 3.8,
    prior: 3.6,
    format: 'score',
    trend: [3.2, 3.3, 3.4, 3.5, 3.5, 3.6, 3.7, 3.8],
    benchmarks: {
      national_avg:  3.0,
      top_decile:    4.8,
      top_quartile:  4.0,
      premier_peer:  3.7,
      state_avg:     3.2,
    },
  },
  {
    kpiId: 'cms_safety',
    direction: 'higher_better',
    current: 3.2,
    prior: 3.4,
    format: 'score',
    trend: [3.5, 3.4, 3.4, 3.3, 3.3, 3.3, 3.2, 3.2],
    benchmarks: {
      national_avg:  3.0,
      top_decile:    4.7,
      top_quartile:  3.9,
      premier_peer:  3.5,
      state_avg:     2.9,
    },
  },
  {
    kpiId: 'cms_readmission',
    direction: 'higher_better',
    current: 4.1,
    prior: 3.9,
    format: 'score',
    trend: [3.6, 3.7, 3.8, 3.8, 3.9, 4.0, 4.0, 4.1],
    benchmarks: {
      national_avg:  3.0,
      top_decile:    4.9,
      top_quartile:  4.2,
      premier_peer:  4.0,
      state_avg:     3.3,
    },
  },
  {
    kpiId: 'cms_experience',
    direction: 'higher_better',
    current: 2.9,
    prior: 3.1,
    format: 'score',
    trend: [3.2, 3.1, 3.0, 3.0, 2.9, 2.9, 3.0, 2.9],
    benchmarks: {
      national_avg:  3.0,
      top_decile:    4.6,
      top_quartile:  3.8,
      premier_peer:  3.2,
      state_avg:     2.8,
    },
  },
  {
    kpiId: 'cms_timely',
    direction: 'higher_better',
    current: 3.5,
    prior: 3.3,
    format: 'score',
    trend: [3.0, 3.1, 3.2, 3.2, 3.3, 3.4, 3.4, 3.5],
    benchmarks: {
      national_avg:  3.0,
      top_decile:    4.7,
      top_quartile:  3.9,
      premier_peer:  3.4,
      state_avg:     3.1,
    },
  },

  // ── Hospital-Acquired Infections ──────────────────────────────────────────
  {
    kpiId: 'clabsi',
    direction: 'lower_better',
    current: 0.61,
    prior: 0.74,
    format: 'ratio',
    trend: [0.88, 0.82, 0.78, 0.74, 0.71, 0.67, 0.63, 0.61],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.40,
      top_quartile:  0.68,
      premier_peer:  0.65,
      state_avg:     0.88,
      system_avg:    0.70,
    },
  },
  {
    kpiId: 'cauti',
    direction: 'lower_better',
    current: 1.14,
    prior: 1.08,
    format: 'ratio',
    trend: [1.05, 1.08, 1.10, 1.09, 1.12, 1.11, 1.13, 1.14],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.42,
      top_quartile:  0.72,
      premier_peer:  0.91,
      state_avg:     1.09,
      system_avg:    0.95,
    },
  },
  {
    kpiId: 'ssi_colon',
    direction: 'lower_better',
    current: 0.88,
    prior: 0.95,
    format: 'ratio',
    trend: [1.02, 0.99, 0.97, 0.95, 0.93, 0.91, 0.89, 0.88],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.44,
      top_quartile:  0.76,
      premier_peer:  0.84,
      state_avg:     0.97,
      system_avg:    0.86,
    },
  },
  {
    kpiId: 'ssi_hyst',
    direction: 'lower_better',
    current: 0.72,
    prior: 0.80,
    format: 'ratio',
    trend: [0.90, 0.86, 0.84, 0.82, 0.80, 0.77, 0.74, 0.72],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.38,
      top_quartile:  0.69,
      premier_peer:  0.75,
      state_avg:     0.91,
      system_avg:    0.74,
    },
  },
  {
    kpiId: 'mrsa',
    direction: 'lower_better',
    current: 0.55,
    prior: 0.62,
    format: 'ratio',
    trend: [0.74, 0.70, 0.67, 0.64, 0.61, 0.59, 0.57, 0.55],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.35,
      top_quartile:  0.60,
      premier_peer:  0.58,
      state_avg:     0.82,
      system_avg:    0.59,
    },
  },
  {
    kpiId: 'cdiff',
    direction: 'lower_better',
    current: 0.83,
    prior: 0.91,
    format: 'ratio',
    trend: [0.98, 0.96, 0.94, 0.92, 0.90, 0.88, 0.86, 0.83],
    benchmarks: {
      national_avg:  1.00,
      top_decile:    0.48,
      top_quartile:  0.77,
      premier_peer:  0.86,
      state_avg:     0.98,
      system_avg:    0.85,
    },
  },

  // ── Patient Experience (HCAHPS) ───────────────────────────────────────────
  {
    kpiId: 'hcahps_overall',
    direction: 'higher_better',
    current: 74,
    prior: 72,
    format: 'percent',
    trend: [70, 71, 71, 72, 72, 73, 73, 74],
    benchmarks: {
      national_avg:  71,
      top_decile:    84,
      top_quartile:  77,
      premier_peer:  75,
      state_avg:     70,
      system_avg:    73,
    },
  },
  {
    kpiId: 'hcahps_nurses',
    direction: 'higher_better',
    current: 81,
    prior: 79,
    format: 'percent',
    trend: [77, 78, 78, 79, 79, 80, 80, 81],
    benchmarks: {
      national_avg:  78,
      top_decile:    89,
      top_quartile:  83,
      premier_peer:  80,
      state_avg:     77,
      system_avg:    80,
    },
  },
  {
    kpiId: 'hcahps_doctors',
    direction: 'higher_better',
    current: 83,
    prior: 82,
    format: 'percent',
    trend: [80, 81, 81, 82, 82, 82, 83, 83],
    benchmarks: {
      national_avg:  80,
      top_decile:    91,
      top_quartile:  85,
      premier_peer:  82,
      state_avg:     79,
      system_avg:    82,
    },
  },
  {
    kpiId: 'hcahps_staff',
    direction: 'higher_better',
    current: 69,
    prior: 71,
    format: 'percent',
    trend: [72, 71, 71, 70, 70, 70, 69, 69],
    benchmarks: {
      national_avg:  67,
      top_decile:    80,
      top_quartile:  72,
      premier_peer:  70,
      state_avg:     66,
      system_avg:    68,
    },
  },
  {
    kpiId: 'hcahps_meds',
    direction: 'higher_better',
    current: 66,
    prior: 64,
    format: 'percent',
    trend: [62, 63, 63, 64, 64, 65, 65, 66],
    benchmarks: {
      national_avg:  64,
      top_decile:    78,
      top_quartile:  68,
      premier_peer:  67,
      state_avg:     63,
      system_avg:    65,
    },
  },
  {
    kpiId: 'hcahps_discharge',
    direction: 'higher_better',
    current: 88,
    prior: 87,
    format: 'percent',
    trend: [85, 86, 86, 87, 87, 87, 88, 88],
    benchmarks: {
      national_avg:  85,
      top_decile:    94,
      top_quartile:  89,
      premier_peer:  87,
      state_avg:     84,
      system_avg:    87,
    },
  },

  // ── Efficiency ────────────────────────────────────────────────────────────
  {
    kpiId: 'alos',
    direction: 'lower_better',
    current: 4.8,
    prior: 5.1,
    format: 'days',
    trend: [5.4, 5.3, 5.2, 5.1, 5.0, 5.0, 4.9, 4.8],
    benchmarks: {
      national_avg:  5.0,
      top_decile:    3.9,
      top_quartile:  4.5,
      premier_peer:  4.7,
      state_avg:     5.2,
      system_avg:    4.9,
    },
  },
  {
    kpiId: 'cmi',
    direction: 'neutral',
    current: 1.62,
    prior: 1.58,
    format: 'index',
    trend: [1.54, 1.56, 1.57, 1.58, 1.59, 1.60, 1.61, 1.62],
    benchmarks: {
      national_avg:  1.45,
    },
  },
  {
    kpiId: 'cost_per_case',
    direction: 'lower_better',
    current: 8420,
    prior: 8750,
    format: 'currency',
    trend: [9400, 9200, 9000, 8900, 8800, 8750, 8600, 8420],
    benchmarks: {
      national_avg:  9200,
      top_decile:    7100,
      top_quartile:  8000,
      premier_peer:  8600,
      state_avg:     9400,
    },
  },
  {
    kpiId: 'or_utilization',
    direction: 'higher_better',
    current: 78,
    prior: 75,
    format: 'percent',
    trend: [70, 71, 72, 73, 74, 75, 76, 78],
    benchmarks: {
      national_avg:  72,
      top_decile:    86,
      top_quartile:  80,
      premier_peer:  77,
      state_avg:     71,
    },
  },
  {
    kpiId: 'ed_lwbs',
    direction: 'lower_better',
    current: 1.8,
    prior: 2.1,
    format: 'percent',
    trend: [2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.0, 1.8],
    benchmarks: {
      national_avg:  2.0,
      top_decile:    0.9,
      top_quartile:  1.5,
      premier_peer:  1.7,
      state_avg:     2.3,
    },
  },
]

/** Convenience lookup by kpiId — system-level metrics */
export const METRIC_BY_KPI: Record<string, MetricSnapshot> = Object.fromEntries(
  MOCK_METRICS.map(m => [m.kpiId, m])
)

/** System-level metrics map (alias for getMetricsForContext convenience) */
export const METRICS: Record<string, MetricSnapshot> = METRIC_BY_KPI

// ─── KPIs where higher values = better performance ────────────────────────────
const HIGHER_BETTER_IDS = new Set([
  'cms_overall', 'cms_mortality', 'cms_readmission', 'cms_safety',
  'cms_experience', 'cms_timely', 'hcahps_overall', 'hcahps_nurses',
  'hcahps_doctors', 'hcahps_staff', 'hcahps_meds', 'hcahps_discharge',
  'or_utilization', 'cmi',
])

/**
 * Scale a metric snapshot by a performance factor.
 * For lower_better KPIs: factor > 1 means worse; multiply directly.
 * For higher_better KPIs: factor > 1 means worse; divide to invert.
 * For neutral: multiply directly.
 */
function scaleMetric(base: MetricSnapshot, factor: number): MetricSnapshot {
  const invert = HIGHER_BETTER_IDS.has(base.kpiId)
  const effectiveFactor = invert ? (1 / factor) : factor
  const scale = (v: number) => Math.round(v * effectiveFactor * 100) / 100

  return {
    ...base,
    current: scale(base.current),
    prior: scale(base.prior),
    benchmarks: Object.fromEntries(
      Object.entries(base.benchmarks).map(([k, v]) => [k, v !== undefined ? scale(v) : v])
    ) as BenchmarkValues,
    trend: base.trend.map(v => scale(v)),
  }
}

// Hospital performance factors (factor > 1 means worse than system average)
const HOSPITAL_FACTORS: Record<string, number> = {
  'nhg-01': 0.92,  // academic 542 beds — better than system
  'nhg-02': 1.05,  // community 218 beds — slightly worse
  'nhg-03': 0.98,  // community 310 beds — near system average
  'nhg-04': 1.14,  // critical access 48 beds — worse
  'nhg-05': 1.02,  // community 175 beds — slightly worse
}

/** Per-hospital metric snapshots keyed by hospitalId → kpiId */
export const HOSPITAL_METRICS: Record<string, Record<string, MetricSnapshot>> = Object.fromEntries(
  Object.entries(HOSPITAL_FACTORS).map(([hospitalId, factor]) => [
    hospitalId,
    Object.fromEntries(
      MOCK_METRICS.map(base => [base.kpiId, scaleMetric(base, factor)])
    ),
  ])
)

/**
 * Get the appropriate metrics map for a given ViewContext.
 * - system: returns system-level METRICS
 * - hospital (single): returns that hospital's scaled metrics
 * - group (2+ hospitals): returns averaged metrics across selected hospitals
 */
export function getMetricsForContext(context: ViewContext): Record<string, MetricSnapshot> {
  if (context.type === 'system') return METRICS

  if (context.type === 'hospital' && context.hospitalIds.length === 1) {
    return HOSPITAL_METRICS[context.hospitalIds[0]] ?? METRICS
  }

  if (context.type === 'group' && context.hospitalIds.length >= 2) {
    const selected = context.hospitalIds.map(id => HOSPITAL_METRICS[id] ?? METRICS)
    const kpiIds = Object.keys(METRICS)

    return Object.fromEntries(
      kpiIds.map(kpiId => {
        const snapshots = selected.map(m => m[kpiId]).filter((s): s is MetricSnapshot => s !== undefined)
        if (!snapshots.length) return [kpiId, METRICS[kpiId]]

        const avg = (arr: number[]) =>
          Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100

        const base = snapshots[0]
        const benchmarkKeys = Object.keys(base.benchmarks)

        return [kpiId, {
          ...base,
          current: avg(snapshots.map(s => s.current)),
          prior: avg(snapshots.map(s => s.prior)),
          benchmarks: Object.fromEntries(
            benchmarkKeys.map(bk => {
              const vals = snapshots
                .map(s => s.benchmarks[bk])
                .filter((v): v is number => v !== undefined)
              return [bk, vals.length > 0 ? avg(vals) : undefined]
            })
          ) as BenchmarkValues,
          trend: base.trend.map((_, i) => avg(snapshots.map(s => s.trend[i]))),
        }]
      })
    )
  }

  return METRICS
}
