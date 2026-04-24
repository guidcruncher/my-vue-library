import { onUnmounted } from 'vue'

export type EventMap = {
  'user:logged-in': { id: string; name: string }
  'system:alert': { message: string; severity: 'low' | 'high' }
  'config:get': { key: string } // Example for request/response
}

class EventEmitter<T extends EventMap> {
  private static instance: EventEmitter<any>
  private listeners = new Map<keyof T, Set<(payload: any) => void>>()

  private constructor() {}

  public static getInstance<T extends EventMap>(): EventEmitter<T> {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter<T>()
    }
    return EventEmitter.instance
  }

  /**
   * Sub (Subscribe)
   */
  on<K extends keyof T>(event: K, callback: (payload: T[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off<K extends keyof T>(event: K, callback: (payload: T[K]) => void) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  /**
   * Pub (Publish)
   */
  publish<K extends keyof T>(event: K, payload: T[K]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(payload))
    }
  }

  // Alias for publish to maintain compatibility
  emit<K extends keyof T>(event: K, payload: T[K]) {
    this.publish(event, payload)
  }
}

const globalEmitter = EventEmitter.getInstance<EventMap>()

/**
 * useEventBus Composable
 */
export function useEventBus() {
  const subscribe = <K extends keyof EventMap>(
    event: K,
    callback: (payload: EventMap[K]) => void
  ) => {
    globalEmitter.on(event, callback)
    onUnmounted(() => globalEmitter.off(event, callback))
  }

  return {
    sub: subscribe, // Semantic alias for 'on'
    pub: globalEmitter.publish.bind(globalEmitter), // Semantic alias for 'emit'
    on: subscribe,
    emit: globalEmitter.publish.bind(globalEmitter),
    off: globalEmitter.off.bind(globalEmitter),
  }
}
