import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Check, X, Users } from 'lucide-react'
import TopBar from './components/layout/TopBar'
import SideNav from './components/layout/SideNav'
import EmptyState from './pages/EmptyState'
import DashboardView from './pages/DashboardView'
import HospitalGroupModal from './components/HospitalGroupModal'
import SharedWithMePanel from './components/sharing/SharedWithMePanel'
import TasksView from './pages/tasks/TasksView'
import CreateTaskModal from './pages/tasks/CreateTaskModal'
import { useAppStore, getSharedWithMe, isViewAlreadyAdded } from './store/appStore'
import type { ViewConfig } from './store/appStore'
import { useTasksStore } from './store/tasksStore'
import { MOCK_USERS } from './data/mockUsers'
import { KPI_CATEGORIES, KPI_DEFS } from './data/kpis'
import type { KpiCategory } from './data/kpis'
import { BENCHMARK_DEFS } from './data/benchmarks'
import { cn } from './lib/utils'
import type { ViewContext } from './types/wizard'
import { DEFAULT_CONTEXT } from './types/wizard'
import type { HospitalGroup } from './types/groups'
import { GROUPS_STORAGE_KEY } from './types/groups'

// ─── Add View Modal (wizard + shared-with-me) ────────────────────────────────

type WizardStep = 'name' | 'kpis' | 'benchmarks'
type ModalTab = 'build' | 'shared'

interface AddViewModalState {
  viewName: string
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  step: WizardStep
  activeTab: ModalTab
  activeKpiCategory: KpiCategory
}

const INIT_MODAL: AddViewModalState = {
  viewName: '',
  selectedKpiIds: [],
  selectedBenchmarkIds: [],
  step: 'name',
  activeTab: 'build',
  activeKpiCategory: 'mortality',
}

interface AddViewModalProps {
  onClose: () => void
  onAdd: (view: ViewConfig) => void
  onAddShared: (sharedViewId: string) => void
  sharedViewCount: number
  sharedViews: ReturnType<typeof getSharedWithMe>
  alreadyAddedIds: Set<string>
}

