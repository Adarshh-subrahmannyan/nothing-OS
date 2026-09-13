'use client'

import { useState, useEffect } from 'react'
import { useWindowStore } from '@/core/windows/windowStore'
import { APP_REGISTRY } from '@/core/apps/appRegistry'

type Process = {
  pid: number
  name: string
  appId: string
  cpu: number
  memory: number
  motivation: number
  uptime: number
}

const SYSTEM_PROCS: Process[] = [
  { pid: 1, name: 'sloth-kernel', appId: '', cpu: 0.0, memory: 12, motivation: 0, uptime: 9999 },
  { pid: 2, name: 'sloth-engine', appId: '', cpu: 0.1, memory: 8, motivation: 0, uptime: 9998 },
  { pid: 3, name: 'procrastination-svc', appId: '', cpu: 0.2, memory: 22, motivation: 0, uptime: 9997 },
  { pid: 4, name: 'excuse-daemon', appId: '', cpu: 0.0, memory: 4, motivation: 0, uptime: 9996 },
  { pid: 5, name: 'distraction-manager', appId: '', cpu: 0.1, memory: 14, motivation: 0, uptime: 9995 },
]

function randFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

export default function ProcessManager({ windowId }: { windowId: string }) {
  const { windows } = useWindowStore()
  const [tick, setTick] = useState(0)

  // Animate values
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  const appProcs: Process[] = windows
    .filter(w => !w.minimized)
    .map((w, i) => ({
      pid: 100 + i,
      name: APP_REGISTRY[w.appId]?.name.toLowerCase().replace(/\s+/g, '-') ?? w.appId,
      appId: w.appId,
      cpu: randFloat(0.0, 2.0),
      memory: randFloat(10, 60),
      motivation: randFloat(0, 3),
      uptime: Math.round((Date.now() - 1000 * i) / 1000),
    }))

  const allProcs = [...SYSTEM_PROCS, ...appProcs]

  const totalCpu = allProcs.reduce((s, p) => s + p.cpu, 0)
  const totalMem = allProcs.reduce((s, p) => s + p.memory, 0) / allProcs.length

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-os-surface)', fontFamily: 'var(--font-mono)' }}>
      {/* Header */}
      <div
        className="px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        <div style={{ color: 'var(--color-os-text)', fontSize: 13, fontWeight: 600 }}>Process Manager</div>
        <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, marginTop: 2 }}>
          {allProcs.length} processes running — System functioning below expectations (as designed)
        </div>
      </div>

      {/* System stats */}
      <div
        className="grid grid-cols-4 px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'rgba(23,26,31,0.5)' }}
      >
        {[
          { label: 'CPU', value: `${totalCpu.toFixed(1)}%`, color: '#3FB950' },
          { label: 'MEMORY', value: `${totalMem.toFixed(0)}%`, color: '#58A6FF' },
          { label: 'MOTIVATION', value: '2%', color: '#F85149' },
          { label: 'USELESSNESS', value: '98%', color: '#A371F7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <div style={{ color: 'var(--color-os-text-muted)', fontSize: 10, letterSpacing: 1 }}>{label}</div>
            <div style={{ color, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div
        className="grid px-5 py-2 shrink-0"
        style={{
          gridTemplateColumns: '60px 1fr 80px 80px 80px',
          borderBottom: '1px solid var(--color-os-border)',
          color: 'var(--color-os-text-muted)',
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        <span>PID</span>
        <span>PROCESS</span>
        <span className="text-right">CPU</span>
        <span className="text-right">MEM</span>
        <span className="text-right">MOTIV.</span>
      </div>

      {/* Processes */}
      <div className="flex-1 overflow-y-auto">
        {allProcs.map((proc, i) => (
          <div
            key={proc.pid}
            className="grid px-5 py-2 hover:bg-white/3 transition-colors"
            style={{
              gridTemplateColumns: '60px 1fr 80px 80px 80px',
              borderBottom: '1px solid rgba(42,48,56,0.3)',
              fontSize: 12,
            }}
          >
            <span style={{ color: 'var(--color-os-text-muted)' }}>{proc.pid}</span>
            <span style={{ color: proc.appId ? '#A371F7' : 'var(--color-os-text-secondary)' }}>
              {proc.name}
            </span>
            <span className="text-right" style={{ color: proc.cpu > 1 ? '#D29922' : '#3FB950' }}>
              {proc.cpu.toFixed(1)}%
            </span>
            <span className="text-right" style={{ color: 'var(--color-os-text-secondary)' }}>
              {proc.memory.toFixed(0)}%
            </span>
            <span className="text-right" style={{ color: '#F85149' }}>
              {proc.motivation.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-2 shrink-0"
        style={{
          borderTop: '1px solid var(--color-os-border)',
          color: 'var(--color-os-text-muted)',
          fontSize: 11,
          background: 'var(--color-os-elevated)',
        }}
      >
        These are simulated processes. No real system resources are used.
        Motivation values are accurate.
      </div>
    </div>
  )
}
