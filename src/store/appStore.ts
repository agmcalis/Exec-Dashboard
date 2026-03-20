import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockUser } from '../data/mockUsers'
import { MOCK_USERS, DEFAULT_USER_ID } from '../data/mockUsers'

export interface ViewConfig {
  id: string
  name: string
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  isReadOnly?: boolean
  sharedBy?: MockUser
  sharedFromId?: string // references SharedView.id
}

export interface SharedView {
  id: string
  name: string
  selectedKpiIds: string[]
  selectedBenchmarkIds: string[]
  sharedBy: MockUser
  sharedWith: 'all' | string[] // user IDs or 'all'
  sharedAt: string // ISO date string
}

interface AppStore {
  currentUserId: string
  viewsByUser: Record<string, ViewConfig[]>
  sharedViews: SharedView[]

  setCurrentUser: (userId: string) => void
  addView: (view: ViewConfig) => void
  removeView: (viewId: string) => void
  renameView: (viewId: string, name: string) => void
  updateViewKpis: (viewId: string, kpiIds: string[], benchmarkIds: string[]) => void
  shareView: (viewId: string, sharedWith: 'all' | string[]) => void
  addSharedViewAsTab: (sharedViewId: string) => void
  removeSharedTab: (viewId: string) => void
}

// Helper to get/set a user's views slice
function userViews(state: AppStore): ViewConfig[] {
  return state.viewsByUser[state.currentUserId] ?? []
}

function setUserViews(
  state: AppStore,
  updater: (prev: ViewConfig[]) => ViewConfig[],
): Partial<AppStore> {
  return {
    viewsByUser: {
      ...state.viewsByUser,
      [state.currentUserId]: updater(userViews(state)),
    },
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentUserId: DEFAULT_USER_ID,
      viewsByUser: {},
      sharedViews: [],

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId })
      },

      addView: (view: ViewConfig) => {
        set(state => setUserViews(state, prev => [...prev, view]))
      },

      removeView: (viewId: string) => {
        set(state => setUserViews(state, prev => prev.filter(v => v.id !== viewId)))
      },

      renameView: (viewId: string, name: string) => {
        set(state =>
          setUserViews(state, prev =>
            prev.map(v => (v.id === viewId ? { ...v, name: name.trim() || v.name } : v)),
          ),
        )
      },

      updateViewKpis: (viewId: string, kpiIds: string[], benchmarkIds: string[]) => {
        set(state =>
          setUserViews(state, prev =>
            prev.map(v =>
              v.id === viewId
                ? { ...v, selectedKpiIds: kpiIds, selectedBenchmarkIds: benchmarkIds }
                : v,
            ),
          ),
        )
      },

      shareView: (viewId: string, sharedWith: 'all' | string[]) => {
        const state = get()
        const view = userViews(state).find(v => v.id === viewId)
        if (!view) return

        const currentUser = MOCK_USERS.find(u => u.id === state.currentUserId)
        if (!currentUser) return

        const existingIdx = state.sharedViews.findIndex(
          sv => sv.sharedBy.id === state.currentUserId && sv.name === view.name,
        )

        if (existingIdx !== -1) {
          set(state => ({
            sharedViews: state.sharedViews.map((sv, i) =>
              i === existingIdx
                ? { ...sv, sharedWith, sharedAt: new Date().toISOString() }
                : sv,
            ),
          }))
        } else {
          const newShared: SharedView = {
            id: Date.now().toString(),
            name: view.name,
            selectedKpiIds: view.selectedKpiIds,
            selectedBenchmarkIds: view.selectedBenchmarkIds,
            sharedBy: currentUser,
            sharedWith,
            sharedAt: new Date().toISOString(),
          }
          set(state => ({ sharedViews: [...state.sharedViews, newShared] }))
        }
      },

      addSharedViewAsTab: (sharedViewId: string) => {
        const state = get()
        const sharedView = state.sharedViews.find(sv => sv.id === sharedViewId)
        if (!sharedView) return

        const newView: ViewConfig = {
          id: crypto.randomUUID(),
          name: sharedView.name,
          selectedKpiIds: sharedView.selectedKpiIds,
          selectedBenchmarkIds: sharedView.selectedBenchmarkIds,
          isReadOnly: true,
          sharedBy: sharedView.sharedBy,
          sharedFromId: sharedViewId,
        }
        set(state => setUserViews(state, prev => [...prev, newView]))
      },

      removeSharedTab: (viewId: string) => {
        set(state => setUserViews(state, prev => prev.filter(v => v.id !== viewId)))
      },
    }),
    { name: 'qi-app-store' },
  ),
)

export function getSharedWithMe(store: AppStore): SharedView[] {
  return store.sharedViews.filter(sv => {
    if (sv.sharedBy.id === store.currentUserId) return false
    if (sv.sharedWith === 'all') return true
    return (sv.sharedWith as string[]).includes(store.currentUserId)
  })
}

export function isViewAlreadyAdded(store: AppStore, sharedViewId: string): boolean {
  const views = store.viewsByUser[store.currentUserId] ?? []
  return views.some(v => v.sharedFromId === sharedViewId)
}
