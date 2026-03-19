import type { Hospital } from '../data/facilities'

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

export interface SavedView {
  id: string
  name: string
  level: ViewLevel
  selectedHospitalIds: string[]
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  createdAt: number
}

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 1,
  level: null,
  selectedHospitalIds: [],
  selectedKpiIds: [],
  selectedBenchmarkIds: [],
  viewName: '',
}

export const STORAGE_KEY = 'exec_dashboard_views'

export function generateViewName(wizard: WizardState, hospitals: Hospital[]): string {
  if (wizard.level === 'system') {
    return 'Health System'
  }

  if (wizard.level === 'hospital') {
    const hospital = hospitals.find(h => h.id === wizard.selectedHospitalIds[0])
    return hospital?.name ?? 'Single Hospital'
  }

  if (wizard.level === 'group') {
    const count = wizard.selectedHospitalIds.length
    if (count === 0) return 'Hospital Group'
    if (count === 1) {
      const hospital = hospitals.find(h => h.id === wizard.selectedHospitalIds[0])
      return hospital?.name ?? 'Single Hospital'
    }
    const first = hospitals.find(h => h.id === wizard.selectedHospitalIds[0])
    const firstName = first?.name ?? 'Hospital'
    return `${firstName} + ${count - 1} more`
  }

  return 'New View'
}
