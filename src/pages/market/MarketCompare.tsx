import { useState } from 'react'
import { GitCompare, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import type { ComparisonTier, CmsHospital } from '../../types/market'

// ─── Helper components ───────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: ComparisonTier }) {
  if (!tier) return <span className="text-slate-600 text-xs">—</span>
  const styles: Record<NonNullable<ComparisonTier>, string> = {
    above: 'text-better text-xs font-semibold',
    same:  'text-slate-400 text-xs',
    below: 'text-worse text-xs font-semibold',
  }
  const labels: Record<NonNullable<ComparisonTier>, string> = {
    above: '▲ Above',
    same:  '= Same',
    below: '▼ Below',
  }
  return <span className={styles[tier]}>{labels[tier]}</span>
}

const starColor: Record<number, string> = {
  1: 'bg-red-950/40 text-red-400 border border-red-800/30',
  2: 'bg-orange-950/40 text-orange-400 border border-orange-800/30',
  3: 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/30',
  4: 'bg-lime-950/40 text-lime-400 border border-lime-800/30',
  5: 'bg-green-950/40 text-green-400 border border-green-800/30',
}

function StarBadge({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-slate-600 text-xs">—</span>
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${starColor[rating] ?? ''}`}>
      ★ {rating}
    </span>
  )
}

// ─── Peer group aggregation ───────────────────────────────────────────────────

type AggMode = 'avg' | 'median'

function tierScore(t: ComparisonTier): number {
  return t === 'above' ? 2 : t === 'same' ? 1 : t === 'below' ? 0 : -1
}

function scoredToTier(s: number): ComparisonTier {
  if (s >= 1.5) return 'above'
  if (s >= 0.5) return 'same'
  return 'below'
}

function aggTier(peers: CmsHospital[], key: keyof CmsHospital, mode: AggMode): { tier: ComparisonTier; count: number; total: number } {
  const tiers = peers.map(h => h[key] as ComparisonTier).filter(t => t !== null && t !== undefined)
  const total = tiers.length
  if (total === 0) return { tier: null, count: 0, total: 0 }
  const scores = tiers.map(tierScore).filter(s => s >= 0)
  if (scores.length === 0) return { tier: null, count: 0, total: 0 }
  let aggScore: number
  if (mode === 'avg') {
    aggScore = scores.reduce((a, b) => a + b, 0) / scores.length
  } else {
    const sorted = [...scores].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    aggScore = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }
  const aboveCount = tiers.filter(t => t === 'above').length
  return { tier: scoredToTier(aggScore), count: aboveCount, total }
}

function aggRating(peers: CmsHospital[], mode: AggMode): number | null {
  const ratings = peers.map(h => h.overallRating).filter((r): r is number => r !== null)
  if (ratings.length === 0) return null
  if (mode === 'avg') {
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
  } else {
    const sorted = [...ratings].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
  }
}

function PeerTierCell({ data }: { data: { tier: ComparisonTier; count: number; total: number } }) {
  if (!data.tier) return <span className="text-slate-600 text-xs">—</span>
  const color = data.tier === 'above' ? 'text-better' : data.tier === 'below' ? 'text-worse' : 'text-slate-400'
  const arrow = data.tier === 'above' ? '▲' : data.tier === 'below' ? '▼' : '='
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs font-semibold ${color}`}>{arrow} {data.tier === 'above' ? 'Above' : data.tier === 'below' ? 'Below' : 'Same'}</span>
      <span className="text-[10px] text-slate-500">{data.count}/{data.total} above</span>
    </div>
  )
}

