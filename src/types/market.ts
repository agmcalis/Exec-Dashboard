export type ComparisonTier = 'above' | 'same' | 'below' | null

export interface CmsHospital {
  facilityId: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  hospitalType: string
  overallRating: number | null   // 1–5 stars or null
  mortality: ComparisonTier
  safety: ComparisonTier
  readmission: ComparisonTier
  patientExp: ComparisonTier
  timeliness: ComparisonTier
  effectiveCare: ComparisonTier
  lat: number | null
  lng: number | null
  isOwn: boolean   // true = one of our org's hospitals
  ownHospitalId?: string  // maps to HEALTH_SYSTEM hospital id if isOwn
}
