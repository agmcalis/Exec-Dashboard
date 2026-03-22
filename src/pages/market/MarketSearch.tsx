import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import { searchHospitals } from '../../services/cmsApi'
import type { CmsHospital } from '../../types/market'

interface MarketSearchProps {
  onSwitchToCompare: () => void
}

const starColor: Record<number, string> = {
  1: 'bg-red-950/40 text-red-400 border border-red-800/30',
  2: 'bg-orange-950/40 text-orange-400 border border-orange-800/30',
  3: 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/30',
  4: 'bg-lime-950/40 text-lime-400 border border-lime-800/30',
  5: 'bg-green-950/40 text-green-400 border border-green-800/30',
}

function SearchResultCard({ hospital }: { hospital: CmsHospital }) {
  const { addHospital, removeHospital, isSelected } = useMarketStore()
  const selected = isSelected(hospital.facilityId)

  return (
    <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3 hover:border-border-hi transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{hospital.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{hospital.city}, {hospital.state} · {hospital.hospitalType}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {hospital.overallRating !== null && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${starColor[hospital.overallRating] ?? ''}`}>
            ★ {hospital.overallRating}
          </span>
        )}
        {selected ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-better font-semibold">✓ Added</span>
            <button
              onClick={() => removeHospital(hospital.facilityId)}
              className="text-slate-500 hover:text-worse transition-colors"
              title="Remove"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addHospital(hospital)}
            className="text-xs px-3 py-1 rounded-lg border border-better text-better hover:bg-better/10 font-medium transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )
}

export default function MarketSearch({ onSwitchToCompare }: MarketSearchProps) {
  const { selectedHospitals, removeHospital } = useMarketStore()
  const [query, setQuery] = useState('')

  // Synchronous local search — instant, no API call needed
  const results: CmsHospital[] = query.trim().length >= 2 ? searchHospitals(query) : []
  const searched = query.trim().length >= 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex h-full"
    >
      {/* Left: search + results */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by hospital name, city, or state..."
            className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-premier transition-colors"
          />
        </div>

        {/* No results */}
        {searched && results.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No hospitals found for "{query}"</p>
        )}

        {/* Hint */}
        {!searched && query.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">Search 5,400+ hospitals from CMS Care Compare</p>
        )}

        {/* Results */}
        <div className="flex flex-col gap-2">
          {results.map(h => (
            <SearchResultCard key={h.facilityId} hospital={h} />
          ))}
        </div>
      </div>

      {/* Right: selected panel */}
      <div className="w-72 shrink-0 border-l border-border p-5 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Selected ({selectedHospitals.length})
          </h3>
          <button
            onClick={onSwitchToCompare}
            className="text-xs text-premier hover:underline"
          >
            View Compare →
          </button>
        </div>

        {selectedHospitals.length === 0 && (
          <p className="text-xs text-slate-500">Search and add hospitals to compare</p>
        )}

        {selectedHospitals.map(h => (
          <div key={h.facilityId} className="flex items-center gap-2">
            {h.isOwn && (
              <span className="text-[9px] bg-premier-muted text-premier px-1.5 py-0.5 rounded font-bold shrink-0">
                YOUR ORG
              </span>
            )}
            <span className="text-xs text-white truncate flex-1">{h.name}</span>
            {!h.isOwn && (
              <button
                onClick={() => removeHospital(h.facilityId)}
                className="text-slate-500 hover:text-worse shrink-0"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
