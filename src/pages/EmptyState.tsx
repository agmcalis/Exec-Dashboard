import { motion } from 'framer-motion'
import { ArrowRight, BarChart2, ShieldCheck, Star, TrendingUp } from 'lucide-react'
import premierLogo from '../assets/premier-logo.svg'

const FEATURES = [
  { icon: TrendingUp,  label: 'Trend over time'      },
  { icon: BarChart2,   label: 'Benchmark comparisons' },
  { icon: ShieldCheck, label: 'Safety indicators'     },
  { icon: Star,        label: 'Program ratings'       },
]

export default function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Subtle radial glow — Premier blue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 38%, rgba(36,163,227,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[480px]">

        {/* Premier animated logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <img src={premierLogo} alt="Premier" className="w-20 h-20" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="text-[2rem] font-extrabold text-white leading-tight mb-3"
        >
          Track the quality metrics
          <br />
          <span style={{ color: '#24a3e3' }}>that matter to you</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="text-slate-400 text-[15px] leading-relaxed mb-8"
        >
          Build a personalized view of your organization's quality performance —
          outcomes, safety, patient experience, and program ratings — all in one place.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-slate-400 bg-surface-2 border border-border rounded-full px-3 py-1.5"
            >
              <Icon size={11} className="text-premier" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          onClick={onStart}
          className="group flex items-center gap-2.5 bg-premier hover:bg-premier-hover text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ boxShadow: '0 8px 30px rgba(36,163,227,0.30)' }}
        >
          Build your first view
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44 }}
          className="text-xs text-slate-600 mt-4"
        >
          Takes about 2 minutes · everything can be changed later
        </motion.p>
      </div>
    </div>
  )
}
