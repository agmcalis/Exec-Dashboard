import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import { getHospitalsInBoundingBox } from '../../services/cmsApi'
import type { CmsHospital } from '../../types/market'

// Fix Leaflet default marker icons with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const SPRINGFIELD_IL: [number, number] = [39.7817, -89.6501]
const MILES_TO_DEG_LAT = 1 / 69.0

function mileToLngDeg(miles: number, lat: number): number {
  return miles / (69.0 * Math.cos(lat * Math.PI / 180))
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function createMarkerIcon(rating: number | null, isOwn: boolean): L.DivIcon {
  const color = isOwn ? '#24a3e3'
    : rating === 5 ? '#22c55e'
    : rating === 4 ? '#84cc16'
    : rating === 3 ? '#eab308'
    : rating === 2 ? '#f97316'
    : rating === 1 ? '#ef4444'
    : '#64748b'

  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const LEGEND_COLORS: Record<number, string> = {
  5: '#22c55e',
  4: '#84cc16',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444',
}

export default function MarketMap() {
  const { selectedHospitals, addHospital } = useMarketStore()
  const ownHospitals = selectedHospitals.filter(h => h.isOwn)

  const [radius, setRadius] = useState(25)
  const [mapHospitals, setMapHospitals] = useState<CmsHospital[]>([])
  const [loading, setLoading] = useState(false)
  const center: [number, number] = SPRINGFIELD_IL

  useEffect(() => {
    const [lat, lng] = center
    const latDelta = radius * MILES_TO_DEG_LAT
    const lngDelta = mileToLngDeg(radius, lat)
    setLoading(true)
    getHospitalsInBoundingBox(
      lat - latDelta,
      lat + latDelta,
      lng - lngDelta,
      lng + lngDelta,
    ).then(results => {
      const filtered = results.filter(h =>
        h.lat !== null && h.lng !== null &&
        getDistance(lat, h.lat!, lng, h.lng!) <= radius
      )
      setMapHospitals(filtered)
    }).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, center.join(',')])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-4 flex-wrap shrink-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Radius</span>
        <div className="flex gap-1">
          {[5, 10, 25, 50, 100].map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                radius === r
                  ? 'bg-premier text-white'
                  : 'text-slate-400 hover:text-white bg-surface-2'
              }`}
            >
              {r} mi
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-auto italic">
          Your org hospitals shown · external hospital pins require geocoding integration
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%', background: '#071624' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Radius circle */}
          <Circle
            center={center}
            radius={radius * 1609.34}
            pathOptions={{
              color: '#24a3e3',
              fillColor: '#24a3e3',
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: '4 4',
            }}
          />

          {/* CMS hospitals in range */}
          {mapHospitals.map(h =>
            h.lat && h.lng ? (
              <Marker
                key={h.facilityId}
                position={[h.lat, h.lng]}
                icon={createMarkerIcon(h.overallRating, false)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter Tight, sans-serif', minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{h.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>{h.city}, {h.state}</div>
                    {h.overallRating !== null && (
                      <div style={{ marginTop: 6, fontSize: 12 }}>★ {h.overallRating} overall</div>
                    )}
                    <button
                      onClick={() => addHospital(h)}
                      style={{
                        marginTop: 8,
                        background: '#24a3e3',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      + Add to Compare
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}

          {/* Own org hospitals */}
          {ownHospitals.map(h =>
            h.lat && h.lng ? (
              <Marker
                key={h.facilityId}
                position={[h.lat, h.lng]}
                icon={createMarkerIcon(h.overallRating, true)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter Tight, sans-serif', minWidth: 180 }}>
                    <div style={{ fontSize: 10, color: '#24a3e3', fontWeight: 700, marginBottom: 2 }}>
                      YOUR ORGANIZATION
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>{h.city}, {h.state}</div>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(7,22,36,0.9)',
            borderRadius: 10,
            padding: '10px 14px',
            zIndex: 1000,
            fontSize: 11,
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
              color: '#fff',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Star Rating
          </div>
          {[5, 4, 3, 2, 1].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: LEGEND_COLORS[n],
                  border: '1.5px solid white',
                }}
              />
              <span>{n} Star{n !== 1 ? 's' : ''}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              paddingTop: 6,
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#24a3e3',
                border: '1.5px solid white',
              }}
            />
            <span style={{ color: '#24a3e3' }}>Your Org</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
