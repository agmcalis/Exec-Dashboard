import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Building2, Layers, ChevronLeft, ChevronRight, Plus, Pencil, CheckSquare, LayoutDashboard } from 'lucide-react'
import { cn } from '../../lib/utils'
import { HEALTH_SYSTEM } from '../../data/facilities'
import type { ViewContext } from '../../types/wizard'
import type { HospitalGroup } from '../../types/groups'

interface SideNavProps {
  context: ViewContext
  onChange: (ctx: ViewContext) => void
  groups: HospitalGroup[]
  onCreateGroup: () => void
  onEditGroup: (group: HospitalGroup) => void
  mainView?: 'dashboard' | 'tasks'
  onNavigateToDashboard?: () => void
  onNavigateToTasks?: () => void
  assignedTaskCount?: number
}

export default function SideNav({ context, onChange, groups, onCreateGroup, onEditGroup, mainView, onNavigateToDashboard, onNavigateToTasks, assignedTaskCount }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null)

  const hospitals = HEALTH_SYSTEM.hospitals

  function handleSystemClick() {
    onChange({ type: 'system', hospitalIds: [] })
  }

  function handleHospitalClick(id: string) {
    onChange({ type: 'hospital', hospitalIds: [id] })
  }

  function handleGroupClick(group: HospitalGroup) {
    onChange({ type: 'group', hospitalIds: group.hospitalIds })
  }

  const isSystemActive = context.type === 'system'

  function getShortName(name: string): string {
    return name.split(' ')[0]
  }

  function isGroupActive(group: HospitalGroup): boolean {
    if (context.type !== 'group') return false
    if (context.hospitalIds.length !== group.hospitalIds.length) return false
    return group.hospitalIds.every(id => context.hospitalIds.includes(id))
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
            <Network
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
              const isActive = context.type === 'hospital' && context.hospitalIds[0] === h.id
              const isInCurrentGroup = context.type === 'group' && context.hospitalIds.includes(h.id)
              const highlighted = isActive || isInCurrentGroup

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
                  <Building2
                    size={13}
                    strokeWidth={2}
                    className={cn(
                      'shrink-0 transition-colors',
                      highlighted ? 'text-premier' : 'text-slate-600'
                    )}
                  />
                  <span className="text-[13px] font-medium truncate flex-1 whitespace-nowrap">
                    {getShortName(h.name)}
                  </span>
                  <span className="text-[10px] text-slate-600 shrink-0">{h.beds} Beds</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Hospital Groups section */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-3 mt-4 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Hospital Groups
                </p>
                <button
                  onClick={onCreateGroup}
                  className="text-slate-500 hover:text-premier transition-colors"
                  aria-label="Create hospital group"
                >
                  <Plus size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Saved groups list */}
              <div className="px-2">
                <AnimatePresence initial={false}>
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-600 px-3 py-1 italic">
                      No groups yet — click + to create one
                    </p>
                  ) : (
                    groups.map(group => {
                      const active = isGroupActive(group)
                      return (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="relative group"
                          onMouseEnter={() => setHoveredGroupId(group.id)}
                          onMouseLeave={() => setHoveredGroupId(null)}
                        >
                          <button
                            onClick={() => handleGroupClick(group)}
                            className={cn(
                              'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 text-left',
                              active
                                ? 'bg-premier-muted border-l-2 border-premier text-white'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                            )}
                          >
                            <Layers
                              size={13}
                              strokeWidth={2}
                              className={cn(
                                'shrink-0 transition-colors',
                                active ? 'text-premier' : 'text-slate-600'
                              )}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[13px] font-medium truncate whitespace-nowrap">
                                {group.name}
                              </span>
                              <span className="text-[10px] text-slate-600">
                                {group.hospitalIds.length} hospitals
                              </span>
                            </div>
                            {/* Pencil edit button on hover */}
                            {hoveredGroupId === group.id && (
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  onEditGroup(group)
                                }}
                                className="shrink-0 text-slate-500 hover:text-premier transition-colors"
                                aria-label={`Edit group "${group.name}"`}
                              >
                                <Pencil size={11} strokeWidth={2} />
                              </button>
                            )}
                          </button>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed groups icon */}
        {!isOpen && (
          <div className="flex flex-col items-center gap-1 px-2 mt-1">
            <button
              onClick={onCreateGroup}
              title="Hospital Groups"
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
                context.type === 'group'
                  ? 'bg-premier-muted border-l-2 border-premier text-premier'
                  : 'text-slate-600 hover:text-slate-200 hover:bg-surface-2'
              )}
            >
              <Layers size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Views + Tasks nav */}
        {(onNavigateToDashboard || onNavigateToTasks) && (
          <>
            <div className="h-px bg-border mx-3 my-2" />
            {isOpen ? (
              <div className="px-2 pb-2 flex flex-col gap-0.5">
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      mainView === 'dashboard'
                        ? 'bg-premier-muted text-premier'
                        : 'text-slate-400 hover:text-white hover:bg-surface-2'
                    )}
                  >
                    <LayoutDashboard size={15} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">KPI Views</span>
                  </button>
                )}
                {onNavigateToTasks && (
                  <button
                    onClick={onNavigateToTasks}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      mainView === 'tasks'
                        ? 'bg-premier-muted text-premier'
                        : 'text-slate-400 hover:text-white hover:bg-surface-2'
                    )}
                  >
                    <CheckSquare size={15} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">Tasks</span>
                    {(assignedTaskCount ?? 0) > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-premier text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {assignedTaskCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 px-2 pb-2">
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    title="KPI Views"
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
                      mainView === 'dashboard'
                        ? 'bg-premier-muted text-premier'
                        : 'text-slate-600 hover:text-slate-200 hover:bg-surface-2'
                    )}
                  >
                    <LayoutDashboard size={14} strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={onNavigateToTasks}
                  title="Tasks"
                  className={cn(
                    'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
                    mainView === 'tasks'
                      ? 'bg-premier-muted text-premier'
                      : 'text-slate-600 hover:text-slate-200 hover:bg-surface-2'
                  )}
                >
                  <CheckSquare size={14} strokeWidth={2} />
                  {(assignedTaskCount ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-premier text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {assignedTaskCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.aside>
  )
}
