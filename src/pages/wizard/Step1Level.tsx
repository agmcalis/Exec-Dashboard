import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Hospital, Layers, Check, ArrowRight, ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { HEALTH_SYSTEM } from '../../data/facilities'
import type { ViewLevel, WizardState } from '../../types/wizard'
import StepIndicator from '../../components/wizard/StepIndicator'

interface LevelOption {
  id: ViewLevel
  icon: React.ElementType
  label: string
  description: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'system',
    icon: Building2,
    label: 'Health System',
    description: 'Aggregate view across all hospitals in your system.',
  },
  {
    id: 'hospital',
    icon: Hospital,
    label: 'Single Hospital',
    description: 'Focus on one facility\'s performance and metrics.',
  },
  {
    id: 'group',
    icon: Layers,
    label: 'Hospital Group',
    description: 'Compare a custom selection of hospitals side by side.',
  },
]

const HOSPITAL_TYPE_LABELS = {
  academic:        'Academic Medical Center',
  community:       'Community Hospital',
  critical_access: 'Critical Access Hospital',
}

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step1Level({ state, onChange, onNext, onBack }: Props) {
  const hospitals = HEALTH_SYSTEM.hospitals

  function selectLevel(level: ViewLevel) {
    onChange({
      level,
      // Reset hospital selections when level changes
      selectedHospitalIds: level === 'system' ? [] : state.selectedHospitalIds,
    })
  }

  function toggleHospital(id: string) {
    const current = state.selectedHospitalIds
    const next = current.includes(id)
      ? current.filter(h => h !== id)
      : [...current, id]
    onChange({ selectedHospitalIds: next })
  }

  function selectSingleHospital(id: string) {
    onChange({ selectedHospitalIds: [id] })
  }

  const canContinue =
    state.level === 'system' ||
    (state.level === 'hospital' && state.selectedHospitalIds.length === 1) ||
    (state.level === 'group' && state.selectedHospitalIds.length >= 2)

  return (
    <div className="flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full">

      {/* Step indicator */}
      <StepIndicator current={1} total={3} />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="text-center mb-10 mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Who is this view for?</h2>
        <p className="text-slate-400 text-[15px]">
          Choose the organizational level this view will track.
        </p>
      </motion.div>

      {/* Level cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-3 w-full mb-6"
      >
        {LEVEL_OPTIONS.map((opt, i) => {
          const Icon = opt.icon
          const isSelected = state.level === opt.id

          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.35 }}
              onClick={() => selectLevel(opt.id)}
              className={cn(
                'relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-premier bg-premier-muted'
                  : 'border-border bg-surface hover:border-border-hi hover:bg-surface-2'
              )}
            >
              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className="absolute top-3 right-3 w-5 h-5 bg-premier rounded-full flex items-center justify-center"
                  >
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors',
                  isSelected ? 'bg-premier/20' : 'bg-surface-2'
                )}
              >
                <Icon
                  size={22}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'text-premier' : 'text-slate-400'
                  )}
                />
              </div>

              <div
                className={cn(
                  'font-semibold text-[15px] mb-1.5 transition-colors',
                  isSelected ? 'text-white' : 'text-slate-200'
                )}
              >
                {opt.label}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">{opt.description}</div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Hospital selector — shown for 'hospital' and 'group' */}
      <AnimatePresence>
        {state.level === 'hospital' && (
          <HospitalList
            hospitals={hospitals}
            selected={state.selectedHospitalIds}
            mode="single"
            onSelect={selectSingleHospital}
          />
        )}
        {state.level === 'group' && (
          <HospitalList
            hospitals={hospitals}
            selected={state.selectedHospitalIds}
            mode="multi"
            onToggle={toggleHospital}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between w-full mt-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronLeft size={15} />
          Back
        </button>

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

// ── Hospital list ──────────────────────────────────────────────────────────────

interface HospitalListProps {
  hospitals: typeof HEALTH_SYSTEM.hospitals
  selected: string[]
  mode: 'single' | 'multi'
  onSelect?: (id: string) => void
  onToggle?: (id: string) => void
}

function HospitalList({ hospitals, selected, mode, onSelect, onToggle }: HospitalListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="w-full overflow-hidden"
    >
      <div className="w-full bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {mode === 'single' ? 'Select a hospital' : 'Select hospitals to include'}
          </span>
          {mode === 'multi' && (
            <span className="text-xs text-premier font-medium">
              {selected.length > 0
                ? `${selected.length} of ${hospitals.length} selected`
                : 'Select 2 or more'}
            </span>
          )}
        </div>

        {/* Hospital rows */}
        <div>
          {hospitals.map((h, i) => {
            const isSelected = selected.includes(h.id)
            const isLast = i === hospitals.length - 1

            return (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() =>
                  mode === 'single' ? onSelect?.(h.id) : onToggle?.(h.id)
                }
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all',
                  !isLast && 'border-b border-border',
                  isSelected ? 'bg-premier-muted' : 'hover:bg-surface-2'
                )}
              >
                {/* Checkbox / radio */}
                <div
                  className={cn(
                    'shrink-0 flex items-center justify-center border-2 transition-all',
                    mode === 'single'
                      ? 'w-4 h-4 rounded-full'
                      : 'w-4 h-4 rounded',
                    isSelected
                      ? 'bg-premier border-premier'
                      : 'border-slate-600 bg-transparent'
                  )}
                >
                  {isSelected && (
                    mode === 'single'
                      ? <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      : <Check size={9} strokeWidth={3} className="text-white" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'text-sm font-medium truncate transition-colors',
                    isSelected ? 'text-white' : 'text-slate-300'
                  )}>
                    {h.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {h.city}, {h.state} · {HOSPITAL_TYPE_LABELS[h.type]} · {h.beds} beds
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="shrink-0 text-[10px] font-semibold text-premier">
                    Selected
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

