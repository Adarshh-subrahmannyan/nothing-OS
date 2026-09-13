'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { eventBus } from '@/core/events/eventBus'
import type { Achievement } from '@/types'

export default function AchievementToast() {
  const [current, setCurrent] = useState<Achievement | null>(null)

  useEffect(() => {
    const unsub = eventBus.on('ACHIEVEMENT_UNLOCKED', (event) => {
      const { id, title } = event.payload as { id: string; title: string }
      const ach = useProductivityStore.getState().achievements.find(a => a.id === id)
      if (ach) {
        setCurrent(ach)
        setTimeout(() => setCurrent(null), 4000)
      }
    })
    return unsub
  }, [])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2"
          style={{ zIndex: 9000 }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: 'var(--color-os-elevated)',
              border: '1px solid rgba(163,113,247,0.4)',
              borderRadius: 12,
              boxShadow: '0 0 24px rgba(163,113,247,0.3), 0 8px 32px rgba(0,0,0,0.5)',
              minWidth: 260,
            }}
          >
            <div style={{ fontSize: 28 }}>{current.emoji}</div>
            <div>
              <div style={{ color: '#A371F7', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
                ACHIEVEMENT UNLOCKED
              </div>
              <div style={{ color: 'var(--color-os-text)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                {current.title}
              </div>
              <div style={{ color: 'var(--color-os-text-secondary)', fontSize: 11, marginTop: 1 }}>
                {current.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
