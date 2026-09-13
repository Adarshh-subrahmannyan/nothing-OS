import { create } from 'zustand'
import type { Settings } from '@/types'

const DEFAULTS: Settings = {
  username: 'sloth',
  theme: 'dark',
  wallpaper: 'confucius',
  animationIntensity: 'full',
  soundEnabled: false,
  notificationsEnabled: true,
  firewallEnabled: true,
  firewallSensitivity: 'medium',
  githubUsername: '',
  demoMode: false,
}

type SettingsStore = {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULTS,
  updateSettings: (updates) =>
    set(state => ({ settings: { ...state.settings, ...updates } })),
  resetSettings: () => set({ settings: DEFAULTS }),
}))
