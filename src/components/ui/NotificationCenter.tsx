'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNotificationStore } from '@/core/notifications/notificationStore'
import type { Notification } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'var(--color-os-border)',
  normal: 'var(--color-os-info)',
  high: 'var(--color-os-warning)',
  critical: 'var(--color-os-danger)',
}

function NotifCard({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-os-elevated)',
        border: `1px solid var(--color-os-border)`,
        borderLeft: `3px solid ${PRIORITY_COLORS[notif.priority]}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        width: 320,
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      <div className="flex items-start gap-4 p-4 pr-10">
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold truncate"
            style={{ color: 'var(--color-os-text)', fontSize: 13 }}
          >
            {notif.title}
          </div>
          <div
            className="mt-1"
            style={{ color: 'var(--color-os-text-secondary)', fontSize: 12, lineHeight: 1.5 }}
          >
            {notif.message}
          </div>
          <div
            className="mt-1.5"
            style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          >
            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <button
        className="absolute top-2 right-2 p-1.5 rounded hover:bg-white/10"
        onClick={e => { e.stopPropagation(); onDismiss() }}
      >
        <X size={14} style={{ color: 'var(--color-os-text-muted)' }} />
      </button>
    </motion.div>
  )
}

export default function NotificationCenter() {
  const { notifications, dismiss } = useNotificationStore()

  // Show only the most recent 3 non-dismissed, non-read
  const visible = notifications.filter(n => !n.read).slice(0, 3)

  return (
    <div
      className="fixed flex flex-col gap-2"
      style={{ top: 44, right: 12, zIndex: 6000 }}
    >
      <AnimatePresence mode="popLayout">
        {visible.map(notif => (
          <NotifCard
            key={notif.id}
            notif={notif}
            onDismiss={() => dismiss(notif.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
