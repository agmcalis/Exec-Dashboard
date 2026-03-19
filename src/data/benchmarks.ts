import type { ViewLevel } from '../types/wizard'

export interface BenchmarkDef {
  id: string
  name: string
  description: string
  source: string
  tag: string
  scopeExclude?: ViewLevel[]
}

export const BENCHMARK_DEFS: BenchmarkDef[] = [
  {
    id: 'national_avg',
    name: 'National Average',
    description: 'All-hospital national average derived from CMS Care Compare and national claims data.',
    source: 'CMS Care Compare',
    tag: 'CMS',
  },
  {
    id: 'top_decile',
    name: 'Top Decile',
    description: 'Performance at the 90th percentile nationally — a stretch goal representing top-tier outcomes.',
    source: 'CMS Care Compare',
    tag: 'CMS',
  },
  {
    id: 'top_quartile',
    name: 'Top Quartile',
    description: 'Performance at the 75th percentile nationally — a meaningful aspirational target.',
    source: 'CMS Care Compare',
    tag: 'CMS',
  },
  {
    id: 'premier_peer',
    name: 'Premier Peer Group',
    description: "Risk-adjusted benchmark from Premier's member database, matched by hospital type, size, and teaching status.",
    source: 'Premier Database',
    tag: 'Premier',
  },
  {
    id: 'state_avg',
    name: 'State Average',
    description: 'Average performance for hospitals in your state, providing a regional context.',
    source: 'State DOH / CMS',
    tag: 'State',
  },
  {
    id: 'system_avg',
    name: 'Internal System Average',
    description: 'The aggregate average across all hospitals in your health system — useful for internal comparisons.',
    source: 'Internal',
    tag: 'Internal',
    scopeExclude: ['system'],
  },
]
