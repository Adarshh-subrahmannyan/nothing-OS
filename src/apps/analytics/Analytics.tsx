'use client'

import { useProductivityStore } from '@/core/productivity/productivityEngine'

export default function Analytics({ windowId }: { windowId: string }) {
  const { uselessnessScore, productivityScore, analytics, achievements } = useProductivityStore()

  const formatTime = (secs: number) => {
    if (secs < 60) return `${Math.floor(secs)}s`
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }

  const sessionSecs = (Date.now() - analytics.sessionStart) / 1000
  const sessionFormatted = formatTime(sessionSecs)
  const actualWork = formatTime(analytics.timeInProductiveApps)
  const avoidingWork = formatTime(analytics.timeInUselessApps)
  const idleTime = formatTime(analytics.idleTime)

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-os-surface)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        <div className="flex-1">
          <div style={{ color: 'var(--color-os-text)', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-sans)', letterSpacing: 1 }}>USELESSNESS ANALYTICS</div>
          <div style={{ color: 'var(--color-os-text-muted)', fontSize: 14, marginTop: 4 }}>
            Session started {sessionFormatted} ago — System functioning exactly as intended.
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Big scores */}
        <div className="grid grid-cols-2 gap-4">
          <ScoreCard
            label="USELESSNESS"
            value={Math.round(uselessnessScore)}
            color="#A371F7"
            note="↑ GOOD"
          />
          <ScoreCard
            label="PRODUCTIVITY"
            value={Math.round(productivityScore)}
            color="#F85149"
            note="↓ BAD"
          />
        </div>

        {/* Time breakdown */}
        <Section title="SYSTEM ACTIVITY">
          <TimeRow label="Actual Work" value={actualWork} color="var(--color-os-danger)" />
          <TimeRow label="Avoiding Work" value={avoidingWork} color="var(--color-os-useless)" />
          <TimeRow label="Idle / Thinking" value={idleTime} color="var(--color-os-info)" />
          <TimeRow label="Total Session" value={sessionFormatted} color="var(--color-os-warning)" />
        </Section>

        {/* Stats */}
        <Section title="PRODUCTIVITY STATISTICS">
          <StatRow label="Blocked Productive Actions" value={analytics.productivityBlocked} />
          <StatRow label="Productivity Attempts" value={analytics.productivityAttempts} />
          <StatRow label="Games Played" value={analytics.gamesPlayed} />
          <StatRow label="Excuses Generated" value={analytics.excusesGenerated} />
          <StatRow label="Terminal Commands" value={analytics.commandsExecuted} />
          <StatRow label="Notes Created" value={analytics.notesCreated} />
        </Section>

        {/* Achievements */}
        <Section title={`ACHIEVEMENTS (${unlockedCount}/${achievements.length})`}>
          <div className="flex flex-col gap-2">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: ach.unlocked ? 'rgba(163,113,247,0.08)' : 'transparent',
                  border: `1px solid ${ach.unlocked ? 'rgba(163,113,247,0.25)' : 'var(--color-os-border)'}`,
                  opacity: ach.unlocked ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 28 }}>{ach.emoji}</span>
                <div>
                  <div style={{ color: ach.unlocked ? 'var(--color-os-text)' : 'var(--color-os-text-muted)', fontSize: 16, fontWeight: 600 }}>
                    {ach.title}
                  </div>
                  <div style={{ color: 'var(--color-os-text-muted)', fontSize: 14, marginTop: 4 }}>{ach.description}</div>
                </div>
                {ach.unlocked && (
                  <div style={{ marginLeft: 'auto', color: '#A371F7', fontSize: 14, fontWeight: 'bold', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
                    ✓ UNLOCKED
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* System status */}
        <div
          className="p-6 rounded-2xl text-center"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ color: '#A371F7', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }}>SYSTEM STATUS</div>
          <div style={{ color: 'var(--color-os-text-secondary)', fontSize: 14, marginTop: 6 }}>
            Working perfectly.
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, value, color, note }: { label: string; value: number; color: string; note: string }) {
  return (
    <div
      className="flex flex-col items-center p-6 rounded-2xl"
      style={{ background: 'var(--color-os-elevated)', border: `1px solid ${color}30` }}
    >
      <div style={{ color: 'var(--color-os-text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: 4, marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 72, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 32 }}>%</span>
      </div>
      {/* Bar */}
      <div className="w-full mt-6 rounded-full overflow-hidden" style={{ height: 8, background: 'var(--color-os-border)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <div style={{ color, fontSize: 14, marginTop: 12, fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: 2 }}>{note}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: 'var(--color-os-text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: 3, marginBottom: 12 }}>
        {title}
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        {children}
      </div>
    </div>
  )
}

function TimeRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(42,48,56,0.5)' }}>
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <span style={{ color: 'var(--color-os-text-secondary)', fontSize: 16, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ color: 'var(--color-os-text)', fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(42,48,56,0.5)' }}>
      <span style={{ color: 'var(--color-os-text-secondary)', fontSize: 16, fontWeight: 500 }}>{label}</span>
      <span style={{ color: 'var(--color-os-text)', fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</span>
    </div>
  )
}
