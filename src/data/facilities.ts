export interface Hospital {
  id: string
  name: string
  city: string
  state: string
  type: 'academic' | 'community' | 'critical_access'
  beds: number
}

export interface HealthSystem {
  id: string
  name: string
  hospitals: Hospital[]
}

export const HEALTH_SYSTEM: HealthSystem = {
  id: 'nhg',
  name: 'Northfield Health Group',
  hospitals: [
    {
      id: 'nhg-01',
      name: 'Northfield Medical Center',
      city: 'Springfield',
      state: 'IL',
      type: 'academic',
      beds: 542,
    },
    {
      id: 'nhg-02',
      name: 'Riverside Community Hospital',
      city: 'Riverside',
      state: 'IL',
      type: 'community',
      beds: 218,
    },
    {
      id: 'nhg-03',
      name: 'Lakeside Regional Medical Center',
      city: 'Lakeside',
      state: 'IL',
      type: 'community',
      beds: 310,
    },
    {
      id: 'nhg-04',
      name: 'Westbrook Specialty Hospital',
      city: 'Westbrook',
      state: 'IL',
      type: 'critical_access',
      beds: 48,
    },
    {
      id: 'nhg-05',
      name: 'Elmwood General Hospital',
      city: 'Elmwood',
      state: 'IL',
      type: 'community',
      beds: 175,
    },
  ],
}
