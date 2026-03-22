import type { CmsHospital, ComparisonTier } from '../types/market'

const CMS_ENDPOINT = 'https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0'

/** Derive Above/Same/Below from count-based CMS fields */
function tierFromCounts(
  better: string | null | undefined,
  worse: string | null | undefined,
): ComparisonTier {
  const b = parseInt(better ?? '0', 10) || 0
  const w = parseInt(worse ?? '0', 10) || 0
  if (b === 0 && w === 0) return 'same'
  if (b > w) return 'above'
  if (w > b) return 'below'
  return 'same'
}

function parseRating(raw: string | null | undefined): number | null {
  if (!raw) return null
  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 1 || n > 5) return null
  return n
}

function mapCmsResult(raw: Record<string, unknown>): CmsHospital {
  return {
    facilityId:  String(raw['facility_id']  ?? ''),
    name:        String(raw['facility_name'] ?? ''),
    address:     String(raw['address']       ?? ''),
    city:        String(raw['citytown']      ?? ''),   // field renamed in current API
    state:       String(raw['state']         ?? ''),
    zipCode:     String(raw['zip_code']      ?? ''),
    hospitalType: String(raw['hospital_type'] ?? ''),
    overallRating: parseRating(raw['hospital_overall_rating'] as string | null),
    // Derive comparison tiers from measure counts
    mortality:   tierFromCounts(
      raw['count_of_mort_measures_better']  as string,
      raw['count_of_mort_measures_worse']   as string,
    ),
    safety:      tierFromCounts(
      raw['count_of_safety_measures_better'] as string,
      raw['count_of_safety_measures_worse']  as string,
    ),
    readmission: tierFromCounts(
      raw['count_of_readm_measures_better'] as string,
      raw['count_of_readm_measures_worse']  as string,
    ),
    patientExp:  null, // patient experience uses HCAHPS %, not better/worse counts
    timeliness:  null, // timeliness not in count form in current dataset
    effectiveCare: null,
    lat: null,  // lat/lng removed from this CMS dataset; geocoding needed
    lng: null,
    isOwn: false,
    ownHospitalId: undefined,
  }
}

export async function searchHospitals(query: string): Promise<CmsHospital[]> {
  try {
    const response = await fetch(CMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conditions: [
          // CMS data is ALL CAPS; wrap value in % wildcards for substring match
          { property: 'facility_name', value: `%${query.toUpperCase()}%`, operator: 'LIKE' },
        ],
        limit: 30,
        offset: 0,
        sort: [{ property: 'facility_name', order: 'asc' }],
      }),
    })
    if (!response.ok) return []
    const data = await response.json() as { results: Record<string, unknown>[] }
    return (data.results ?? []).map(mapCmsResult)
  } catch {
    return []
  }
}

/** Map-based fetch — lat/lng no longer in this CMS dataset; returns empty until geocoding is added */
export async function getHospitalsInBoundingBox(
  _minLat: number,
  _maxLat: number,
  _minLng: number,
  _maxLng: number,
): Promise<CmsHospital[]> {
  // The CMS Hospital General Info dataset no longer includes lat/lng coordinates.
  // A geocoding integration (e.g. Census Geocoder or Google Maps) is needed to
  // support geographic radius queries. Returning empty for now.
  return []
}
