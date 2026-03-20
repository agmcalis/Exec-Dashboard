export type PeriodType = '1Q' | 'R12' | 'YTD' | 'R36'

export interface TimePeriod {
  type: PeriodType
  endingQuarter: string   // e.g. '4Q2025'
}

export const DEFAULT_TIME_PERIOD: TimePeriod = {
  type: 'R12',
  endingQuarter: '4Q2025',
}

export type ContextType = 'system' | 'hospital' | 'group'

export interface ViewContext {
  type: ContextType
  hospitalIds: string[] // empty for system; one id for hospital; 2+ for group
}

export const DEFAULT_CONTEXT: ViewContext = { type: 'system', hospitalIds: [] }

export interface WizardState {
  step: 1 | 2
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  viewName: string
}

export interface SavedView {
  id: string
  name: string
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  createdAt: number
  timePeriod?: TimePeriod
}

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 1,
  selectedKpiIds: [],
  selectedBenchmarkIds: [],
  viewName: '',
}

export const STORAGE_KEY = 'exec_dashboard_views'

export function generateViewName(index: number): string {
  return `View ${index + 1}`
}
