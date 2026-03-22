import type { CmsHospital, ComparisonTier } from '../types/market'
import { CMS_HOSPITALS_RAW } from '../data/cmsHospitalsRaw'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTier(raw: string): ComparisonTier {
  if (raw === 'above') return 'above'
  if (raw === 'below') return 'below'
  return 'same'
}

function expandRaw(h: typeof CMS_HOSPITALS_RAW[number]): CmsHospital {
  return {
    facilityId:    h.i,
    name:          h.n,
    address:       '',
    city:          h.c,
    state:         h.s,
    zipCode:       h.z,
    hospitalType:  h.t,
    overallRating: h.r,
    mortality:     toTier(h.m),
    safety:        toTier(h.sf),
    readmission:   toTier(h.rd),
    patientExp:    null,
    timeliness:    null,
    effectiveCare: null,
    lat:           h.lat ?? null,
    lng:           h.lng ?? null,
    isOwn:         false,
    ownHospitalId: undefined,
  }
}

// Haversine distance in miles
function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Instant client-side search by name, city, or state — works offline */
export function searchHospitals(query: string): CmsHospital[] {
  if (!query || query.trim().length < 2) return []
  const q = query.trim().toUpperCase()
  return CMS_HOSPITALS_RAW
    .filter(h => h.n.toUpperCase().includes(q) || h.c.toUpperCase().includes(q) || h.s.toUpperCase() === q)
    .slice(0, 40)
    .map(expandRaw)
}

/** Return all hospitals within `radiusMiles` of a lat/lng point */
export function getHospitalsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
): CmsHospital[] {
  // Fast bounding-box pre-filter, then exact Haversine
  const latDelta = radiusMiles / 69.0
  const lngDelta = radiusMiles / (69.0 * Math.cos(centerLat * Math.PI / 180))

  return CMS_HOSPITALS_RAW
    .filter(h => {
      if (h.lat === undefined || h.lng === undefined) return false
      // Cheap bbox check first
      if (Math.abs(h.lat - centerLat) > latDelta) return false
      if (Math.abs(h.lng - centerLng) > lngDelta) return false
      // Exact distance check
      return distanceMiles(centerLat, centerLng, h.lat, h.lng) <= radiusMiles
    })
    .map(expandRaw)
}

/** Legacy bounding-box signature — now uses local data */
export function getHospitalsInBoundingBox(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
): Promise<CmsHospital[]> {
  const results = CMS_HOSPITALS_RAW
    .filter(h =>
      h.lat !== undefined && h.lng !== undefined &&
      h.lat >= minLat && h.lat <= maxLat &&
      h.lng >= minLng && h.lng <= maxLng,
    )
    .map(expandRaw)
  return Promise.resolve(results)
}
