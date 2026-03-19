import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import type { SavedView, ViewLevel } from '../../types/wizard'

interface ViewTabsProps {
  views: SavedView[]
  activeViewId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

function levelLabel(level: ViewLevel): string {
  switch (level) {
    case 'system':  return 'System'
    case 'hospital': return 'Hospital'
    case 'group':   return 'Group'
  }
}

export default function ViewTabs({ views, activeViewId, onSelect, onNew, onDelete }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-border overflow-x-auto shrink-0">
      <AnimatePresence initial={false}>
        {views.map(view => {
          const isActive = view.id === activeViewId
          return (
            <motion.div
              key={view.id}
              initial={{ opacity: 0, scale: 0.9, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all cursor-pointer relative group shrink-0 ${
                isActive
                  ? 'bg-surface-2 text-white border border-b-0 border-border'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface/50'
              }`}
              onClick={() => onSelect(view.id)}
            >
              {/* Tab label */}
              <span className="max-w-[140px] truncate">{view.name}</span>

              {/* Level badge */}
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-3 text-slate-400 shrink-0">
                {levelLabel(view.level)}
              </span>

              {/* Delete button — only when multiple views exist */}
              {views.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(view.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-200 shrink-0 -mr-1"
                  aria-label={`Delete view "${view.name}"`}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* New view button */}
      <button
        onClick={onNew}
        className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-premier rounded-t-lg transition-colors shrink-0"
        aria-label="Add new view"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
