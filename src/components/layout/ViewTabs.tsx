import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Pencil } from 'lucide-react'
import type { SavedView } from '../../types/wizard'

interface ViewTabsProps {
  views: SavedView[]
  activeViewId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRenameView: (id: string, name: string) => void
}

export default function ViewTabs({ views, activeViewId, onSelect, onNew, onDelete, onRenameView }: ViewTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  function startEditing(view: SavedView) {
    setEditingId(view.id)
    setEditingName(view.name)
  }

  function commitRename() {
    if (editingId) {
      if (editingName.trim()) {
        onRenameView(editingId, editingName.trim())
      }
      setEditingId(null)
      setEditingName('')
    }
  }

  function cancelRename() {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-border overflow-x-auto shrink-0">
      <AnimatePresence initial={false}>
        {views.map(view => {
          const isActive = view.id === activeViewId
          const isEditing = editingId === view.id

          return (
            <motion.div
              key={view.id}
              initial={{ opacity: 0, scale: 0.9, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all cursor-pointer relative group shrink-0 ${
                isActive
                  ? 'bg-surface-2 text-white border border-b-0 border-border'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface/50'
              }`}
              onClick={() => {
                if (!isEditing) onSelect(view.id)
              }}
            >
              {/* Tab label or rename input */}
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') cancelRename()
                  }}
                  onClick={e => e.stopPropagation()}
                  className="bg-transparent border-b border-premier text-white text-sm font-medium outline-none w-32 min-w-0"
                />
              ) : (
                <span
                  className="max-w-[160px] truncate"
                  onDoubleClick={e => {
                    e.stopPropagation()
                    startEditing(view)
                  }}
                >
                  {view.name}
                </span>
              )}

              {/* Pencil icon — only on active tab, not while editing */}
              {isActive && !isEditing && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    startEditing(view)
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-slate-400 ml-1 cursor-pointer flex-shrink-0 transition-opacity"
                  aria-label={`Rename view "${view.name}"`}
                >
                  <Pencil size={11} strokeWidth={2} />
                </button>
              )}

              {/* Delete button */}
              {!isEditing && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(view.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-200 shrink-0 -mr-1"
                  aria-label={`Delete view "${view.name}"`}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* New view button */}
      <button
        onClick={onNew}
        className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-premier rounded-t-lg transition-colors shrink-0"
        aria-label="Add new view"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
