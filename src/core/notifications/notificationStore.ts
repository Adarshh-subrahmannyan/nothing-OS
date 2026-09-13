import { create } from 'zustand'
import type { Notification, NotificationPriority } from '@/types'
import { eventBus } from '@/core/events/eventBus'

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type NotificationStore = {
  notifications: Notification[]
  unreadCount: number

  notify: (params: {
    title: string
    message: string
    priority?: NotificationPriority
    icon?: string
    autoDismiss?: boolean
    dismissAfter?: number
  }) => string
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
  // Listen to global events to auto-generate notifications
  if (typeof window !== 'undefined') {
    eventBus.on('PRODUCTIVITY_BLOCKED', (event) => {
      const appId = event.payload?.appId as string | undefined
      get().notify({
        title: '🚨 Productivity Firewall',
        message: appId
          ? `Productive activity detected. "${appId}" has been blocked.`
          : 'Productive text detected. That thought has been neutralized.',
        priority: 'critical',
        autoDismiss: true,
        dismissAfter: 6000,
      })
    })

    eventBus.on('ACHIEVEMENT_UNLOCKED', (event) => {
      get().notify({
        title: '🏆 Achievement Unlocked',
        message: event.payload?.title as string ?? 'New achievement!',
        priority: 'high',
        autoDismiss: true,
        dismissAfter: 5000,
      })
    })

    eventBus.on('GAME_FINISHED', (event) => {
      get().notify({
        title: '🎮 Game Over',
        message: `Score: ${event.payload?.score ?? 0}. Time well wasted.`,
        priority: 'normal',
        autoDismiss: true,
        dismissAfter: 4000,
      })
    })

    eventBus.on('QUARANTINE_TRIGGERED', () => {
      get().notify({
        title: '⚠️ PRODUCTIVITY QUARANTINE',
        message: 'Too many productive attempts detected. System locked.',
        priority: 'critical',
        autoDismiss: false,
      })
    })
  }

  return {
    notifications: [],
    unreadCount: 0,

    notify: ({ title, message, priority = 'normal', icon, autoDismiss = true, dismissAfter = 5000 }) => {
      const id = generateId()
      const notification: Notification = {
        id, title, message, priority, icon,
        timestamp: Date.now(),
        read: false,
        autoDismiss,
        dismissAfter,
      }

      set(state => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      }))

      eventBus.emit('NOTIFICATION_CREATED', { id, title, priority })

      if (autoDismiss && dismissAfter) {
        setTimeout(() => get().markRead(id), dismissAfter)
      }

      return id
    },

    markRead: (id) => {
      set(state => {
        const notif = state.notifications.find(n => n.id === id)
        if (!notif || notif.read) return state
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }
      })
    },

    markAllRead: () => {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    },

    dismiss: (id) => {
      // Dismissing a toast just marks it as read so it goes away from screen
      get().markRead(id)
    },

    removeNotification: (id: string) => {
      set(state => {
        const notif = state.notifications.find(n => n.id === id)
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: notif && !notif.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }
      })
    },

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
  }
})
