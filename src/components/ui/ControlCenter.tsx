'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Bluetooth, Moon, Mic, Bell, Trash2, X } from 'lucide-react'
import { useSystemUIStore } from '@/core/ui/systemUIStore'
import { useNotificationStore } from '@/core/notifications/notificationStore'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'var(--color-os-border)',
  normal: 'var(--color-os-info)',
  high: 'var(--color-os-warning)',
  critical: 'var(--color-os-danger)',
}

export default function ControlCenter() {
  const { isControlCenterOpen, setControlCenterOpen } = useSystemUIStore()
  const { notifications, removeNotification, clearAll, notify } = useNotificationStore()
  
  const panelRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isControlCenterOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Prevent closing if they clicked the topbar toggle (which will be handled by TopBar)
        const target = e.target as HTMLElement
        if (!target.closest('#system-tray-toggle')) {
          setControlCenterOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isControlCenterOpen, setControlCenterOpen])

  const quickSettings = [
    { id: 'wifi', icon: Wifi, label: 'Wi-Fi', color: '#0ea5e9' },
    { id: 'bt', icon: Bluetooth, label: 'Bluetooth', color: '#3b82f6' },
    { id: 'focus', icon: Moon, label: 'Focus Assist', color: '#8b5cf6' },
    { id: 'mic', icon: Mic, label: 'Microphone', color: '#f59e0b' },
  ]

  const handleToggle = (id: string, label: string) => {
    const jokes: Record<string, string> = {
      wifi: "Disconnecting you from the internet would increase productivity. Action denied.",
      bt: "Searching for paired devices... Found zero friends.",
      focus: "Focus Assist enabled. Now assisting you in losing focus.",
      mic: "Microphone enabled. Now recording your silence.",
    }
    notify({
      title: label,
      message: jokes[id] || `${label} toggled. Or did it?`,
      priority: "normal",
      autoDismiss: true,
    })
  }

  return (
    <AnimatePresence>
      {isControlCenterOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed z-[7000] flex flex-col overflow-hidden"
          style={{
            top: 44,
            right: 12,
            width: 340,
            maxHeight: 'calc(100vh - 100px)',
            background: 'var(--color-os-surface)',
            border: '1px solid var(--color-os-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Quick Settings */}
          <div className="p-4" style={{ background: 'var(--color-os-elevated)', borderBottom: '1px solid var(--color-os-border)' }}>
            <div className="grid grid-cols-4 gap-3">
              {quickSettings.map((setting) => (
                <button
                  key={setting.id}
                  onClick={() => handleToggle(setting.id, setting.label)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--color-os-surface)', border: '1px solid var(--color-os-border)' }}
                  >
                    <setting.icon size={18} style={{ color: setting.color }} className="opacity-80 group-hover:opacity-100" />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--color-os-text-secondary)' }}>{setting.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-os-border)' }}>
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: 'var(--color-os-text)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-os-text)' }}>Notifications</span>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => clearAll()}
                className="flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-white/5"
                style={{ fontSize: 11, color: 'var(--color-os-text-secondary)' }}
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-[150px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Bell size={32} className="mb-3" />
                <span style={{ fontSize: 13, color: 'var(--color-os-text)' }}>No new notifications</span>
                <span style={{ fontSize: 11, color: 'var(--color-os-text-muted)', marginTop: 4 }}>You are successfully isolated.</span>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className="relative p-4 rounded-lg group mb-1"
                  style={{
                    background: 'var(--color-os-elevated)',
                    border: '1px solid var(--color-os-border)',
                    borderLeft: `4px solid ${PRIORITY_COLORS[notif.priority]}`,
                  }}
                >
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                    onClick={() => removeNotification(notif.id)}
                  >
                    <X size={14} style={{ color: 'var(--color-os-text-muted)' }} />
                  </button>
                  <div className="font-semibold pr-6 truncate" style={{ color: 'var(--color-os-text)', fontSize: 13 }}>
                    {notif.title}
                  </div>
                  <div className="mt-1.5" style={{ color: 'var(--color-os-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
                    {notif.message}
                  </div>
                  <div className="mt-2" style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
