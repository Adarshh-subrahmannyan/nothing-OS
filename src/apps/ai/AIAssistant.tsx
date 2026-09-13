'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Loader2, RefreshCw } from 'lucide-react'
import { useProductivityStore } from '@/core/productivity/productivityEngine'

// ─── Canned responses (offline fallback) ────────────────────────────────────

const EXCUSE_BANK: Record<string, string[]> = {
  professional: [
    "I encountered an unexpected cognitive optimization period that temporarily reduced my execution velocity.",
    "My deliverables were impacted by an unforeseen ideation bottleneck requiring immediate resolution.",
    "I was in a deep focus session conducting strategic horizon-scanning for the project.",
    "A critical dependency review necessitated extended analysis time beyond the initial estimate.",
    "I was proactively managing my cognitive bandwidth to ensure peak performance for future deliverables.",
  ],
  corporate: [
    "I was synergizing cross-functional thought leadership initiatives to maximize stakeholder alignment.",
    "The work was being de-prioritized in favor of a mission-critical low-urgency exploratory research pivot.",
    "I was rightsizing my personal productivity pipeline to ensure a scalable and sustainable output cadence.",
    "This deliverable was moved to the next sprint cycle to ensure appropriate quality assurance bandwidth.",
    "I was conducting an agile retrospective on my personal workflow to unlock future velocity gains.",
  ],
  ridiculous: [
    "A rogue pigeon flew past my window at the exact moment I was going to start, breaking my concentration for the rest of the day.",
    "I was legally obligated by my conscience to watch one more video about deep sea creatures before beginning.",
    "My keyboard was at the wrong temperature and I had to wait for it to reach optimal tactile resistance.",
    "I was mentally rehearsing starting the work, which is essentially 80% of the work already.",
    "I couldn't find the right playlist and you simply cannot work without the right playlist.",
  ],
}

const DISTRACTIONS = [
  "Research why flamingos stand on one leg (science demands it)",
  "Organize your Downloads folder (it's been 3 years)",
  "Learn why bananas are radioactive",
  "Count all the tabs in your browser",
  "Start a new project you'll also never finish",
  "Read random Wikipedia articles for exactly 47 minutes",
  "Rearrange your bookmarks for maximum inefficiency",
  "Research the lifecycle of the common house spider",
  "Write a list of things you'll do tomorrow instead",
  "Audit all your streaming service subscriptions",
]

const ROASTS = [
  "Your productivity score is so low, even your CPU is embarrassed.",
  "You've spent more time looking at this dashboard than doing anything about it.",
  "At this rate, you'll finish that project sometime during the heat death of the universe.",
  "Your task completion rate is statistically indistinguishable from zero.",
  "Studies show that watching paint dry is 3x more productive than your current session.",
  "Your calendar thinks you're on a permanent sabbatical. It's not wrong.",
  "The procrastination you've displayed today could be described as artisanal.",
]

type Mode = 'home' | 'excuse' | 'distraction' | 'overthink' | 'roast'

