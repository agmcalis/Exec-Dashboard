import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopBar from './components/layout/TopBar'
import EmptyState from './pages/EmptyState'
import Step1Level from './pages/wizard/Step1Level'
import Step2Metrics from './pages/wizard/Step2Metrics'
import Step3Benchmarks from './pages/wizard/Step3Benchmarks'
import DashboardView from './pages/DashboardView'
import type { WizardState } from './types/wizard'
import { INITIAL_WIZARD_STATE } from './types/wizard'

type Phase = 'empty' | 'wizard' | 'dashboard'

export default function App() {
  const [phase, setPhase] = useState<Phase>('empty')
  const [wizard, setWizard] = useState<WizardState>(INITIAL_WIZARD_STATE)

  function updateWizard(updates: Partial<WizardState>) {
    setWizard(prev => ({ ...prev, ...updates }))
  }

  function startWizard() {
    setWizard(INITIAL_WIZARD_STATE)
    setPhase('wizard')
  }

  function handleNext() {
    if (wizard.step === 1) {
      updateWizard({ step: 2 })
    } else if (wizard.step === 2) {
      updateWizard({ step: 3 })
    } else if (wizard.step === 3) {
      setPhase('dashboard')
    }
  }

  function handleBack() {
    if (wizard.step === 1) {
      setPhase('empty')
    } else if (wizard.step === 2) {
      updateWizard({ step: 1 })
    } else if (wizard.step === 3) {
      updateWizard({ step: 2 })
    }
  }

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
              <EmptyState onStart={startWizard} />
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

          {phase === 'dashboard' && (
            <motion.div
              key="dashboard"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <DashboardView wizard={wizard} onNewView={startWizard} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
