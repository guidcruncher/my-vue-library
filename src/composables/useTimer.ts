import { ref, onUnmounted } from 'vue'

export interface UseTimerOptions {
  intervalMs?: number
  autostart?: boolean
  onTick?: (elapsedMs: number) => void
}

export interface UseTimer {
  time: Readonly<number>
  isRunning: Readonly<boolean>
  start: () => void
  stop: () => void
  reset: () => void
}

export function useTimer(options: UseTimerOptions = {}): UseTimer {
  const intervalMs = options.intervalMs ?? 1000
  const time = ref(0)
  const isRunning = ref(false)

  let handle: number | null = null

  const tick = () => {
    time.value += intervalMs
    options.onTick?.(time.value)
  }

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    handle = window.setInterval(tick, intervalMs)
  }

  const stop = () => {
    if (!isRunning.value) return
    isRunning.value = false
    if (handle !== null) {
      clearInterval(handle)
      handle = null
    }
  }

  const reset = () => {
    time.value = 0
  }

  onUnmounted(stop)

  if (options.autostart) start()

  return {
    time: time.value,
    isRunning: isRunning.value,
    start,
    stop,
    reset,
  }
}
