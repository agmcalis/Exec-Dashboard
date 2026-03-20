import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { BENCHMARK_DEFS } from '../../data/benchmarks'
import type { WizardState } from '../../types/wizard'
import StepIndicator from '../../components/wizard/StepIndicator'

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

function tagClasses(tag: string): string {
  switch (tag) {
    case 'CMS':
      return 'bg-blue-900/40 text-blue-300'
    case 'Premier':
      return 'bg-premier-muted text-premier'
    default:
      return 'bg-surface-3 text-slate-300'
  }
}

export default function Step2Benchmarks({ state, onChange, onNext, onBack }: Props) {
  const selectedIds = state.selectedBenchmarkIds

  function toggleBenchmark(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(b => b !== id)
      : [...selectedIds, id]
    onChange({ selectedBenchmarkIds: next })
  }

  const canContinue = selectedIds.length >= 1

  return (
    <div className="flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full">

      {/* Step indicator */}
      <StepIndicator current={2} total={2} />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="text-center mb-8 mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          How should performance be compared?
        </h2>
        <p className="text-slate-400 text-[15px]">
          Choose one or more benchmarks to display alongside your metrics.
        </p>
      </motion.div>

      {/* View name input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.28 }}
        className="w-full mb-6"
      >
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Name this view
        </label>
        <input
          type="text"
          value={state.viewName}
          onChange={e => onChange({ viewName: e.target.value })}
          placeholder="e.g. System Overview, HAI Focus, Q1 Review…"
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-premier transition-colors"
        />
      </motion.div>

      {/* Benchmark cards */}
      <div className="flex flex-col gap-3 w-full">
        {BENCHMARK_DEFS.map((benchmark, i) => {
          const isSelected = selectedIds.includes(benchmark.id)
          return (
            <motion.button
              key={benchmark.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.28 }}
              onClick={() => toggleBenchmark(benchmark.id)}
              className={cn(
                'flex items-center gap-4 text-left border-2 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-200 w-full',
                isSelected
                  ? 'border-premier bg-premier-muted'
                  : 'border-border bg-surface hover:border-border-hi hover:bg-surface-2'
              )}
            >
              {/* Checkbox left */}
              <div className="shrink-0">
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

              {/* Name + description */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white block">
                  {benchmark.name}
                </span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {benchmark.description}
                </p>
              </div>

              {/* Source tag pill */}
              <div className="shrink-0">
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md',
                    tagClasses(benchmark.tag)
                  )}
                >
                  {benchmark.tag}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

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
              {' '}benchmark{selectedIds.length !== 1 ? 's' : ''} selected
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
          Create View
          <Sparkles size={15} />
        </button>
      </motion.div>
    </div>
  )
}
