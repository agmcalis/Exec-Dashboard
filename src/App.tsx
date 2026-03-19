import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopBar from './components/layout/TopBar'
import EmptyState from './pages/EmptyState'
import Step1Level from './pages/wizard/Step1Level'
import Step2Metrics from './pages/wizard/Step2Metrics'
import Step3Benchmarks from './pages/wizard/Step3Benchmarks'
import DashboardView from './pages/DashboardView'
import type { WizardState, SavedView } from './types/wizard'
import { INITIAL_WIZARD_STATE, STORAGE_KEY, generateViewName } from './types/wizard'
import { HEALTH_SYSTEM } from './data/facilities'

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

  function persistViews(next: SavedView[]) {
    setViews(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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
      name: generateViewName(wizard, HEALTH_SYSTEM.hospitals),
      level: wizard.level!,
      selectedHospitalIds: wizard.selectedHospitalIds,
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
    if (wizard.step === 1) {
      updateWizard({ step: 2 })
    } else if (wizard.step === 2) {
      updateWizard({ step: 3 })
    } else if (wizard.step === 3) {
      handleFinish()
    }
  }

  function handleBack() {
    if (wizard.step === 1) {
      if (views.length > 0) {
        setPhase('dashboard')
      } else {
        setPhase('empty')
      }
    } else if (wizard.step === 2) {
      updateWizard({ step: 1 })
    } else if (wizard.step === 3) {
      updateWizard({ step: 2 })
    }
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

  const activeView = views.find(v => v.id === activeViewId)

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <TopBar />

      <div className="flex-1 overflow-y-auto relative">
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
              className="flex flex-col min-h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {wizard.step === 1 && (
                <Step1Level
                  state={wizard}
                  onChange={updateWizard}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {wizard.step === 2 && (
                <Step2Metrics
                  state={wizard}
                  onChange={updateWizard}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {wizard.step === 3 && (
                <Step3Benchmarks
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
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardView
                view={activeView}
                views={views}
                activeViewId={activeViewId}
                onSelectView={setActiveViewId}
                onNewView={startNewView}
                onUpdateView={handleUpdateView}
                onDeleteView={handleDeleteView}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
