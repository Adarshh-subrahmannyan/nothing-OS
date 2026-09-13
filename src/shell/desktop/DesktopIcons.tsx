'use client'

import { useWindowStore } from '@/core/windows/windowStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { APP_REGISTRY, DESKTOP_APPS } from '@/core/apps/appRegistry'
import {
  FileText, Terminal, Gamepad2, Folder, Settings, BarChart2,
  Bot, Skull, Cpu, Globe, ListTodo
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  FileText, Terminal, Gamepad2, Folder, Settings, BarChart2, Bot, Skull, Cpu, Globe, ListTodo,
  BarChart: BarChart2,
}

const GRID_POSITIONS: Record<string, { col: number; row: number }> = {
  notepad:   { col: 0, row: 0 },
  terminal:  { col: 0, row: 1 },
  games:     { col: 0, row: 2 },
  files:     { col: 0, row: 3 },
  settings:  { col: 0, row: 4 },
  analytics: { col: 0, row: 5 },
  ai:        { col: 0, row: 6 },
  cemetery:  { col: 0, row: 7 },
  processes: { col: 0, row: 8 },
}

export default function DesktopIcons() {
  const { openWindow } = useWindowStore()
  const { detectApp } = useProductivityStore()

  const handleOpen = (appId: string) => {
    detectApp(appId)
    // Only open if firewall doesn't block (firewall will set firewallActive = true)
    // We open anyway — firewall overlays on top
    const app = APP_REGISTRY[appId]
    if (!app) return
    openWindow(appId, app.name)
  }

  return (
    <div
      className="absolute top-4 left-4 flex flex-col gap-1"
      style={{ zIndex: 10 }}
    >
      {DESKTOP_APPS.map(appId => {
        const app = APP_REGISTRY[appId]
        if (!app) return null
        const IconComp = ICON_MAP[app.icon]

        return (
          <button
            key={appId}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg group transition-all duration-150 hover:bg-white/5 active:bg-white/10"
            style={{ width: 80 }}
            onDoubleClick={() => handleOpen(appId)}
            title={`Double-click to open ${app.name}`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-150 group-active:scale-95"
              style={{
                background: 'rgba(29,33,40,0.85)',
                border: '1px solid rgba(42,48,56,0.8)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {IconComp && (
                <IconComp size={22} strokeWidth={1.5} />
              )}
            </div>
            <span
              className="text-center leading-tight break-words w-full line-clamp-2"
              style={{
                fontSize: 11,
                color: 'var(--color-os-text)',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                fontWeight: 500,
              }}
            >
              {app.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
