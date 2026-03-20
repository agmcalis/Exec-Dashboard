import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Users, Search, Check } from 'lucide-react'
import { MOCK_USERS } from '../../data/mockUsers'
import type { MockUser } from '../../data/mockUsers'
import type { ViewConfig } from '../../store/appStore'

interface ShareViewModalProps {
  view: ViewConfig
  currentUser: MockUser
  onClose: () => void
  onShare: (sharedWith: 'all' | string[]) => void
}

type SharingMode = 'all' | 'specific'

function InitialsAvatar({ user, isCurrent = false }: { user: MockUser; isCurrent?: boolean }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        isCurrent ? 'bg-premier text-white' : 'bg-surface-3 text-slate-300'
      }`}
    >
      {user.initials}
    </div>
  )
}

export default function ShareViewModal({ view, currentUser, onClose, onShare }: ShareViewModalProps) {
  const [mode, setMode] = useState<SharingMode>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const otherUsers = MOCK_USERS.filter(u => u.id !== currentUser.id)
  const filteredUsers = otherUsers.filter(u => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q)
  })

  function toggleUser(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleShare() {
    if (mode === 'all') {
      onShare('all')
    } else {
      if (selectedIds.length === 0) return
      onShare(selectedIds)
    }
  }

  const canShare = mode === 'all' || selectedIds.length > 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="bg-surface border border-border-hi rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-white">Share View</h2>
            <p className="text-sm text-premier mt-0.5">"{view.name}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-2"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5 w-fit">
            {(['all', 'specific'] as SharingMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-surface-3 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'all' ? (
                  <>
                    <Users size={11} strokeWidth={2} />
                    Everyone
                  </>
                ) : (
                  <>
                    <Search size={11} strokeWidth={2} />
                    Specific People
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {mode === 'all' ? (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                All users in Northfield Health Group will be able to add this view.
              </p>
              <div className="flex flex-col gap-2">
                {otherUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <InitialsAvatar user={u} />
                    <div className="min-w-0">
                      <p className="text-sm text-white leading-none">{u.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{u.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Search */}
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or title..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-white text-sm placeholder-slate-600 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-premier transition-colors"
                />
              </div>

              {/* User list */}
              <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-slate-600 py-4 text-center">No users found.</p>
                ) : (
                  filteredUsers.map(u => {
                    const selected = selectedIds.includes(u.id)
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUser(u.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-premier-muted border border-premier/20'
                            : 'hover:bg-surface-2 border border-transparent'
                        }`}
                      >
                        <InitialsAvatar user={u} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-none">{u.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{u.title}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                            selected
                              ? 'bg-premier border-premier'
                              : 'border-border bg-surface-2'
                          }`}
                        >
                          {selected && <Check size={10} strokeWidth={3} className="text-white" />}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!canShare}
            className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg transition-all ${
              canShare
                ? 'bg-premier hover:bg-premier-hover text-white cursor-pointer'
                : 'bg-surface-2 text-slate-600 cursor-not-allowed'
            }`}
          >
            Share
          </button>
        </div>
      </motion.div>
    </div>
  )
}