export default function AIAssistant({ windowId }: { windowId: string }) {
  const [mode, setMode] = useState<Mode>('home')
  const { recordExcuse } = useProductivityStore()

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-os-surface)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        <Bot size={18} style={{ color: '#A371F7' }} />
        <div>
          <div style={{ color: 'var(--color-os-text)', fontSize: 14, fontWeight: 600 }}>Sloth AI</div>
          <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11 }}>What would you like to avoid today?</div>
        </div>
        {mode !== 'home' && (
          <button
            onClick={() => setMode('home')}
            className="ml-auto text-xs px-3 py-1 rounded hover:bg-white/5"
            style={{ color: 'var(--color-os-text-secondary)' }}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-5 flex flex-col gap-3"
            >
              {[
                { id: 'excuse', emoji: '🎭', label: 'Generate Excuse', desc: 'Professionally justify your lack of output' },
                { id: 'distraction', emoji: '🎯', label: 'Generate Distraction', desc: 'Find something better to do instead' },
                { id: 'overthink', emoji: '🧠', label: 'Overthink Something', desc: 'Turn a simple decision into an impossible one' },
                { id: 'roast', emoji: '🔥', label: 'Roast My Productivity', desc: 'Hear the truth about your session' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as Mode)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: 'var(--color-os-elevated)',
                    border: '1px solid var(--color-os-border)',
                  }}
                >
                  <div className="text-2xl w-10 text-center">{item.emoji}</div>
                  <div>
                    <div style={{ color: 'var(--color-os-text)', fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, marginTop: 2 }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
          {mode === 'excuse' && <ExcuseMode key="excuse" onRecord={recordExcuse} />}
          {mode === 'distraction' && <DistractionMode key="distraction" />}
          {mode === 'overthink' && <OverthinkMode key="overthink" />}
          {mode === 'roast' && <RoastMode key="roast" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ExcuseMode({ onRecord }: { onRecord: () => void }) {
  const [reason, setReason] = useState('')
  const [style, setStyle] = useState<'professional' | 'corporate' | 'ridiculous'>('professional')
  const [excuse, setExcuse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    // Try API first, fall back to canned
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'excuse', reason, style }),
      })
      if (res.ok) {
        const data = await res.json()
        setExcuse(data.result)
      } else throw new Error()
    } catch {
      const bank = EXCUSE_BANK[style]
      setExcuse(bank[Math.floor(Math.random() * bank.length)])
    }
    setLoading(false)
    onRecord()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 flex flex-col gap-4">
      <div>
        <label style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          SITUATION TO EXCUSE:
        </label>
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Didn't finish the assignment"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            color: 'var(--color-os-text)',
          }}
          aria-label="Situation to excuse"
        />
      </div>
      <div>
        <label style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          EXCUSE STYLE:
        </label>
        <div className="flex gap-2 mt-1">
          {(['professional', 'corporate', 'ridiculous'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
              style={{
                background: style === s ? '#A371F7' : 'var(--color-os-elevated)',
                color: style === s ? '#fff' : 'var(--color-os-text-secondary)',
                border: `1px solid ${style === s ? '#A371F7' : 'var(--color-os-border)'}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors"
        style={{ background: '#A371F7', color: '#fff' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : '🎭'}
        {loading ? 'Generating...' : 'Generate Excuse'}
      </button>

      {excuse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl"
          style={{ background: 'var(--color-os-elevated)', border: '1px solid rgba(163,113,247,0.3)' }}
        >
          <div style={{ color: '#A371F7', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>
            GENERATED EXCUSE:
          </div>
          <p style={{ color: 'var(--color-os-text)', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{excuse}&rdquo;
          </p>
          <button onClick={generate} className="mt-3 flex items-center gap-1 text-xs" style={{ color: 'var(--color-os-text-muted)' }}>
            <RefreshCw size={11} /> Generate another
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

function DistractionMode() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'distraction', task: input }),
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
      } else throw new Error()
    } catch {
      // Fallback
      const shuffled = [...DISTRACTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
      setResults(shuffled)
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 flex flex-col gap-4">
      <div>
        <label style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          WHAT WERE YOU SUPPOSED TO DO?
        </label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. Study DSA"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            color: 'var(--color-os-text)',
          }}
          aria-label="Task to replace"
        />
      </div>
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm"
        style={{ background: '#D29922', color: '#000' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : '🎯'}
        {loading ? 'Finding distractions...' : 'Find Better Things To Do'}
      </button>

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            BETTER ALTERNATIVES:
          </div>
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'var(--color-os-elevated)', border: '1px solid var(--color-os-border)' }}
            >
              <span style={{ color: '#D29922', fontSize: 13 }}>{i + 1}.</span>
              <span style={{ color: 'var(--color-os-text)', fontSize: 13 }}>{r}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function OverthinkMode() {
  const [question, setQuestion] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const OVERTHINK_STEPS = (q: string) => [
    `Initial question: "${q}"`,
    'Considering the philosophical implications...',
    'But wait — what is the context?',
    'Analyzing pro-con matrix... (87 rows)',
    'Consulting the inner committee...',
    'Committee disagrees. Calling second meeting.',
    'Researching what others would do...',
    'That made things worse.',
    'Back to fundamentals.',
    'Actually, maybe just flip a coin?',
    'But what if the coin is biased?',
    'FINAL DECISION: Postponed until tomorrow.',
  ]

  const run = async () => {
    if (!question.trim()) return
    setLoading(true)
    setSteps([])
    setDone(false)
    const all = OVERTHINK_STEPS(question)
    for (let i = 0; i < all.length; i++) {
      await new Promise(r => setTimeout(r, 400))
      setSteps(prev => [...prev, all[i]])
    }
    setDone(true)
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 flex flex-col gap-4">
      <div>
        <label style={{ color: 'var(--color-os-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          WHAT SIMPLE DECISION SHOULD WE OVERCOMPLICATE?
        </label>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. Tea or coffee?"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--color-os-elevated)',
            border: '1px solid var(--color-os-border)',
            color: 'var(--color-os-text)',
          }}
          onKeyDown={e => { if (e.key === 'Enter') run() }}
          aria-label="Decision to overthink"
        />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm"
        style={{ background: '#58A6FF', color: '#000' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : '🧠'}
        {loading ? 'Overthinking...' : 'Overthink This'}
      </button>

      {steps.length > 0 && (
        <div
          className="p-4 rounded-xl flex flex-col gap-2"
          style={{ background: 'var(--color-os-elevated)', border: '1px solid var(--color-os-border)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              style={{
                color: i === steps.length - 1 && done ? '#A371F7' : 'var(--color-os-text-secondary)',
                fontWeight: i === steps.length - 1 && done ? 600 : 400,
              }}
            >
              {i === steps.length - 1 && done ? '⚠️ ' : '→ '}{s}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function RoastMode() {
  const [roast, setRoast] = useState<string | null>(null)
  const { uselessnessScore, productivityScore, analytics } = useProductivityStore()

  const getRoast = () => {
    const r = ROASTS[Math.floor(Math.random() * ROASTS.length)]
    setRoast(r)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 flex flex-col gap-4">
      <div
        className="p-4 rounded-xl"
        style={{ background: 'var(--color-os-elevated)', border: '1px solid var(--color-os-border)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
      >
        <div style={{ color: 'var(--color-os-text-muted)', marginBottom: 8 }}>SESSION REPORT:</div>
        <div style={{ color: 'var(--color-os-text-secondary)' }}>Uselessness Score: <span style={{ color: '#A371F7' }}>{Math.round(uselessnessScore)}%</span></div>
        <div style={{ color: 'var(--color-os-text-secondary)' }}>Productivity Score: <span style={{ color: '#F85149' }}>{Math.round(productivityScore)}%</span></div>
        <div style={{ color: 'var(--color-os-text-secondary)' }}>Blocked Attempts: <span style={{ color: '#D29922' }}>{analytics.productivityBlocked}</span></div>
      </div>

      <button
        onClick={getRoast}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm"
        style={{ background: '#F85149', color: '#fff' }}
      >
        🔥 Roast Me
      </button>

      {roast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)' }}
        >
          <p style={{ color: 'var(--color-os-text)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{roast}&rdquo;
          </p>
          <button onClick={getRoast} className="mt-3 flex items-center gap-1 text-xs" style={{ color: 'var(--color-os-text-muted)' }}>
            <RefreshCw size={11} /> Another roast
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
