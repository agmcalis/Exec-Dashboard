import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Stethoscope, Layers, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { HEALTH_SYSTEM } from '../../data/facilities'
import type { ViewContext } from '../../types/wizard'

interface SideNavProps {
  context: ViewContext
  onChange: (ctx: ViewContext) => void
}

export default function SideNav({ context, onChange }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [groupSelectMode, setGroupSelectMode] = useState(false)
  const [pendingGroupIds, setPendingGroupIds] = useState<string[]>([])

  const hospitals = HEALTH_SYSTEM.hospitals

  function handleSystemClick() {
    onChange({ type: 'system', hospitalIds: [] })
    setGroupSelectMode(false)
    setPendingGroupIds([])
  }

  function handleHospitalClick(id: string) {
    if (groupSelectMode) {
      setPendingGroupIds(prev =>
        prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
      )
    } else {
      onChange({ type: 'hospital', hospitalIds: [id] })
    }
  }

  function handleGroupModeToggle() {
    if (groupSelectMode) {
      // cancel group mode
      setGroupSelectMode(false)
      setPendingGroupIds([])
    } else {
      setGroupSelectMode(true)
      // Pre-populate with current group ids if already in group context
      setPendingGroupIds(context.type === 'group' ? context.hospitalIds : [])
    }
  }

  function handleApplyGroup() {
    if (pendingGroupIds.length >= 2) {
      onChange({ type: 'group', hospitalIds: pendingGroupIds })
      setGroupSelectMode(false)
      setPendingGroupIds([])
    }
  }

  const isSystemActive = context.type === 'system'
  const isGroupActive = context.type === 'group'

  function getShortName(name: string): string {
    return name.split(' ')[0]
  }

  return (
    <motion.aside
      animate={{ width: isOpen ? 232 : 56 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="bg-surface border-r border-border h-full flex flex-col overflow-hidden shrink-0"
    >
      {/* Toggle button row */}
      <div className={cn(
        'flex items-center h-11 shrink-0 border-b border-border px-3',
        isOpen ? 'justify-between' : 'justify-center'
      )}>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
          >
            Context
          </motion.span>
        )}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 hover:bg-surface-2 transition-all"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Health System row */}
        <div className={cn('px-2 pt-2', !isOpen && 'flex flex-col items-center')}>
          <button
            onClick={handleSystemClick}
            title={isOpen ? undefined : HEALTH_SYSTEM.name}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 text-left',
              isSystemActive
                ? 'bg-premier-muted border-l-2 border-premier text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2',
              !isOpen && 'justify-center w-9 h-9 px-0 py-0 border-l-0'
            )}
          >
            <Building2
              size={16}
              strokeWidth={2}
              className={cn(
                'shrink-0 transition-colors',
                isSystemActive ? 'text-premier' : 'text-slate-500'
              )}
            />
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 overflow-hidden min-w-0"
                >
                  <span className="text-[13px] font-medium truncate whitespace-nowrap">
                    {HEALTH_SYSTEM.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-premier/70 shrink-0">
                    SYSTEM
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Hospitals section */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mt-4 mb-1">
                Hospitals
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <div className="mt-2 flex flex-col items-center gap-1 px-2">
            {hospitals.map(h => {
              const isActive = context.type === 'hospital' && context.hospitalIds[0] === h.id
              const isInGroup = context.type === 'group' && context.hospitalIds.includes(h.id)
              const initials = h.name.split(' ').slice(0, 2).map(w => w[0]).join('')
              return (
                <button
                  key={h.id}
                  onClick={() => handleHospitalClick(h.id)}
                  title={h.name}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-150',
                    isActive || isInGroup
                      ? 'bg-premier-muted border-l-2 border-premier text-white'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-surface-2'
                  )}
                >
                  {initials}
                </button>
              )
            })}
          </div>
        )}

        {isOpen && (
          <div className="px-2">
            {hospitals.map(h => {
              const isActive = !groupSelectMode && context.type === 'hospital' && context.hospitalIds[0] === h.id
              const isInCurrentGroup = !groupSelectMode && context.type === 'group' && context.hospitalIds.includes(h.id)
              const isPending = groupSelectMode && pendingGroupIds.includes(h.id)
              const highlighted = isActive || isInCurrentGroup || isPending

              return (
                <button
                  key={h.id}
                  onClick={() => handleHospitalClick(h.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 text-left',
                    highlighted
                      ? 'bg-premier-muted border-l-2 border-premier text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                  )}
                >
                  {groupSelectMode ? (
                    <div className={cn(
                      'w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      isPending ? 'bg-premier border-premier' : 'border-slate-600 bg-transparent'
                    )}>
                      {isPending && <Check size={8} strokeWidth={3} className="text-white" />}
                    </div>
                  ) : (
                    <Stethoscope
                      size={13}
                      strokeWidth={2}
                      className={cn(
                        'shrink-0 transition-colors',
                        highlighted ? 'text-premier' : 'text-slate-600'
                      )}
                    />
                  )}
                  <span className="text-[13px] font-medium truncate flex-1 whitespace-nowrap">
                    {getShortName(h.name)}
                  </span>
                  <span className="text-[10px] text-slate-600 shrink-0">{h.beds}b</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Groups section */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-2"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2.5 mt-4 mb-1">
                Groups
              </p>

              <button
                onClick={handleGroupModeToggle}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 text-left',
                  isGroupActive || groupSelectMode
                    ? 'bg-premier-muted border-l-2 border-premier text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                )}
              >
                <Layers
                  size={14}
                  strokeWidth={2}
                  className={cn(
                    'shrink-0 transition-colors',
                    isGroupActive || groupSelectMode ? 'text-premier' : 'text-slate-600'
                  )}
                />
                <span className="text-[13px] font-medium truncate flex-1 whitespace-nowrap">
                  {isGroupActive && !groupSelectMode
                    ? `Custom Group · ${context.hospitalIds.length}`
                    : 'Custom Group'}
                </span>
                {groupSelectMode && (
                  <span className="text-[10px] text-slate-500 shrink-0">cancel</span>
                )}
              </button>

              {/* Active group hospital list */}
              {isGroupActive && !groupSelectMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden ml-6 mb-1"
                >
                  {context.hospitalIds.map(id => {
                    const h = hospitals.find(h => h.id === id)
                    return h ? (
                      <p key={id} className="text-[11px] text-slate-500 py-0.5 truncate">
                        {getShortName(h.name)}
                      </p>
                    ) : null
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed groups icon */}
        {!isOpen && (
          <div className="flex flex-col items-center gap-1 px-2 mt-1">
            <button
              onClick={handleGroupModeToggle}
              title="Custom Group"
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
                isGroupActive
                  ? 'bg-premier-muted border-l-2 border-premier text-premier'
                  : 'text-slate-600 hover:text-slate-200 hover:bg-surface-2'
              )}
            >
              <Layers size={14} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {/* Apply Group footer — only visible when in group select mode and sidebar is open */}
      <AnimatePresence>
        {isOpen && groupSelectMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 p-3 border-t border-border"
          >
            <button
              onClick={handleApplyGroup}
              disabled={pendingGroupIds.length < 2}
              className={cn(
                'w-full py-2 rounded-lg text-[13px] font-semibold transition-all duration-150',
                pendingGroupIds.length >= 2
                  ? 'bg-premier text-white hover:bg-premier-hover'
                  : 'bg-surface-2 text-slate-600 cursor-not-allowed'
              )}
            >
              {pendingGroupIds.length < 2
                ? `Select ${2 - pendingGroupIds.length} more`
                : `Apply Group (${pendingGroupIds.length})`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
