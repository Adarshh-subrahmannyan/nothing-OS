import type { SystemEvent, SystemEventType } from '@/types'

type Listener = (event: SystemEvent) => void

class EventBus {
  private listeners: Map<SystemEventType | '*', Set<Listener>> = new Map()

  on(type: SystemEventType | '*', listener: Listener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
    return () => this.off(type, listener)
  }

  off(type: SystemEventType | '*', listener: Listener): void {
    this.listeners.get(type)?.delete(listener)
  }

  emit(type: SystemEventType, payload?: Record<string, unknown>): void {
    const event: SystemEvent = { type, timestamp: Date.now(), payload }

    // Notify type-specific listeners
    this.listeners.get(type)?.forEach(l => l(event))
    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(l => l(event))
  }
}

// Singleton event bus
export const eventBus = new EventBus()
