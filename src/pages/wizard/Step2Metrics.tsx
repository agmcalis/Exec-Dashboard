import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { KPI_CATEGORIES, KPI_DEFS } from '../../data/kpis'
import type { KpiCategory } from '../../data/kpis'
import type { WizardState } from '../../types/wizard'
import StepIndicator from '../../components/wizard/StepIndicator'

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Metrics({ state, onChange, onNext, onBack }: Props) {
  const [activeCategory, setActiveCategory] = useState<KpiCategory>('outcomes')

  const visibleKpis = KPI_DEFS.filter(k => k.category === activeCategory)
  const selectedIds = state.selectedKpiIds

  function toggleKpi(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(k => k !== id)
      : [...selectedIds, id]
    onChange({ selectedKpiIds: next })
  }

  function selectedCountForCategory(cat: KpiCategory) {
    return KPI_DEFS.filter(k => k.category === cat && selectedIds.includes(k.id)).length
  }

  function selectedCategoryCount() {
    const cats = new Set(
      KPI_DEFS.filter(k => selectedIds.includes(k.id)).map(k => k.category)
    )
    return cats.size
  }

  const canContinue = selectedIds.length >= 1

  return (
    <div className="flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full">

      {/* Step indicator */}
      <StepIndicator current={2} total={3} />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="text-center mb-8 mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Which metrics do you want to track?</h2>
        <p className="text-slate-400 text-[15px]">
          Select one or more from each category that matters to you.
        </p>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex gap-2 w-full mb-5 flex-wrap"
      >
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
      </motion.div>

      {/* KPI cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-3 w-full"
        >
          {visibleKpis.map((kpi, i) => {
            const isSelected = selectedIds.includes(kpi.id)
            return (
              <motion.button
                key={kpi.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
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

                {/* Unit badge bottom-right */}
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

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between w-full mt-8 pt-6 border-t border-border"
      >
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          {selectedIds.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-slate-500 mt-2"
            >
              <span className="text-slate-300 font-medium">{selectedIds.length}</span>
              {' '}metric{selectedIds.length !== 1 ? 's' : ''} selected across{' '}
              <span className="text-slate-300 font-medium">{selectedCategoryCount()}</span>
              {' '}categor{selectedCategoryCount() !== 1 ? 'ies' : 'y'}
            </motion.p>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canContinue}
          className={cn(
            'flex items-center gap-2 text-[15px] font-semibold px-6 py-3 rounded-xl transition-all duration-200',
            canContinue
              ? 'bg-premier hover:bg-premier-hover text-white hover:-translate-y-0.5'
              : 'bg-surface-2 text-slate-600 cursor-not-allowed'
          )}
          style={canContinue ? { boxShadow: '0 6px 24px rgba(36,163,227,0.25)' } : {}}
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </motion.div>
    </div>
  )
}
