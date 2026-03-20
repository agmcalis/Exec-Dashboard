import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { HEALTH_SYSTEM } from '../data/facilities'
import type { HospitalGroup } from '../types/groups'

type HospitalTypeFilter = 'all' | 'academic' | 'community' | 'critical_access'

const TYPE_FILTERS: { value: HospitalTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'community', label: 'Community' },
  { value: 'critical_access', label: 'Critical Access' },
]

interface HospitalGroupModalProps {
  group: HospitalGroup | null  // null = create mode, non-null = edit mode
  onSave: (group: HospitalGroup) => void
  onDelete?: (id: string) => void  // only in edit mode
  onClose: () => void
}

function hospitalTypeBadgeClass(type: string): string {
  switch (type) {
    case 'academic':
      return 'bg-premier-muted text-premier border border-premier/20'
    case 'critical_access':
      return 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
    default:
      return 'bg-surface-3 text-slate-400 border border-border'
  }
}

function hospitalTypeLabel(type: string): string {
  switch (type) {
    case 'academic':
      return 'Academic'
    case 'critical_access':
      return 'Critical Access'
    default:
      return 'Community'
  }
}

export default function HospitalGroupModal({ group, onSave, onDelete, onClose }: HospitalGroupModalProps) {
  const isEditMode = group !== null
  const [name, setName] = useState(group?.name ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>(group?.hospitalIds ?? [])

  const hospitals = HEALTH_SYSTEM.hospitals
  const [typeFilter, setTypeFilter] = useState<HospitalTypeFilter>('all')

  const filteredHospitals = typeFilter === 'all'
    ? hospitals
    : hospitals.filter(h => h.type === typeFilter)

  function toggleHospital(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    )
  }

  function handleSave() {
    if (!name.trim() || selectedIds.length < 2) return
    onSave({
      id: group?.id ?? crypto.randomUUID(),
      name: name.trim(),
      hospitalIds: selectedIds,
      createdAt: group?.createdAt ?? Date.now(),
    })
  }

  const canSave = name.trim().length > 0 && selectedIds.length >= 2

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-white">
            {isEditMode ? 'Edit Hospital Group' : 'Create Hospital Group'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 hover:bg-surface-2 transition-all"
            aria-label="Close"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-5 overflow-y-auto">
          {/* Group name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              placeholder="e.g. Metro Hospitals, High-Volume Sites…"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-premier transition-colors"
            />
          </div>

          {/* Hospital selection */}
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Hospitals
              </span>
              <span className="text-xs text-slate-500">(select at least 2)</span>
            </div>

            {/* Type filter pills */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150',
                    typeFilter === f.value
                      ? 'bg-premier text-white'
                      : 'bg-surface-2 text-slate-400 hover:text-slate-200 border border-border'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              {filteredHospitals.map(h => {
                const isChecked = selectedIds.includes(h.id)
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHospital(h.id)}
                    className={cn(
                      'flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer hover:bg-surface-2 transition-colors',
                      isChecked && 'bg-premier-muted border border-premier/20'
                    )}
                  >
                    {/* Custom checkbox */}
                    <div
                      className={cn(
                        'w-4 h-4 rounded border border-border bg-surface-2 flex-shrink-0 flex items-center justify-center transition-all',
                        isChecked && 'bg-premier border-premier'
                      )}
                    >
                      {isChecked && <Check size={10} strokeWidth={3} className="text-white" />}
                    </div>

                    {/* Hospital name */}
                    <span className="flex-1 text-sm text-white font-medium truncate">
                      {h.name}
                    </span>

                    {/* Bed count badge */}
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {h.beds} Beds
                    </span>

                    {/* Hospital type badge */}
                    <span className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0',
                      hospitalTypeBadgeClass(h.type)
                    )}>
                      {hospitalTypeLabel(h.type)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {/* Delete button — only in edit mode */}
          {isEditMode && onDelete ? (
            <button
              onClick={() => onDelete(group.id)}
              className="flex items-center gap-1.5 text-sm text-worse hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} strokeWidth={2} />
              Delete group
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
                canSave
                  ? 'bg-premier text-white hover:bg-premier-hover'
                  : 'bg-surface-2 text-slate-600 cursor-not-allowed'
              )}
            >
              {isEditMode ? 'Save changes' : 'Create group'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
