import { Users } from 'lucide-react'
import type { SharedView } from '../../store/appStore'
import type { KpiDef } from '../../data/kpis'
import type { BenchmarkDef } from '../../data/benchmarks'

interface SharedWithMePanelProps {
  sharedViews: SharedView[]
  addedViewIds: Set<string>
  onAdd: (sharedViewId: string) => void
  kpiDefs: KpiDef[]
  benchmarkDefs: BenchmarkDef[]
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
      {initials}
    </div>
  )
}

export default function SharedWithMePanel({
  sharedViews,
  addedViewIds,
  onAdd,
  kpiDefs,
  benchmarkDefs,
}: SharedWithMePanelProps) {
  if (sharedViews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
          <Users size={18} className="text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">No views have been shared with you yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sharedViews.map(sv => {
        const alreadyAdded = addedViewIds.has(sv.id)
        const kpiNames = sv.selectedKpiIds
          .map(id => kpiDefs.find(k => k.id === id)?.name)
          .filter((n): n is string => Boolean(n))
        const benchNames = sv.selectedBenchmarkIds
          .map(id => benchmarkDefs.find(b => b.id === id)?.name)
          .filter((n): n is string => Boolean(n))

        const visibleKpis = kpiNames.slice(0, 4)
        const extraKpis = kpiNames.length - 4

        return (
          <div
            key={sv.id}
            className={`border rounded-xl p-4 transition-all ${
              alreadyAdded
                ? 'bg-surface border-border opacity-60 cursor-default'
                : 'bg-surface border-border hover:border-border-hi cursor-pointer'
            }`}
            onClick={() => {
              if (!alreadyAdded) onAdd(sv.id)
            }}
          >
            {/* Top row: name + action */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-semibold text-white text-sm truncate">{sv.name}</span>
              {alreadyAdded ? (
                <span className="text-[11px] font-medium text-slate-500 shrink-0">
                  ✓ Already Added
                </span>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onAdd(sv.id)
                  }}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-premier hover:bg-premier-hover text-white transition-all cursor-pointer"
                >
                  Add View
                </button>
              )}
            </div>

            {/* Shared by row */}
            <div className="flex items-center gap-1.5 mb-2">
              <InitialsAvatar initials={sv.sharedBy.initials} />
              <span className="text-xs text-slate-400">Shared by {sv.sharedBy.name}</span>
              <span className="text-xs text-slate-600">· {sv.sharedBy.title}</span>
            </div>

            {/* KPI names */}
            {visibleKpis.length > 0 && (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {visibleKpis.join(', ')}
                {extraKpis > 0 && (
                  <span className="text-slate-600"> +{extraKpis} more</span>
                )}
              </p>
            )}

            {/* Benchmarks */}
            {benchNames.length > 0 && (
              <p className="text-[11px] text-slate-600 mt-1">
                Benchmarks: {benchNames.join(', ')}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
