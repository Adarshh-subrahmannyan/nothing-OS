'use client'

import { motion } from 'framer-motion'
import { useWindowStore } from '@/core/windows/windowStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { APP_REGISTRY, DESKTOP_APPS } from '@/core/apps/appRegistry'
import {
  FileText, Terminal, Gamepad2, Folder, Settings, BarChart2,
  Bot, Skull, Cpu, LayoutGrid, Globe, ListTodo
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  FileText, Terminal, Gamepad2, Folder, Settings, BarChart2, Bot, Skull, Cpu, Globe, ListTodo
}

interface DockProps {
  onLauncherToggle: () => void
}

export default function Dock({ onLauncherToggle }: DockProps) {
  const { windows, openWindow, focusWindow } = useWindowStore()
  const { detectApp } = useProductivityStore()

  const handleAppClick = (appId: string) => {
    // Check if already open
    const existing = windows.filter(w => w.appId === appId && !w.minimized)
    if (existing.length > 0) {
      focusWindow(existing[0].id)
      return
    }
    // Check minimized
    const minimized = windows.find(w => w.appId === appId && w.minimized)
    if (minimized) {
      focusWindow(minimized.id)
      return
    }
    // Open new
    detectApp(appId)
    const app = APP_REGISTRY[appId]
    if (app) openWindow(appId, app.name)
  }

  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        height: 56,
        zIndex: 200,
        position: 'relative',
      }}
    >
      <div
        className="flex items-center gap-1 px-3"
        style={{
          background: 'rgba(23,26,31,0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--color-os-border)',
          borderRadius: 16,
          height: 48,
        }}
      >
        {/* Launcher button */}
        <DockItem
          label="Apps"
          icon={<LayoutGrid size={20} strokeWidth={1.5} />}
          active={false}
          running={false}
          onClick={onLauncherToggle}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--color-os-border)', margin: '0 4px' }} />

        {/* App icons */}
        {Object.keys(APP_REGISTRY).map(appId => {
          const app = APP_REGISTRY[appId]
          if (!app) return null
          const IconComp = ICON_MAP[app.icon]
          const isRunning = windows.some(w => w.appId === appId)
          const isFocused = windows.some(w => w.appId === appId && w.focused && !w.minimized)

          return (
            <DockItem
              key={appId}
              label={app.name}
              icon={IconComp ? <IconComp size={20} strokeWidth={1.5} /> : null}
              active={isFocused}
              running={isRunning}
              onClick={() => handleAppClick(appId)}
            />
          )
        })}
      </div>
    </div>
  )
}

function DockItem({
  label, icon, active, running, onClick
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  running: boolean
  onClick: () => void
}) {
  return (
    <motion.div className="relative group" whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={label}
        className="flex flex-col items-center justify-center w-9 h-9 rounded-xl transition-colors"
        style={{
          background: active ? 'rgba(163,113,247,0.2)' : 'transparent',
          border: active ? '1px solid rgba(163,113,247,0.3)' : '1px solid transparent',
          color: active ? '#A371F7' : 'var(--color-os-text-secondary)',
        }}
      >
        {icon}
      </button>

      {/* Running indicator dot */}
      {running && (
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: active ? '#A371F7' : 'var(--color-os-text-secondary)' }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100"
        style={{
          background: 'var(--color-os-elevated)',
          border: '1px solid var(--color-os-border)',
          color: 'var(--color-os-text)',
          fontSize: 11,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}
