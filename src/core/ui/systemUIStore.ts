import { create } from 'zustand'

type SystemUIStore = {
  isControlCenterOpen: boolean
  toggleControlCenter: () => void
  setControlCenterOpen: (open: boolean) => void
}

export const useSystemUIStore = create<SystemUIStore>((set) => ({
  isControlCenterOpen: false,
  toggleControlCenter: () => set((state) => ({ isControlCenterOpen: !state.isControlCenterOpen })),
  setControlCenterOpen: (open) => set({ isControlCenterOpen: open }),
}))
