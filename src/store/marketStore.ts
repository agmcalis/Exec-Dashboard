import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CmsHospital } from '../types/market'

interface MarketState {
  selectedHospitals: CmsHospital[]
  addHospital: (h: CmsHospital) => void
  removeHospital: (facilityId: string) => void
  setHospitals: (hospitals: CmsHospital[]) => void
  isSelected: (facilityId: string) => boolean
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      selectedHospitals: [],
      addHospital: (h) => {
        if (!get().isSelected(h.facilityId)) {
          set(s => ({ selectedHospitals: [...s.selectedHospitals, h] }))
        }
      },
      removeHospital: (id) => set(s => ({
        selectedHospitals: s.selectedHospitals.filter(h => h.facilityId !== id)
      })),
      setHospitals: (hospitals) => set({ selectedHospitals: hospitals }),
      isSelected: (id) => get().selectedHospitals.some(h => h.facilityId === id),
    }),
    { name: 'market-store' }
  )
)
