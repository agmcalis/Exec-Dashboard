import { GitCompare, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarketStore } from '../../store/marketStore'
import type { ComparisonTier, CmsHospital } from '../../types/market'

function TierBadge({ tier }: { tier: ComparisonTier }) {
  if (!tier) return <span className="text-slate-600 text-xs">—</span>
  const styles: Record<NonNullable<ComparisonTier>, string> = {
    above: 'text-better text-xs font-semibold',
    same: 'text-slate-400 text-xs',
    below: 'text-worse text-xs font-semibold',
  }
  const labels: Record<NonNullable<ComparisonTier>, string> = {
    above: '▲ Above',
    same: '= Same',
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

function sortHospitals(hospitals: CmsHospital[]): CmsHospital[] {
  return [...hospitals].sort((a, b) => {
    if (a.isOwn && !b.isOwn) return -1
    if (!a.isOwn && b.isOwn) return 1
    return a.name.localeCompare(b.name)
  })
}

export default function MarketCompare() {
  const { selectedHospitals, removeHospital } = useMarketStore()

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
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Overall
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Mortality
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Safety
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Readmissions
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Patient Exp
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-28 text-center">
              Timeliness
            </th>
            <th className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3 w-10 text-center">
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(h => (
            <tr
              key={h.facilityId}
              className={`border-b border-border ${
                h.isOwn
                  ? 'bg-premier-muted/30 border-l-2 border-l-premier'
                  : 'bg-surface hover:bg-surface-2'
              } transition-colors`}
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
              <td className="px-4 py-3 text-center">
                <StarBadge rating={h.overallRating} />
              </td>
              <td className="px-4 py-3 text-center">
                <TierBadge tier={h.mortality} />
              </td>
              <td className="px-4 py-3 text-center">
                <TierBadge tier={h.safety} />
              </td>
              <td className="px-4 py-3 text-center">
                <TierBadge tier={h.readmission} />
              </td>
              <td className="px-4 py-3 text-center">
                <TierBadge tier={h.patientExp} />
              </td>
              <td className="px-4 py-3 text-center">
                <TierBadge tier={h.timeliness} />
              </td>
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
