import { create } from 'zustand'
import type { ProductivityLevel, ThreatLevel, AnalyticsData, Achievement } from '@/types'
import { eventBus } from '@/core/events/eventBus'

// ─── Productive keywords ─────────────────────────────────────────────────────
const PRODUCTIVE_KEYWORDS = [
  'study', 'assignment', 'homework', 'work', 'task', 'deadline', 'report',
  'meeting', 'project', 'resume', 'cv', 'exam', 'quiz', 'lecture', 'research',
  'presentation', 'proposal', 'email work', 'job', 'career', 'internship',
  'plan', 'schedule', 'goal', 'productivity',
]

const USELESS_KEYWORDS = [
  'meme', 'cat', 'dog', 'game', 'fun', 'relax', 'nap', 'sleep', 'snack',
  'youtube', 'netflix', 'reddit', 'twitter', 'tiktok', 'scroll', 'procrastinate',
  'distraction', 'random', 'wikipedia', 'penguin', 'banana',
]

// Productive app IDs
const PRODUCTIVE_APPS = new Set(['notepad', 'files', 'terminal', 'google', 'todo'])
// Useless app IDs
const USELESS_APPS = new Set(['games', 'cemetery', 'ai'])

export function classifyApp(appId: string): ProductivityLevel {
  if (PRODUCTIVE_APPS.has(appId)) return 'PRODUCTIVE'
  if (USELESS_APPS.has(appId)) return 'USELESS'
  return 'NEUTRAL'
}

export function classifyText(text: string): ProductivityLevel {
  const lower = text.toLowerCase()
  if (PRODUCTIVE_KEYWORDS.some(k => lower.includes(k))) return 'PRODUCTIVE'
  if (USELESS_KEYWORDS.some(k => lower.includes(k))) return 'HIGHLY_USELESS'
  return 'NEUTRAL'
}

export function getThreatLevel(level: ProductivityLevel, consecutiveAttempts: number): ThreatLevel {
  if (consecutiveAttempts >= 5) return 'QUARANTINE'
  if (level === 'PRODUCTIVE') {
    if (consecutiveAttempts >= 3) return 'CRITICAL'
    if (consecutiveAttempts >= 2) return 'HIGH'
    return 'WARNING'
  }
  return 'LOW'
}

// ─── Achievements ─────────────────────────────────────────────────────────────

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_procrastination', title: 'First Procrastination', description: 'Successfully blocked your first productive action', emoji: '🏆', unlocked: false },
  { id: 'almost_productive', title: 'Almost Productive', description: 'Attempted to be productive 3 times', emoji: '😬', unlocked: false },
  { id: 'professional_procrastinator', title: 'Professional Procrastinator', description: 'Blocked 10 productive actions', emoji: '🎓', unlocked: false },
  { id: 'legendary', title: 'Legendary Sloth', description: 'Reached 90% uselessness score', emoji: '🦥', unlocked: false },
  { id: 'gamer', title: 'Certified Gamer', description: 'Played 5 games', emoji: '🎮', unlocked: false },
  { id: 'excuse_machine', title: 'Excuse Machine', description: 'Generated 5 excuses', emoji: '🤖', unlocked: false },
  { id: 'terminal_lord', title: 'Terminal Lord', description: 'Executed 10 terminal commands', emoji: '💻', unlocked: false },
  { id: 'final_boss', title: 'Final Boss', description: 'Triggered productivity quarantine', emoji: '☠️', unlocked: false },
]

// ─── Store ────────────────────────────────────────────────────────────────────

type ProductivityStore = {
  uselessnessScore: number
  productivityScore: number
  consecutiveProductivityAttempts: number
  firewallActive: boolean
  firewallThreatLevel: ThreatLevel
  firewallAppId: string | null
  firewallText: string | null
  quarantineActive: boolean
  analytics: AnalyticsData
  achievements: Achievement[]

  detectApp: (appId: string) => void
  detectText: (text: string, context?: string) => void
  dismissFirewall: () => void
  dismissQuarantine: () => void
  recordGame: () => void
  recordExcuse: () => void
  recordCommand: () => void
  unlockAchievement: (id: string) => void
  incrementIdle: () => void
  tickTime: (appType: ProductivityLevel, amount: number) => void
}

