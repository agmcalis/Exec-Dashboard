import { useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import { getHospitalsWithinRadius } from '../../services/cmsApi'
import type { CmsHospital } from '../../types/market'

// Fix Leaflet default marker icons with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const SPRINGFIELD_IL: [number, number] = [39.7817, -89.6501]

function createMarkerIcon(rating: number | null, isOwn: boolean): L.DivIcon {
  const color = isOwn
    ? '#24a3e3'
    : rating === 5 ? '#22c55e'
    : rating === 4 ? '#84cc16'
    : rating === 3 ? '#eab308'
    : rating === 2 ? '#f97316'
    : rating === 1 ? '#ef4444'
    : '#64748b'

  const size = isOwn ? 16 : 12
  const border = isOwn ? '2.5px solid white' : '1.5px solid white'
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:0 2px 5px rgba(0,0,0,0.5)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const LEGEND_COLORS: Record<number, string> = {
  5: '#22c55e',
  4: '#84cc16',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444',
}

/** Listens for map clicks and updates the circle center */
function ClickHandler({ onCenter }: { onCenter: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onCenter([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

interface HospitalPopupProps {
  hospital: CmsHospital
  onAdd: (h: CmsHospital) => void
  isSelected: boolean
}

function HospitalPopup({ hospital: h, onAdd, isSelected }: HospitalPopupProps) {
  return (
    <div style={{ fontFamily: 'Inter Tight, sans-serif', minWidth: 190 }}>
      {h.isOwn && (
        <div style={{ fontSize: 10, color: '#24a3e3', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Organization
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{h.name}</div>
      <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{h.city}, {h.state} · {h.hospitalType}</div>
      {h.overallRating !== null && (
        <div style={{ fontSize: 12, marginBottom: 6 }}>
          {'★'.repeat(h.overallRating)}{'☆'.repeat(5 - h.overallRating)} &nbsp;{h.overallRating}/5
        </div>
      )}
      {!h.isOwn && (
        <button
          onClick={() => onAdd(h)}
          disabled={isSelected}
          style={{
            marginTop: 4,
            background: isSelected ? '#1e3a4a' : '#24a3e3',
            color: isSelected ? '#94a3b8' : 'white',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            cursor: isSelected ? 'default' : 'pointer',
            width: '100%',
            fontWeight: 600,
          }}
        >
          {isSelected ? '✓ Added to Compare' : '+ Add to Compare'}
        </button>
      )}
    </div>
  )
}

export default function MarketMap() {
  const { selectedHospitals, addHospital } = useMarketStore()
  const ownHospitals = selectedHospitals.filter(h => h.isOwn)
  const selectedIds = new Set(selectedHospitals.map(h => h.facilityId))

  const PRESETS = [5, 10, 25, 50, 100]
  const [radius, setRadius] = useState(25)
  const [customInput, setCustomInput] = useState('')
  const [center, setCenter] = useState<[number, number]>(SPRINGFIELD_IL)

  function applyCustomRadius() {
    const n = parseInt(customInput, 10)
    if (!isNaN(n) && n > 0 && n <= 500) setRadius(n)
    else setCustomInput('')
  }

  const handleCenter = useCallback((pos: [number, number]) => setCenter(pos), [])

  // Synchronous local search — instant results, no loading state needed
  const mapHospitals: CmsHospital[] = useMemo(
    () => getHospitalsWithinRadius(center[0], center[1], radius),
    [center, radius],
  )

  const hospitalCount = mapHospitals.length

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
        <div className="flex gap-1 items-center">
          {PRESETS.map(r => (
            <button
              key={r}
              onClick={() => { setRadius(r); setCustomInput('') }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                radius === r && !customInput
                  ? 'bg-premier text-white'
                  : 'text-slate-400 hover:text-white bg-surface-2'
              }`}
            >
              {r} mi
            </button>
          ))}
          {/* Custom radius input */}
          <div className="flex items-center gap-1 ml-1">
            <input
              type="number"
              min={1}
              max={500}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onBlur={applyCustomRadius}
              onKeyDown={e => e.key === 'Enter' && applyCustomRadius()}
              placeholder="Custom"
              className={`w-20 text-xs px-2 py-1.5 rounded-lg bg-surface-2 border transition-colors outline-none text-white placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                customInput && !PRESETS.includes(radius)
                  ? 'border-premier text-premier'
                  : 'border-border focus:border-premier'
              }`}
            />
            <span className="text-xs text-slate-500">mi</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 ml-auto">
          {hospitalCount} hospital{hospitalCount !== 1 ? 's' : ''} within {radius} mi
          &nbsp;·&nbsp;
          <span className="text-slate-500">Click map to move circle</span>
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={9}
          style={{ height: '100%', width: '100%', background: '#071624' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <ClickHandler onCenter={handleCenter} />

          {/* Radius circle */}
          <Circle
            center={center}
            radius={radius * 1609.34}
            pathOptions={{
              color: '#24a3e3',
              fillColor: '#24a3e3',
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: '5 4',
            }}
          />

          {/* CMS hospitals within radius */}
          {mapHospitals.map(h =>
            h.lat !== null && h.lng !== null ? (
              <Marker
                key={h.facilityId}
                position={[h.lat!, h.lng!]}
                icon={createMarkerIcon(h.overallRating, false)}
              >
                <Popup>
                  <HospitalPopup
                    hospital={h}
                    onAdd={addHospital}
                    isSelected={selectedIds.has(h.facilityId)}
                  />
                </Popup>
              </Marker>
            ) : null
          )}

          {/* Own org hospitals (always shown, larger blue pins) */}
          {ownHospitals.map(h =>
            h.lat !== null && h.lng !== null ? (
              <Marker
                key={`own-${h.facilityId}`}
                position={[h.lat!, h.lng!]}
                icon={createMarkerIcon(h.overallRating, true)}
              >
                <Popup>
                  <HospitalPopup
                    hospital={h}
                    onAdd={addHospital}
                    isSelected={true}
                  />
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>

        {/* Star rating legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(7,22,36,0.92)',
            borderRadius: 10,
            padding: '10px 14px',
            zIndex: 1000,
            fontSize: 11,
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CMS Star Rating
          </div>
          {[5, 4, 3, 2, 1].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: LEGEND_COLORS[n], border: '1.5px solid white' }} />
              <span>{n} Star{n !== 1 ? 's' : ''}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#24a3e3', border: '2px solid white' }} />
            <span style={{ color: '#24a3e3' }}>Your Org</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b', border: '1.5px solid white' }} />
            <span>Not Rated</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