function AddViewModal({ onClose, onAdd, onAddShared, sharedViewCount, sharedViews, alreadyAddedIds }: AddViewModalProps) {
  const [state, setState] = useState<AddViewModalState>(INIT_MODAL)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.step === 'name' && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [state.step])

  function update(updates: Partial<AddViewModalState>) {
    setState(prev => ({ ...prev, ...updates }))
  }

  function toggleKpi(id: string) {
    const next = state.selectedKpiIds.includes(id)
      ? state.selectedKpiIds.filter(k => k !== id)
      : [...state.selectedKpiIds, id]
    update({ selectedKpiIds: next })
  }

  function toggleBenchmark(id: string) {
    const next = state.selectedBenchmarkIds.includes(id)
      ? state.selectedBenchmarkIds.filter(b => b !== id)
      : [...state.selectedBenchmarkIds, id]
    update({ selectedBenchmarkIds: next })
  }

  function handleNext() {
    if (state.step === 'name') {
      update({ step: 'kpis' })
    } else if (state.step === 'kpis') {
      update({ step: 'benchmarks' })
    } else {
      // finish
      const newView: ViewConfig = {
        id: crypto.randomUUID(),
        name: state.viewName.trim() || 'My View',
        selectedKpiIds: state.selectedKpiIds,
        selectedBenchmarkIds: state.selectedBenchmarkIds,
      }
      onAdd(newView)
    }
  }

  function handleBack() {
    if (state.step === 'kpis') update({ step: 'name' })
    else if (state.step === 'benchmarks') update({ step: 'kpis' })
    else onClose()
  }

  const canNext =
    state.step === 'name'
      ? state.viewName.trim().length > 0
      : state.step === 'kpis'
        ? state.selectedKpiIds.length > 0
        : state.selectedBenchmarkIds.length > 0 || true // benchmarks optional

  const visibleKpis = KPI_DEFS.filter(k => k.category === state.activeKpiCategory)

  function selectedCountForCategory(cat: KpiCategory) {
    return KPI_DEFS.filter(k => k.category === cat && state.selectedKpiIds.includes(k.id)).length
  }

  const STEPS: WizardStep[] = ['name', 'kpis', 'benchmarks']
  const stepIndex = STEPS.indexOf(state.step)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="bg-surface border border-border-hi rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-white">Add View</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-2"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-6 pt-3 pb-0 shrink-0">
          <button
            onClick={() => update({ activeTab: 'build' })}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              state.activeTab === 'build'
                ? 'text-white border-premier'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Build New
          </button>
          <button
            onClick={() => update({ activeTab: 'shared' })}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 ${
              state.activeTab === 'shared'
                ? 'text-white border-premier'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Users size={13} strokeWidth={2} />
            Shared with Me
            {sharedViewCount > 0 && (
              <span className="text-[10px] font-bold bg-premier text-white px-1.5 py-0.5 rounded-full leading-none">
                {sharedViewCount}
              </span>
            )}
          </button>
        </div>

        {/* Divider below tabs */}
        <div className="border-b border-border shrink-0" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {state.activeTab === 'shared' ? (
            <div className="p-6">
              <SharedWithMePanel
                sharedViews={sharedViews}
                addedViewIds={alreadyAddedIds}
                onAdd={id => { onAddShared(id); onClose() }}
                kpiDefs={KPI_DEFS}
                benchmarkDefs={BENCHMARK_DEFS}
              />
            </div>
          ) : (
            <div className="p-6">
              {/* Step indicator dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === stepIndex
                        ? 'w-6 bg-premier'
                        : i < stepIndex
                          ? 'w-1.5 bg-premier/50'
                          : 'w-1.5 bg-surface-3'
                    }`}
                  />
                ))}
              </div>

              {/* Step: name */}
              {state.step === 'name' && (
                <motion.div
                  key="step-name"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white text-center mb-2">Name your view</h3>
                  <p className="text-slate-400 text-sm text-center mb-6">
                    Give this view a descriptive name — you can change it later.
                  </p>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={state.viewName}
                    onChange={e => update({ viewName: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter' && canNext) handleNext() }}
                    placeholder="e.g. Safety & Readmissions"
                    className="w-full bg-surface-2 border border-border text-white text-base placeholder-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-premier transition-colors"
                  />
                </motion.div>
              )}

              {/* Step: kpis */}
              {state.step === 'kpis' && (
                <motion.div
                  key="step-kpis"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white text-center mb-2">Select KPIs</h3>
                  <p className="text-slate-400 text-sm text-center mb-5">
                    Choose the metrics you want to track in this view.
                  </p>

                  {/* Category tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {KPI_CATEGORIES.map(cat => {
                      const count = selectedCountForCategory(cat.id)
                      const isActive = state.activeKpiCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => update({ activeKpiCategory: cat.id })}
                          className={cn(
                            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer',
                            isActive
                              ? 'bg-premier text-white'
                              : 'bg-surface-2 text-slate-400 hover:text-slate-200'
                          )}
                        >
                          {cat.shortLabel}
                          {count > 0 && (
                            <span className={cn(
                              'text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none',
                              isActive ? 'bg-white/20 text-white' : 'bg-premier text-white'
                            )}>
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {visibleKpis.map(kpi => {
                      const isSelected = state.selectedKpiIds.includes(kpi.id)
                      return (
                        <button
                          key={kpi.id}
                          onClick={() => toggleKpi(kpi.id)}
                          className={cn(
                            'relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                            isSelected
                              ? 'border-premier bg-premier-muted'
                              : 'border-border bg-surface-2 hover:border-border-hi'
                          )}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-premier flex items-center justify-center">
                              <Check size={11} strokeWidth={3} className="text-white" />
                            </span>
                          )}
                          <span className="text-sm font-semibold text-white leading-snug">
                            {kpi.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1">
                            {kpi.unit === '%' ? 'Percentage (%)' : kpi.unit}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step: benchmarks */}
              {state.step === 'benchmarks' && (
                <motion.div
                  key="step-benchmarks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white text-center mb-2">Select benchmarks</h3>
                  <p className="text-slate-400 text-sm text-center mb-6">
                    Choose benchmarks to compare against. You can skip this step.
                  </p>
                  <div className="flex flex-col gap-3">
                    {BENCHMARK_DEFS.map(b => {
                      const isSelected = state.selectedBenchmarkIds.includes(b.id)
                      return (
                        <button
                          key={b.id}
                          onClick={() => toggleBenchmark(b.id)}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer',
                            isSelected
                              ? 'border-premier bg-premier-muted'
                              : 'border-border bg-surface-2 hover:border-border-hi'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{b.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{b.description}</p>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                              isSelected ? 'bg-premier border-premier' : 'border-border'
                            )}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only for build tab */}
        {state.activeTab === 'build' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} strokeWidth={2} />
              {state.step === 'name' ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              disabled={!canNext && state.step === 'kpis'}
              className={cn(
                'flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all',
                canNext || state.step === 'benchmarks'
                  ? 'bg-premier hover:bg-premier-hover text-white cursor-pointer'
                  : 'bg-surface-2 text-slate-600 cursor-not-allowed'
              )}
            >
              {state.step === 'benchmarks' ? (
                <>Add View <ArrowRight size={14} strokeWidth={2.5} /></>
              ) : (
                <>Next <ArrowRight size={14} strokeWidth={2.5} /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const store = useAppStore()
  const { viewsByUser, currentUserId, addView, removeView, renameView, updateViewKpis, shareView, addSharedViewAsTab, removeSharedTab, setCurrentUser } = store
  const { tasks, addTask } = useTasksStore()

  const currentUser = MOCK_USERS.find(u => u.id === currentUserId) ?? MOCK_USERS[0]
  const views = viewsByUser[currentUserId] ?? []

  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [mainView, setMainView] = useState<'dashboard' | 'tasks'>('dashboard')
  const [createTaskKpiId, setCreateTaskKpiId] = useState<string | null | undefined>(undefined)

  // Keep activeViewId in sync when views or currentUser change
  useEffect(() => {
    if (views.length === 0) {
      setActiveViewId(null)
    } else if (!views.find(v => v.id === activeViewId)) {
      setActiveViewId(views[0].id)
    }
  }, [views, activeViewId])

  const [showAddViewModal, setShowAddViewModal] = useState(false)

  const [context, setContext] = useState<ViewContext>(DEFAULT_CONTEXT)

  const [groups, setGroups] = useState<HospitalGroup[]>(() => {
    try {
      const raw = localStorage.getItem(GROUPS_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as HospitalGroup[]) : []
    } catch { return [] }
  })

  const [groupModalState, setGroupModalState] = useState<{
    open: boolean
    editing: HospitalGroup | null
  }>({ open: false, editing: null })

  function persistGroups(next: HospitalGroup[]) {
    setGroups(next)
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next))
  }

  function handleSaveGroup(group: HospitalGroup) {
    const exists = groups.find(g => g.id === group.id)
    const next = exists
      ? groups.map(g => g.id === group.id ? group : g)
      : [...groups, group]
    persistGroups(next)
    if (context.type === 'group') {
      setContext({ type: 'group', hospitalIds: group.hospitalIds })
    }
    setGroupModalState({ open: false, editing: null })
  }

  function handleDeleteGroup(id: string) {
    const next = groups.filter(g => g.id !== id)
    persistGroups(next)
    if (context.type === 'group') setContext(DEFAULT_CONTEXT)
    setGroupModalState({ open: false, editing: null })
  }

  function handleDeleteView(viewId: string) {
    const view = views.find(v => v.id === viewId)
    if (view?.isReadOnly) {
      removeSharedTab(viewId)
    } else {
      removeView(viewId)
    }
    if (activeViewId === viewId) {
      const remaining = views.filter(v => v.id !== viewId)
      setActiveViewId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  function handleAddView(view: ViewConfig) {
    addView(view)
    setActiveViewId(view.id)
    setShowAddViewModal(false)
  }

  function handleAddSharedView(sharedViewId: string) {
    addSharedViewAsTab(sharedViewId)
    // Set active to the newly added tab
    setTimeout(() => {
      const s = useAppStore.getState()
      const updated = s.viewsByUser[s.currentUserId] ?? []
      const added = updated.find((v: ViewConfig) => v.sharedFromId === sharedViewId)
      if (added) setActiveViewId(added.id)
    }, 50)
  }

  function handleUpdateView(viewId: string, kpiIds: string[], benchmarkIds: string[]) {
    updateViewKpis(viewId, kpiIds, benchmarkIds)
  }

  function handleShareView(viewId: string, sharedWith: 'all' | string[]) {
    shareView(viewId, sharedWith)
  }

  function handleUserChange(userId: string) {
    setCurrentUser(userId)
    // Reset active view to first view for the incoming user
    const s = useAppStore.getState()
    const nextViews = s.viewsByUser[userId] ?? []
    setActiveViewId(nextViews.length > 0 ? nextViews[0].id : null)
  }

  const assignedTaskCount = tasks.filter(t => t.assignedTo.includes(currentUserId)).length

  function handleOpenCreateTask(kpiId: string | null) {
    setCreateTaskKpiId(kpiId)
  }

  function handleCreateTaskFromKpiCard(kpiId: string) {
    setCreateTaskKpiId(kpiId)
  }

  const sharedWithMe = getSharedWithMe(store)
  const alreadyAddedIds = new Set(
    views.filter(v => v.sharedFromId).map(v => v.sharedFromId as string)
  )

  const activeView = views.find(v => v.id === activeViewId)
  const phase = views.length === 0 ? 'empty' : 'dashboard'

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <TopBar currentUser={currentUser} onUserChange={handleUserChange} />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          {phase === 'empty' && (
            <motion.div
              key="empty"
              className="flex flex-col min-h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <EmptyState onStart={() => setShowAddViewModal(true)} />
            </motion.div>
          )}

          {phase === 'dashboard' && activeView && (
            <motion.div
              key="dashboard"
              className="flex flex-1 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <SideNav
                context={context}
                onChange={setContext}
                groups={groups}
                onCreateGroup={() => setGroupModalState({ open: true, editing: null })}
                onEditGroup={(g) => setGroupModalState({ open: true, editing: g })}
                mainView={mainView}
                onNavigateToTasks={() => setMainView('tasks')}
                assignedTaskCount={assignedTaskCount}
              />
              <div className="flex-1 overflow-hidden flex flex-col">
                {mainView === 'dashboard' && (
                  <DashboardView
                    view={activeView}
                    views={views}
                    context={context}
                    activeViewId={activeViewId}
                    onSelectView={setActiveViewId}
                    onNewView={() => setShowAddViewModal(true)}
                    onUpdateView={handleUpdateView}
                    onDeleteView={handleDeleteView}
                    onRenameView={renameView}
                    onShareView={handleShareView}
                    currentUser={currentUser}
                    onCreateTask={handleCreateTaskFromKpiCard}
                  />
                )}
                {mainView === 'tasks' && (
                  <TasksView
                    currentUserId={currentUserId}
                    onCreateTask={handleOpenCreateTask}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add View Modal */}
      <AnimatePresence>
        {showAddViewModal && (
          <AddViewModal
            onClose={() => setShowAddViewModal(false)}
            onAdd={handleAddView}
            onAddShared={handleAddSharedView}
            sharedViewCount={sharedWithMe.filter(sv => !isViewAlreadyAdded(store, sv.id)).length}
            sharedViews={sharedWithMe}
            alreadyAddedIds={alreadyAddedIds}
          />
        )}
      </AnimatePresence>

      {/* Hospital Group Modal */}
      <AnimatePresence>
        {groupModalState.open && (
          <HospitalGroupModal
            group={groupModalState.editing}
            onSave={handleSaveGroup}
            onDelete={handleDeleteGroup}
            onClose={() => setGroupModalState({ open: false, editing: null })}
          />
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {createTaskKpiId !== undefined && (
          <CreateTaskModal
            open={createTaskKpiId !== undefined}
            onClose={() => setCreateTaskKpiId(undefined)}
            onSave={(task) => { addTask(task); setCreateTaskKpiId(undefined) }}
            currentUserId={currentUserId}
            prefillKpiId={createTaskKpiId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
