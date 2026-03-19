import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  current: number
  total: number
}

const LABELS = ['Metrics', 'Benchmarks']

export default function StepIndicator({ current, total }: Props) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done   ? 'bg-premier text-white' :
                  active ? 'bg-premier text-white ring-4 ring-premier/20' :
                           'bg-surface-2 text-slate-600'
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap',
                active ? 'text-premier' : done ? 'text-slate-400' : 'text-slate-700'
              )}>
                {LABELS[i]}
              </span>
            </div>
            {n < total && (
              <div
                className={cn(
                  'h-px w-16 mx-2 mb-5 transition-colors',
                  done ? 'bg-premier' : 'bg-surface-3'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
