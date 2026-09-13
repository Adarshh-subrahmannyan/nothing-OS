import { create } from 'zustand'
import type { WindowState } from '@/types'
import { eventBus } from '@/core/events/eventBus'

const WINDOW_BASE_Z = 1000

let nextZIndex = WINDOW_BASE_Z + 1
let nextPid = 100

function generateWindowId(): string {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type WindowStore = {
  windows: WindowState[]
  activeWindowId: string | null

  openWindow: (appId: string, title: string, overrides?: Partial<WindowState>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
  updateWindow: (id: string, updates: Partial<WindowState>) => void
}

// Default sizes per app
const APP_DEFAULTS: Record<string, { width: number; height: number }> = {
  terminal:  { width: 700, height: 480 },
  notepad:   { width: 680, height: 520 },
  games:     { width: 640, height: 520 },
  files:     { width: 720, height: 500 },
  settings:  { width: 700, height: 530 },
  analytics: { width: 740, height: 540 },
  ai:        { width: 680, height: 560 },
  cemetery:  { width: 700, height: 520 },
  processes: { width: 720, height: 500 },
}

function getStartPosition(index: number) {
  const base = 80
  const offset = index * 24
  return { x: base + offset, y: base + offset }
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (appId, title, overrides = {}) => {
    const id = generateWindowId()
    const existing = get().windows.filter(w => !w.minimized)
    const pos = getStartPosition(existing.length)
    const defaults = APP_DEFAULTS[appId] ?? { width: 680, height: 500 }
    const z = nextZIndex++
    nextPid++

    const window: WindowState = {
      id,
      appId,
      title,
      x: pos.x,
      y: pos.y,
      width: defaults.width,
      height: defaults.height,
      minimized: false,
      maximized: false,
      focused: true,
      zIndex: z,
      ...overrides,
    }

    set(state => ({
      windows: state.windows.map(w => ({ ...w, focused: false })).concat(window),
      activeWindowId: id,
    }))

    eventBus.emit('APP_OPENED', { appId, windowId: id })
    return id
  },

  closeWindow: (id) => {
    const win = get().windows.find(w => w.id === id)
    set(state => ({
      windows: state.windows.filter(w => w.id !== id),
      activeWindowId: state.activeWindowId === id
        ? (state.windows.filter(w => w.id !== id).at(-1)?.id ?? null)
        : state.activeWindowId,
    }))
    if (win) eventBus.emit('APP_CLOSED', { appId: win.appId, windowId: id })
  },

  focusWindow: (id) => {
    const z = nextZIndex++
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id
          ? { ...w, focused: true, zIndex: z, minimized: false }
          : { ...w, focused: false }
      ),
      activeWindowId: id,
    }))
    eventBus.emit('WINDOW_FOCUSED', { windowId: id })
  },

  minimizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: true, focused: false } : w
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }))
    eventBus.emit('WINDOW_MINIMIZED', { windowId: id })
  },

  maximizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, maximized: true } : w
      ),
    }))
  },

  restoreWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, maximized: false, minimized: false } : w
      ),
    }))
  },

  moveWindow: (id, x, y) => {
    set(state => ({
      windows: state.windows.map(w => w.id === id ? { ...w, x, y } : w),
    }))
  },

  resizeWindow: (id, width, height) => {
    set(state => ({
      windows: state.windows.map(w => w.id === id ? { ...w, width, height } : w),
    }))
  },

  updateWindow: (id, updates) => {
    set(state => ({
      windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w),
    }))
  },
}))
