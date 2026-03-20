import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { MOCK_USERS } from '../../data/mockUsers'
import type { MockUser } from '../../data/mockUsers'

interface UserSwitcherProps {
  currentUser: MockUser
  onUserChange: (userId: string) => void
}

export default function UserSwitcher({ currentUser, onUserChange }: UserSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-premier text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {currentUser.initials}
        </div>
        <span className="text-sm font-medium text-white hidden sm:inline">
          {currentUser.firstName}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 bg-surface border border-border-hi rounded-xl shadow-2xl overflow-hidden min-w-[240px] z-50"
          >
            <div className="text-[10px] text-slate-600 uppercase tracking-wider px-3 pt-3 pb-1 font-semibold">
              Switch User (Demo)
            </div>
            {MOCK_USERS.map(user => {
              const isActive = user.id === currentUser.id
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onUserChange(user.id)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer ${
                    isActive ? 'bg-premier-muted' : 'hover:bg-surface-2'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-premier text-white' : 'bg-surface-3 text-slate-300'
                    }`}
                  >
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-none truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user.title}</p>
                  </div>
                  {isActive && (
                    <Check size={14} className="text-premier shrink-0" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
