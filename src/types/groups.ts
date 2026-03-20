export interface HospitalGroup {
  id: string
  name: string
  hospitalIds: string[]  // 2+ hospital IDs
  createdAt: number
}

export const GROUPS_STORAGE_KEY = 'exec_dashboard_groups'
