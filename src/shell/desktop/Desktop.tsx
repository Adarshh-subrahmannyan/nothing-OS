'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/core/windows/windowStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import Window from '@/components/ui/Window'
import TopBar from '@/shell/topbar/TopBar'
import Dock from '@/shell/dock/Dock'
import AppLauncher from '@/shell/launcher/AppLauncher'
import DesktopIcons from '@/shell/desktop/DesktopIcons'
import ProductivityFirewall from '@/components/ui/ProductivityFirewall'
import NotificationCenter from '@/components/ui/NotificationCenter'
import ControlCenter from '@/components/ui/ControlCenter'
import AchievementToast from '@/components/ui/AchievementToast'
import Wallpaper from '@/shell/desktop/Wallpaper'

// Lazy-load app components
const Terminal = lazy(() => import('@/apps/terminal/Terminal'))
const Notepad = lazy(() => import('@/apps/notepad/Notepad'))
const Games = lazy(() => import('@/apps/games/Games'))
const FileManager = lazy(() => import('@/apps/files/FileManager'))
const Settings = lazy(() => import('@/apps/settings/Settings'))
const Analytics = lazy(() => import('@/apps/analytics/Analytics'))
const AIAssistant = lazy(() => import('@/apps/ai/AIAssistant'))
const Cemetery = lazy(() => import('@/apps/cemetery/Cemetery'))
const ProcessManager = lazy(() => import('@/apps/processes/ProcessManager'))
const Google = lazy(() => import('@/apps/google/Google'))
const Todo = lazy(() => import('@/apps/todo/Todo'))

const APP_COMPONENTS: Record<string, React.ComponentType<{ windowId: string }>> = {
  terminal: Terminal,
  notepad: Notepad,
  games: Games,
  files: FileManager,
  settings: Settings,
  analytics: Analytics,
  ai: AIAssistant,
  cemetery: Cemetery,
  processes: ProcessManager,
  google: Google,
  todo: Todo,
}

export default function Desktop() {
  const { windows } = useWindowStore()
  const { firewallActive, quarantineActive } = useProductivityStore()
  const [launcherOpen, setLauncherOpen] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLauncherOpen(false)
      if (e.metaKey || e.key === 'Meta') setLauncherOpen(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Activity tracking interval
  useEffect(() => {
    const { incrementIdle, tickTime } = useProductivityStore.getState()
    
    const interval = setInterval(() => {
      const { activeWindowId, windows } = useWindowStore.getState()
      if (!activeWindowId) {
        incrementIdle()
        return
      }
      
      const activeWin = windows.find(w => w.id === activeWindowId)
      if (activeWin && !activeWin.minimized) {
        // We dynamically import classifyApp to check
        import('@/core/productivity/productivityEngine').then(({ classifyApp }) => {
          const type = classifyApp(activeWin.appId)
          tickTime(type, 1) // 1 second
        })
      } else {
        incrementIdle()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'var(--color-os-desktop)' }}
      onClick={() => setLauncherOpen(false)}
    >
      {/* Wallpaper */}
      <Wallpaper />

      {/* Top bar */}
      <TopBar onLauncherToggle={() => setLauncherOpen(v => !v)} />

      {/* Desktop area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Desktop icons */}
        <DesktopIcons />

        {/* Windows */}
        <Suspense fallback={null}>
          {windows.map(win => {
            const AppComponent = APP_COMPONENTS[win.appId]
            if (!AppComponent) return null
            return (
              <Window key={win.id} window={win}>
                <AppComponent windowId={win.id} />
              </Window>
            )
          })}
        </Suspense>
      </div>

      {/* Dock */}
      <Dock onLauncherToggle={() => setLauncherOpen(v => !v)} />

      {/* App launcher overlay */}
      <AnimatePresence>
        {launcherOpen && (
          <AppLauncher onClose={() => setLauncherOpen(false)} />
        )}
      </AnimatePresence>

      {/* System overlays */}
      <ControlCenter />
      <NotificationCenter />
      <AchievementToast />
      {(firewallActive || quarantineActive) && <ProductivityFirewall />}
    </div>
  )
}
