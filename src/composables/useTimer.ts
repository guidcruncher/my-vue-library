import { ref, computed, onUnmounted } from 'vue'

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
  formatted: Readonly<string>
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

  const formatted = computed(() => {
    const total = Math.floor(time.value / 1000)
    const h = String(Math.floor(total / 3600)).padStart(2, '0')
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
    const s = String(total % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  })

  onUnmounted(stop)

  if (options.autostart) start()

  return {
    time: time.value,
    isRunning: isRunning.value,
    start,
    stop,
    reset,
    formatted,
  }
}