function PeerStarCell({ rating, mode }: { rating: number | null; mode: AggMode }) {
  if (rating === null) return <span className="text-slate-600 text-xs">—</span>
  const display = mode === 'avg' ? rating.toFixed(1) : String(rating)
  // Color based on value
  const color = rating >= 4 ? 'text-lime-400' : rating >= 3 ? 'text-yellow-400' : 'text-orange-400'
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-bold ${color}`}>★ {display}</span>
      <span className="text-[10px] text-slate-500">{mode === 'avg' ? 'avg' : 'median'}</span>
    </div>
  )
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

function sortHospitals(hospitals: CmsHospital[]): CmsHospital[] {
  return [...hospitals].sort((a, b) => {
    if (a.isOwn && !b.isOwn) return -1
    if (!a.isOwn && b.isOwn) return 1
    return a.name.localeCompare(b.name)
  })
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MarketCompare() {
  const { selectedHospitals, removeHospital } = useMarketStore()
  const [aggMode, setAggMode] = useState<AggMode>('avg')

  if (selectedHospitals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center h-64 gap-4 text-center p-6"
      >
        <GitCompare size={40} className="text-slate-700" />
        <div>
          <p className="text-white font-semibold">No hospitals to compare</p>
          <p className="text-slate-400 text-sm mt-1">
            Select a context in the sidebar or search for hospitals to add
          </p>
        </div>
      </motion.div>
    )
  }

  const sorted = sortHospitals(selectedHospitals)
  const peers = sorted.filter(h => !h.isOwn)
  const hasPeers = peers.length > 0

  // Compute peer group aggregates
  const peerRating  = hasPeers ? aggRating(peers, aggMode) : null
  const peerMort    = hasPeers ? aggTier(peers, 'mortality',   aggMode) : null
  const peerSafety  = hasPeers ? aggTier(peers, 'safety',      aggMode) : null
  const peerReadm   = hasPeers ? aggTier(peers, 'readmission', aggMode) : null
  const peerExp     = hasPeers ? aggTier(peers, 'patientExp',  aggMode) : null
  const peerTime    = hasPeers ? aggTier(peers, 'timeliness',  aggMode) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[800px] text-left border-collapse">
        <thead>
          <tr className="bg-surface-2 sticky top-0 z-10">
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 min-w-[200px]">
              Hospital
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Overall</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Mortality</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Safety</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Readmissions</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Patient Exp</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">Timeliness</th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-10 text-center"></th>
          </tr>
        </thead>

        <tbody>
          {/* ── Peer group aggregate row ── */}
          {hasPeers && (
            <tr className="border-b border-border bg-surface-3/60">
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Peer Group
                    </span>
                    {/* Avg / Median toggle */}
                    <div className="flex bg-surface-2 rounded-md p-0.5 gap-0.5">
                      {(['avg', 'median'] as AggMode[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setAggMode(m)}
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors capitalize ${
                            aggMode === m ? 'bg-surface-3 text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {peers.length} selected hospital{peers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <PeerStarCell rating={peerRating} mode={aggMode} />
              </td>
              <td className="px-4 py-3 text-center">
                {peerMort && <PeerTierCell data={peerMort} />}
              </td>
              <td className="px-4 py-3 text-center">
                {peerSafety && <PeerTierCell data={peerSafety} />}
              </td>
              <td className="px-4 py-3 text-center">
                {peerReadm && <PeerTierCell data={peerReadm} />}
              </td>
              <td className="px-4 py-3 text-center">
                {peerExp && <PeerTierCell data={peerExp} />}
              </td>
              <td className="px-4 py-3 text-center">
                {peerTime && <PeerTierCell data={peerTime} />}
              </td>
              <td />
            </tr>
          )}

          {/* ── Individual hospital rows ── */}
          {sorted.map(h => (
            <tr
              key={h.facilityId}
              className={`border-b border-border transition-colors ${
                h.isOwn
                  ? 'bg-premier-muted/30 border-l-2 border-l-premier'
                  : 'bg-surface hover:bg-surface-2'
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  {h.isOwn && (
                    <span className="text-[9px] bg-premier-muted text-premier px-1.5 py-0.5 rounded font-bold w-fit">
                      YOUR ORG
                    </span>
                  )}
                  <span className="text-sm font-medium text-white">{h.name}</span>
                  <span className="text-xs text-slate-400">{h.city}, {h.state}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center"><StarBadge rating={h.overallRating} /></td>
              <td className="px-4 py-3 text-center"><TierBadge tier={h.mortality} /></td>
              <td className="px-4 py-3 text-center"><TierBadge tier={h.safety} /></td>
              <td className="px-4 py-3 text-center"><TierBadge tier={h.readmission} /></td>
              <td className="px-4 py-3 text-center"><TierBadge tier={h.patientExp} /></td>
              <td className="px-4 py-3 text-center"><TierBadge tier={h.timeliness} /></td>
              <td className="px-4 py-3 text-center">
                {!h.isOwn && (
                  <button
                    onClick={() => removeHospital(h.facilityId)}
                    className="text-slate-500 hover:text-worse transition-colors"
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
