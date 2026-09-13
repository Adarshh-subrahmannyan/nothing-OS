'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, FileText, Terminal, Gamepad2, Folder, Settings, BarChart2, Bot, Skull, Cpu, Globe } from 'lucide-react'
import { useWindowStore } from '@/core/windows/windowStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { APP_REGISTRY, DESKTOP_APPS } from '@/core/apps/appRegistry'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  FileText, Terminal, Gamepad2, Folder, Settings, BarChart2, Bot, Skull, Cpu, Globe,
  BarChart: BarChart2,
}

interface AppLauncherProps {
  onClose: () => void
}

export default function AppLauncher({ onClose }: AppLauncherProps) {
  const [query, setQuery] = useState('')
  const { openWindow } = useWindowStore()
  const { detectApp } = useProductivityStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const isProductivitySearch = ['productivity', 'work', 'focus', 'study', 'task'].some(k =>
    query.toLowerCase().includes(k)
  )

  const ALL_APPS = Object.keys(APP_REGISTRY)

  const filtered = ALL_APPS.filter(id => {
    const app = APP_REGISTRY[id]
    if (!app) return false
    return app.name.toLowerCase().includes(query.toLowerCase()) || id.includes(query.toLowerCase())
  })

  const handleOpen = (appId: string) => {
    detectApp(appId)
    const app = APP_REGISTRY[appId]
    if (app) openWindow(appId, app.name)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 flex flex-col items-center pt-20"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 5000 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            borderRadius: 12,
            height: 48,
          }}
        >
          <Search size={16} style={{ color: 'var(--color-os-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search applications..."
            className="flex-1 bg-transparent outline-none"
            style={{
              color: 'var(--color-os-text)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && filtered.length > 0) handleOpen(filtered[0])
            }}
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} style={{ color: 'var(--color-os-text-muted)' }} />
            </button>
          )}
        </div>

        {/* Results */}
        <div
          className="mt-3 p-3"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            borderRadius: 12,
            minHeight: 200,
          }}
        >
          {isProductivitySearch && query ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div style={{ fontSize: 32 }}>🚫</div>
              <div className="mt-3" style={{ color: 'var(--color-os-text)', fontSize: 14, fontWeight: 500 }}>
                No results found.
              </div>
              <div className="mt-1" style={{ color: 'var(--color-os-text-muted)', fontSize: 12 }}>
                Try searching for something less productive.
              </div>
              <div className="mt-4 flex gap-2">
                {['games', 'ai', 'cemetery'].map(id => (
                  <button
                    key={id}
                    onClick={() => handleOpen(id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                    style={{
                      background: 'var(--color-os-surface)',
                      border: '1px solid var(--color-os-border)',
                      color: 'var(--color-os-text-secondary)',
                    }}
                  >
                    {APP_REGISTRY[id]?.name}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--color-os-text-muted)', fontSize: 13 }}>
              No applications found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(filtered.length > 0 ? filtered : ALL_APPS).map(appId => {
                const app = APP_REGISTRY[appId]
                if (!app) return null
                const IconComp = ICON_MAP[app.icon]
                return (
                  <button
                    key={appId}
                    onClick={() => handleOpen(appId)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'var(--color-os-surface)',
                        border: '1px solid var(--color-os-border)',
                      }}
                    >
                      {IconComp && <IconComp size={22} strokeWidth={1.5} />}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-os-text)', textAlign: 'center' }}>
                      {app.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
