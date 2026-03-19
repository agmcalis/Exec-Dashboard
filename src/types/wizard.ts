export type ViewLevel = 'system' | 'hospital' | 'group'

export interface WizardState {
  step: 1 | 2 | 3
  level: ViewLevel | null
  // For 'hospital': single hospital id
  // For 'group': multiple hospital ids
  selectedHospitalIds: string[]
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  viewName: string
}

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 1,
  level: null,
  selectedHospitalIds: [],
  selectedKpiIds: [],
  selectedBenchmarkIds: [],
  viewName: '',
}
