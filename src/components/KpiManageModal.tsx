import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { KPI_CATEGORIES, KPI_DEFS } from '../data/kpis'
import type { KpiCategory } from '../data/kpis'
import type { SavedView } from '../types/wizard'

interface KpiManageModalProps {
  view: SavedView
  onClose: () => void
  onSave: (selectedKpiIds: string[]) => void
}

export default function KpiManageModal({ view, onClose, onSave }: KpiManageModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(view.selectedKpiIds)
  const [activeCategory, setActiveCategory] = useState<KpiCategory>('outcomes')

  const visibleKpis = KPI_DEFS.filter(k => k.category === activeCategory)

  function toggleKpi(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    )
  }

  function selectedCountForCategory(cat: KpiCategory): number {
    return KPI_DEFS.filter(k => k.category === cat && selectedIds.includes(k.id)).length
  }

  function handleSave() {
    onSave(selectedIds)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={e => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-lg font-bold text-white">Manage KPIs</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap mb-5">
              {KPI_CATEGORIES.map(cat => {
                const count = selectedCountForCategory(cat.id)
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-premier text-white'
                        : 'bg-surface-2 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {cat.shortLabel}
                    {count > 0 && (
                      <span
                        className={cn(
                          'text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none',
                          isActive ? 'bg-white/20 text-white' : 'bg-premier text-white'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* KPI grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-2 gap-3"
              >
                {visibleKpis.map((kpi, i) => {
                  const isSelected = selectedIds.includes(kpi.id)
                  return (
                    <motion.button
                      key={kpi.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.22 }}
                      onClick={() => toggleKpi(kpi.id)}
                      className={cn(
                        'relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200',
                        isSelected
                          ? 'border-premier bg-premier-muted'
                          : 'border-border bg-surface hover:border-border-hi hover:bg-surface-2'
                      )}
                    >
                      {/* Checkbox top-right */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded flex items-center justify-center border-2 transition-all',
                            isSelected
                              ? 'bg-premier border-premier'
                              : 'border-slate-600 bg-transparent'
                          )}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Check size={11} strokeWidth={3} className="text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Name */}
                      <span
                        className={cn(
                          'text-sm font-semibold pr-8 transition-colors',
                          isSelected ? 'text-white' : 'text-slate-200'
                        )}
                      >
                        {kpi.name}
                      </span>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mt-1 flex-1">
                        {kpi.description}
                      </p>

                      {/* Unit badge */}
                      <div className="flex justify-end mt-3">
                        <span className="text-[10px] font-medium text-slate-500 bg-surface-2 rounded px-1.5 py-0.5">
                          {kpi.unit}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
            <span className="text-sm text-slate-400">
              <span className="text-white font-semibold">{selectedIds.length}</span> KPI{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-sm font-medium text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedIds.length === 0}
                className={cn(
                  'flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200',
                  selectedIds.length > 0
                    ? 'bg-premier hover:bg-premier-hover text-white'
                    : 'bg-surface-2 text-slate-600 cursor-not-allowed'
                )}
                style={selectedIds.length > 0 ? { boxShadow: '0 4px 16px rgba(36,163,227,0.25)' } : {}}
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
