'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BOOT_LINES = [
  { text: '🦥 SLOTH OS  v0.1.0 — Canopy Edition', delay: 0, color: '#A371F7', bold: true },
  { text: '', delay: 300 },
  { text: 'Initializing BIOS...', delay: 600, dot: '...', result: 'OK', resultColor: '#3FB950' },
  { text: 'Checking memory...', delay: 900, result: '4GB DETECTED (3.9GB NAP TIME)', resultColor: '#3FB950' },
  { text: 'Loading kernel...', delay: 1100, result: 'DEFINITELY LINUX', resultColor: '#3FB950' },
  { text: '', delay: 1200 },
  { text: 'Initializing motivation...', delay: 1400, result: 'FAILED', resultColor: '#F85149' },
  { text: 'Loading work ethic...', delay: 1700, result: 'NOT FOUND', resultColor: '#F85149' },
  { text: 'Loading productivity...', delay: 2000, result: 'FAILED', resultColor: '#F85149' },
  { text: 'Loading distractions...', delay: 2300, result: '100%', resultColor: '#3FB950' },
  { text: 'Loading excuses...', delay: 2500, result: '100%', resultColor: '#3FB950' },
  { text: 'Starting Sloth Engine...', delay: 2700, result: 'SLOWLY OK', resultColor: '#3FB950' },
  { text: '', delay: 2900 },
  { text: 'SYSTEM READY', delay: 3100, color: '#A371F7', bold: true },
  { text: 'Productivity: 2%   |   Uselessness: 98%', delay: 3300, color: '#6F7782' },
]

type BootLine = {
  text: string
  delay?: number
  color?: string
  bold?: boolean
  result?: string
  resultColor?: string
  dot?: string
}

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const complete = useCallback(() => {
    setDone(true)
    setTimeout(onComplete, 400)
  }, [onComplete])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    BOOT_LINES.forEach((_, i) => {
      const delay = BOOT_LINES[i].delay ?? 0
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, delay))
    })

    // Auto-complete
    timers.push(setTimeout(complete, 3800))

    return () => timers.forEach(clearTimeout)
  }, [complete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 flex flex-col items-start justify-center cursor-pointer pl-12 md:pl-24"
          style={{ background: '#000', fontFamily: 'var(--font-mono)' }}
          onClick={complete}
        >
          <div className="w-full max-w-lg px-8">
            {BOOT_LINES.map((line, i) => (
              <AnimatePresence key={i}>
                {visibleLines.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex justify-between items-center"
                    style={{
                      color: line.color ?? '#E8EAED',
                      fontWeight: line.bold ? 600 : 400,
                      fontSize: 13,
                      lineHeight: line.text === '' ? '0.6rem' : '1.8rem',
                      minHeight: line.text === '' ? 10 : 'auto',
                    }}
                  >
                    <span>{line.text}</span>
                    {line.result && (
                      <span style={{ color: line.resultColor ?? '#3FB950', marginLeft: 16 }}>
                        [{line.result}]
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}

            {visibleLines.length > 0 && (
              <span
                className="inline-block cursor-blink mt-1 px-8"
                style={{ color: '#A371F7', fontSize: 13 }}
              >█</span>
            )}
          </div>

          <div
            className="absolute bottom-8 w-full text-center left-0"
            style={{ color: '#6F7782', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          >
            Press any key or click to skip
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
