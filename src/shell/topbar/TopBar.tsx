'use client'

import { useState, useEffect } from 'react'
import { Bell, Wifi, Circle } from 'lucide-react'
import { useWindowStore } from '@/core/windows/windowStore'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { useNotificationStore } from '@/core/notifications/notificationStore'
import { useSystemUIStore } from '@/core/ui/systemUIStore'

interface TopBarProps {
  onLauncherToggle: () => void
}

function Clock() {
  const [time, setTime] = useState('')
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 3000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="px-2 py-1 rounded text-sm font-medium transition-colors hover:bg-white/5"
        style={{ color: 'var(--color-os-text)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
        title="Click me if you have nothing better to do"
      >
        {time}
      </button>
      {clicked && (
        <div
          className="absolute top-8 right-0 whitespace-nowrap px-3 py-2 rounded-lg text-xs z-50"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            color: 'var(--color-os-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          You really have nothing better to do, huh?
        </div>
      )}
    </div>
  )
}

export default function TopBar({ onLauncherToggle }: TopBarProps) {
  const { windows, activeWindowId } = useWindowStore()
  const { uselessnessScore } = useProductivityStore()
  const { unreadCount } = useNotificationStore()
  const { toggleControlCenter } = useSystemUIStore()

  const activeWindow = windows.find(w => w.id === activeWindowId && !w.minimized)

  return (
    <div
      className="flex items-center px-4 shrink-0 glass-panel"
      style={{
        height: 38,
        borderBottom: '1px solid var(--color-os-border)',
        zIndex: 100,
        position: 'relative',
        borderRadius: 0,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        {/* Logo / Activities */}
        <button
          onClick={(e) => { e.stopPropagation(); onLauncherToggle(); }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
          title="Open launcher (Meta key)"
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>🦥</span>
          <span style={{ color: 'var(--color-os-text)', fontSize: 12, fontWeight: 600, letterSpacing: 1.5 }}>
            SLOTH OS
          </span>
        </button>

        <div style={{ width: 1, height: 14, background: 'var(--color-os-border)' }} />

        {/* Active window title */}
        <span
          className="text-sm truncate max-w-48"
          style={{ color: 'var(--color-os-text-secondary)', fontSize: 12 }}
        >
          {activeWindow?.title ?? 'Desktop'}
        </span>
      </div>

      {/* Center — Uselessness score */}
      <div
        className="flex items-center gap-2 px-3"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
      >
        <span style={{ color: 'var(--color-os-text-muted)' }}>Uselessness:</span>
        <span style={{ color: '#A371F7', fontWeight: 600 }}>{Math.round(uselessnessScore)}%</span>
      </div>

      {/* Right */}
      <div
        id="system-tray-toggle"
        onClick={toggleControlCenter}
        role="button"
        tabIndex={0}
        className="flex items-center gap-1 flex-1 justify-end px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-default"
      >
        <div className="flex items-center" title="WiFi: Connected to Procrastination Network">
          <Wifi size={13} style={{ color: 'var(--color-os-text-secondary)' }} />
        </div>
        <div className="relative flex items-center mx-1" title="Notifications">
          <Bell size={13} style={{ color: unreadCount > 0 ? '#A371F7' : 'var(--color-os-text-secondary)' }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 flex items-center justify-center rounded-full text-white"
              style={{ background: '#F85149', fontSize: 9, fontWeight: 600 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <div className="pointer-events-none">
          <Clock />
        </div>
      </div>
    </div>
  )
}
