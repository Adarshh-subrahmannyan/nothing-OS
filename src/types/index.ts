// ─── Window System ────────────────────────────────────────────────────────────

export type WindowState = {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
}

// ─── Application Registry ─────────────────────────────────────────────────────

export type Permission =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'filesystem.delete'
  | 'games.read'
  | 'games.write'
  | 'settings.read'
  | 'settings.write'

export type AppDefinition = {
  id: string
  name: string
  icon: string
  permissions: Permission[]
  defaultWidth: number
  defaultHeight: number
  minWidth?: number
  minHeight?: number
}

// ─── Virtual Filesystem ───────────────────────────────────────────────────────

export type FileNode = {
  id: string
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: string[]
  parentId?: string | null
  createdAt: number
  updatedAt: number
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type SystemEventType =
  | 'APP_OPENED'
  | 'APP_CLOSED'
  | 'WINDOW_FOCUSED'
  | 'WINDOW_MINIMIZED'
  | 'FILE_CREATED'
  | 'FILE_DELETED'
  | 'FILE_OPENED'
  | 'NOTE_EDITED'
  | 'NOTE_SAVED'
  | 'COMMAND_EXECUTED'
  | 'GAME_STARTED'
  | 'GAME_FINISHED'
  | 'SCORE_RECORDED'
  | 'TASK_CREATED'
  | 'PRODUCTIVITY_DETECTED'
  | 'PRODUCTIVITY_BLOCKED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'NOTIFICATION_CREATED'
  | 'QUARANTINE_TRIGGERED'

export type SystemEvent = {
  type: SystemEventType
  timestamp: number
  payload?: Record<string, unknown>
}

// ─── Productivity ─────────────────────────────────────────────────────────────

export type ProductivityLevel = 'PRODUCTIVE' | 'NEUTRAL' | 'USELESS' | 'HIGHLY_USELESS'
export type ThreatLevel = 'LOW' | 'WARNING' | 'HIGH' | 'CRITICAL' | 'QUARANTINE'

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export type Notification = {
  id: string
  title: string
  message: string
  priority: NotificationPriority
  icon?: string
  timestamp: number
  read: boolean
  autoDismiss?: boolean
  dismissAfter?: number
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export type Achievement = {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt?: number
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsData = {
  gamesPlayed: number
  excusesGenerated: number
  productivityAttempts: number
  productivityBlocked: number
  notesCreated: number
  commandsExecuted: number
  idleTime: number
  timeInProductiveApps: number
  timeInUselessApps: number
  sessionStart: number
  eventHistory: SystemEvent[]
}

// ─── Process ──────────────────────────────────────────────────────────────────

export type ProcessEntry = {
  pid: number
  name: string
  appId: string
  cpu: number
  memory: number
  motivation: number
  startTime: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type Settings = {
  username: string
  theme: 'dark' | 'darker'
  wallpaper: string
  animationIntensity: 'none' | 'reduced' | 'full'
  soundEnabled: boolean
  notificationsEnabled: boolean
  firewallEnabled: boolean
  firewallSensitivity: 'low' | 'medium' | 'high'
  githubUsername: string
  demoMode: boolean
}
