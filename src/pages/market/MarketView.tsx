import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import MarketCompare from './MarketCompare'
import MarketSearch from './MarketSearch'
import MarketMap from './MarketMap'
import type { CmsHospital } from '../../types/market'

type MarketTab = 'compare' | 'search' | 'map'

interface MarketViewProps {
  contextHospitals: CmsHospital[]
}

export default function MarketView({ contextHospitals }: MarketViewProps) {
  const store = useMarketStore()
  const { selectedHospitals } = store
  const [tab, setTab] = useState<MarketTab>('compare')

  useEffect(() => {
    // Replace own-org hospitals with new context, keep external ones
    const external = store.selectedHospitals.filter(h => !h.isOwn)
    store.setHospitals([...contextHospitals, ...external])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextHospitals.map(h => h.facilityId).join(',')])

  const tabLabel: Record<MarketTab, string> = {
    compare: 'Compare',
    search: 'Search Hospitals',
    map: 'Map',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Market Analysis</h1>
            <p className="text-xs text-slate-400 mt-0.5">Powered by CMS Care Compare</p>
          </div>
          {selectedHospitals.length > 0 && (
            <span className="text-xs bg-premier-muted text-premier px-3 py-1 rounded-full font-semibold">
              {selectedHospitals.length} hospital{selectedHospitals.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        {/* Sub-nav tabs */}
        <div className="flex gap-1">
          {(['compare', 'search', 'map'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${
                tab === t
                  ? 'bg-surface text-white border-t border-x border-border'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tabLabel[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'compare' && <MarketCompare key="compare" />}
          {tab === 'search' && (
            <MarketSearch key="search" onSwitchToCompare={() => setTab('compare')} />
          )}
          {tab === 'map' && <MarketMap key="map" />}
        </AnimatePresence>
      </div>
    </div>
  )
}
