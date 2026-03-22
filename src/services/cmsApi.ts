import type { CmsHospital, ComparisonTier } from '../types/market'
import { CMS_HOSPITALS_RAW } from '../data/cmsHospitalsRaw'

// ─── Static dataset search (works offline / on GitHub Pages) ─────────────────

function toTier(raw: string): ComparisonTier {
  if (raw === 'above') return 'above'
  if (raw === 'below') return 'below'
  return 'same'
}

function expandRaw(h: typeof CMS_HOSPITALS_RAW[number]): CmsHospital {
  return {
    facilityId:   h.i,
    name:         h.n,
    address:      '',
    city:         h.c,
    state:        h.s,
    zipCode:      h.z,
    hospitalType: h.t,
    overallRating: h.r,
    mortality:    toTier(h.m),
    safety:       toTier(h.sf),
    readmission:  toTier(h.rd),
    patientExp:   null,
    timeliness:   null,
    effectiveCare: null,
    lat:          null,
    lng:          null,
    isOwn:        false,
    ownHospitalId: undefined,
  }
}

/** Search local CMS dataset — works offline, instant results */
export function searchHospitals(query: string): CmsHospital[] {
  if (!query || query.trim().length < 2) return []
  const q = query.trim().toUpperCase()
  return CMS_HOSPITALS_RAW
    .filter(h => h.n.includes(q) || h.c.toUpperCase().includes(q) || h.s.toUpperCase() === q)
    .slice(0, 40)
    .map(expandRaw)
}

/** Geographic search — requires geocoding integration (lat/lng removed from CMS dataset) */
export async function getHospitalsInBoundingBox(
  _minLat: number,
  _maxLat: number,
  _minLng: number,
  _maxLng: number,
): Promise<CmsHospital[]> {
  return []
}
