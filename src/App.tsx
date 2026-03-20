import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopBar from './components/layout/TopBar'
import SideNav from './components/layout/SideNav'
import EmptyState from './pages/EmptyState'
import Step1Metrics from './pages/wizard/Step1Metrics'
import Step2Benchmarks from './pages/wizard/Step2Benchmarks'
import DashboardView from './pages/DashboardView'
import HospitalGroupModal from './components/HospitalGroupModal'
import type { WizardState, SavedView, ViewContext } from './types/wizard'
import { INITIAL_WIZARD_STATE, STORAGE_KEY, DEFAULT_CONTEXT, generateViewName } from './types/wizard'
import type { HospitalGroup } from './types/groups'
import { GROUPS_STORAGE_KEY } from './types/groups'

type Phase = 'empty' | 'wizard' | 'dashboard'

function loadViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedView[]) : []
  } catch {
    return []
  }
}

export default function App() {
  const [views, setViews] = useState<SavedView[]>(() => loadViews())

  const [activeViewId, setActiveViewId] = useState<string | null>(() => {
    const v = loadViews()
    return v.length > 0 ? v[0].id : null
  })

  const [phase, setPhase] = useState<Phase>(() => {
    const v = loadViews()
    return v.length > 0 ? 'dashboard' : 'empty'
  })

  const [wizard, setWizard] = useState<WizardState>(INITIAL_WIZARD_STATE)
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

  function persistViews(next: SavedView[]) {
    setViews(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function persistGroups(next: HospitalGroup[]) {
    setGroups(next)
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next))
  }

  function updateWizard(updates: Partial<WizardState>) {
    setWizard(prev => ({ ...prev, ...updates }))
  }

  function startNewView() {
    setWizard(INITIAL_WIZARD_STATE)
    setPhase('wizard')
  }

  function handleFinish() {
    const newView: SavedView = {
      id: crypto.randomUUID(),
      name: wizard.viewName.trim() || generateViewName(views.length),
      selectedKpiIds: wizard.selectedKpiIds,
      selectedBenchmarkIds: wizard.selectedBenchmarkIds,
      createdAt: Date.now(),
    }
    const next = [...views, newView]
    persistViews(next)
    setActiveViewId(newView.id)
    setPhase('dashboard')
  }

  function handleNext() {
    if (wizard.step === 1) updateWizard({ step: 2 })
    else if (wizard.step === 2) handleFinish()
  }

  function handleBack() {
    if (wizard.step === 1) setPhase(views.length > 0 ? 'dashboard' : 'empty')
    else if (wizard.step === 2) updateWizard({ step: 1 })
  }

  function handleRenameView(viewId: string, name: string) {
    const next = views.map(v => v.id === viewId ? { ...v, name: name.trim() || v.name } : v)
    persistViews(next)
  }

  function handleUpdateView(viewId: string, updates: Partial<SavedView>) {
    const next = views.map(v => v.id === viewId ? { ...v, ...updates } : v)
    persistViews(next)
  }

  function handleDeleteView(viewId: string) {
    const next = views.filter(v => v.id !== viewId)
    persistViews(next)
    if (next.length === 0) {
      setPhase('empty')
      setActiveViewId(null)
    } else {
      const deletedIndex = views.findIndex(v => v.id === viewId)
      const newActive = next[Math.max(0, deletedIndex - 1)]
      setActiveViewId(newActive.id)
    }
  }

  function handleSaveGroup(group: HospitalGroup) {
    const exists = groups.find(g => g.id === group.id)
    const next = exists
      ? groups.map(g => g.id === group.id ? group : g)
      : [...groups, group]
    persistGroups(next)
    // If the currently active context was this group, update hospitalIds
    if (context.type === 'group') {
      setContext({ type: 'group', hospitalIds: group.hospitalIds })
    }
    setGroupModalState({ open: false, editing: null })
  }

  function handleDeleteGroup(id: string) {
    const next = groups.filter(g => g.id !== id)
    persistGroups(next)
    // If context was this group, revert to system
    if (context.type === 'group') setContext(DEFAULT_CONTEXT)
    setGroupModalState({ open: false, editing: null })
  }

  const activeView = views.find(v => v.id === activeViewId)

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <TopBar />

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
              <EmptyState onStart={startNewView} />
            </motion.div>
          )}

          {phase === 'wizard' && (
            <motion.div
              key="wizard"
              className="flex flex-col min-h-full overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {wizard.step === 1 && (
                <Step1Metrics
                  state={wizard}
                  onChange={updateWizard}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {wizard.step === 2 && (
                <Step2Benchmarks
                  state={wizard}
                  onChange={updateWizard}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
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
              />
              <div className="flex-1 overflow-hidden flex flex-col">
                <DashboardView
                  view={activeView}
                  views={views}
                  context={context}
                  activeViewId={activeViewId}
                  onSelectView={setActiveViewId}
                  onNewView={startNewView}
                  onUpdateView={handleUpdateView}
                  onDeleteView={handleDeleteView}
                  onRenameView={handleRenameView}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </div>
  )
}