export const useProductivityStore = create<ProductivityStore>((set, get) => ({
  uselessnessScore: 50,
  productivityScore: 50,
  consecutiveProductivityAttempts: 0,
  firewallActive: false,
  firewallThreatLevel: 'LOW',
  firewallAppId: null,
  firewallText: null,
  quarantineActive: false,
  achievements: INITIAL_ACHIEVEMENTS,

  analytics: {
    gamesPlayed: 0,
    excusesGenerated: 0,
    productivityAttempts: 0,
    productivityBlocked: 0,
    notesCreated: 0,
    commandsExecuted: 0,
    idleTime: 0,
    timeInProductiveApps: 0,
    timeInUselessApps: 0,
    sessionStart: Date.now(),
    eventHistory: [],
  },

  detectApp: (appId) => {
    const level = classifyApp(appId)
    const state = get()

    if (level === 'PRODUCTIVE') {
      const consecutive = state.consecutiveProductivityAttempts + 1
      const threat = getThreatLevel(level, consecutive)

      if (threat === 'QUARANTINE') {
        set(s => ({
          quarantineActive: true,
          consecutiveProductivityAttempts: consecutive,
          analytics: { ...s.analytics, productivityAttempts: s.analytics.productivityAttempts + 1 },
        }))
        eventBus.emit('QUARANTINE_TRIGGERED', { appId })
        get().unlockAchievement('final_boss')
        return
      }

      set(s => ({
        firewallActive: true,
        firewallThreatLevel: threat,
        firewallAppId: appId,
        firewallText: null,
        consecutiveProductivityAttempts: consecutive,
        productivityScore: Math.min(100, s.productivityScore + 5),
        analytics: {
          ...s.analytics,
          productivityAttempts: s.analytics.productivityAttempts + 1,
          productivityBlocked: s.analytics.productivityBlocked + 1,
        },
      }))

      eventBus.emit('PRODUCTIVITY_DETECTED', { appId, threat })
      eventBus.emit('PRODUCTIVITY_BLOCKED', { appId })

      if (consecutive === 1) get().unlockAchievement('first_procrastination')
      if (consecutive >= 3) get().unlockAchievement('almost_productive')
      if (get().analytics.productivityBlocked >= 10) get().unlockAchievement('professional_procrastinator')
    } else {
      // Useless/Neutral — increase uselessness
      set(s => ({
        uselessnessScore: Math.min(100, s.uselessnessScore + (level === 'HIGHLY_USELESS' ? 5 : 2)),
        productivityScore: Math.max(0, s.productivityScore - 2),
        consecutiveProductivityAttempts: 0,
      }))
    }
  },

  detectText: (text, context = '') => {
    const level = classifyText(text + ' ' + context)
    if (level === 'PRODUCTIVE') {
      const state = get()
      const consecutive = state.consecutiveProductivityAttempts + 1
      const threat = getThreatLevel(level, consecutive)

      set(s => ({
        firewallActive: true,
        firewallThreatLevel: threat,
        firewallAppId: null,
        firewallText: text,
        consecutiveProductivityAttempts: consecutive,
        analytics: {
          ...s.analytics,
          productivityAttempts: s.analytics.productivityAttempts + 1,
          productivityBlocked: s.analytics.productivityBlocked + 1,
        },
      }))
      eventBus.emit('PRODUCTIVITY_DETECTED', { text, threat })
    }
  },

  dismissFirewall: () => {
    set({ firewallActive: false, firewallAppId: null, firewallText: null })
    // Boost uselessness for accepting fate
    set(s => ({ uselessnessScore: Math.min(100, s.uselessnessScore + 3) }))
  },

  dismissQuarantine: () => {
    set({ quarantineActive: false, consecutiveProductivityAttempts: 0 })
  },

  recordGame: () => {
    set(s => ({
      uselessnessScore: Math.min(100, s.uselessnessScore + 4),
      productivityScore: Math.max(0, s.productivityScore - 2),
      analytics: { ...s.analytics, gamesPlayed: s.analytics.gamesPlayed + 1 },
    }))
    if (get().analytics.gamesPlayed >= 5) get().unlockAchievement('gamer')
    if (get().uselessnessScore >= 90) get().unlockAchievement('legendary')
  },

  recordExcuse: () => {
    set(s => ({
      uselessnessScore: Math.min(100, s.uselessnessScore + 3),
      analytics: { ...s.analytics, excusesGenerated: s.analytics.excusesGenerated + 1 },
    }))
    if (get().analytics.excusesGenerated >= 5) get().unlockAchievement('excuse_machine')
    eventBus.emit('SCORE_RECORDED', { type: 'excuse' })
  },

  recordCommand: () => {
    set(s => ({
      analytics: { ...s.analytics, commandsExecuted: s.analytics.commandsExecuted + 1 },
    }))
    if (get().analytics.commandsExecuted >= 10) get().unlockAchievement('terminal_lord')
    eventBus.emit('COMMAND_EXECUTED', {})
  },

  incrementIdle: () => {
    set(s => ({
      uselessnessScore: Math.min(100, s.uselessnessScore + 0.1),
      analytics: { ...s.analytics, idleTime: s.analytics.idleTime + 1 },
    }))
  },

  tickTime: (appType, amount) => {
    set(s => {
      const analytics = { ...s.analytics }
      let uScore = s.uselessnessScore
      let pScore = s.productivityScore

      if (appType === 'PRODUCTIVE') {
        analytics.timeInProductiveApps += amount
        pScore = Math.min(100, pScore + (0.5 * amount))
      } else if (appType === 'USELESS' || appType === 'HIGHLY_USELESS') {
        analytics.timeInUselessApps += amount
        uScore = Math.min(100, uScore + (0.5 * amount))
      }
      return { analytics, uselessnessScore: uScore, productivityScore: pScore }
    })
  },

  unlockAchievement: (id) => {
    const { achievements } = get()
    const ach = achievements.find(a => a.id === id)
    if (!ach || ach.unlocked) return
    set(s => ({
      achievements: s.achievements.map(a =>
        a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      ),
    }))
    eventBus.emit('ACHIEVEMENT_UNLOCKED', { id, title: ach.title })
  },
}))
