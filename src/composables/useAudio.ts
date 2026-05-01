// useAudio.ts
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export interface UseAudioOptions {
  autoplay?: boolean
  loop?: boolean
  volume?: number // 0–1
}

export interface UseAudio {
  playing: Readonly<ReturnType<typeof computed<boolean>>>
  currentTime: Readonly<ReturnType<typeof computed<number>>>
  duration: Readonly<ReturnType<typeof computed<number>>>
  canPlay: Readonly<ReturnType<typeof computed<boolean>>>
  error: Readonly<ReturnType<typeof computed<Error | null>>>
  play: () => Promise<void>
  pause: () => void
  toggle: () => Promise<void>
  setTime: (time: number) => void
  setVolume: (volume: number) => void
}

export function useAudio(src: string | null, options: UseAudioOptions = {}): UseAudio {
  const audio = ref<HTMLAudioElement | null>(null)

  const isPlaying = ref(false)
  const currentTimeRef = ref(0)
  const durationRef = ref(0)
  const canPlayRef = ref(false)
  const errorRef = ref<Error | null>(null)

  const playing = computed(() => isPlaying.value)
  const currentTime = computed(() => currentTimeRef.value)
  const duration = computed(() => durationRef.value)
  const canPlay = computed(() => canPlayRef.value)
  const error = computed(() => errorRef.value)

  const setupAudio = () => {
    if (typeof window === 'undefined') return
    if (!src) return

    const el = new Audio(src)
    el.loop = !!options.loop
    if (typeof options.volume === 'number') {
      el.volume = Math.min(1, Math.max(0, options.volume))
    }

    el.addEventListener('timeupdate', () => {
      currentTimeRef.value = el.currentTime
    })

    el.addEventListener('loadedmetadata', () => {
      durationRef.value = el.duration || 0
    })

    el.addEventListener('canplay', () => {
      canPlayRef.value = true
    })

    el.addEventListener('play', () => {
      isPlaying.value = true
    })

    el.addEventListener('pause', () => {
      isPlaying.value = false
    })

    el.addEventListener('error', () => {
      errorRef.value = new Error('Audio playback error')
    })

    audio.value = el

    if (options.autoplay) {
      void el.play().catch((err) => {
        errorRef.value = err instanceof Error ? err : new Error(String(err))
      })
    }
  }

  const cleanupAudio = () => {
    const el = audio.value
    if (!el) return

    el.pause()
    el.src = ''
    audio.value = null
    isPlaying.value = false
    canPlayRef.value = false
  }

  const play = async () => {
    const el = audio.value
    if (!el) return
    try {
      await el.play()
    } catch (err) {
      errorRef.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  const pause = () => {
    const el = audio.value
    if (!el) return
    el.pause()
  }

  const toggle = async () => {
    if (isPlaying.value) {
      pause()
    } else {
      await play()
    }
  }

  const setTime = (time: number) => {
    const el = audio.value
    if (!el) return
    el.currentTime = Math.max(0, Math.min(time, el.duration || time))
  }

  const setVolume = (volume: number) => {
    const el = audio.value
    if (!el) return
    el.volume = Math.min(1, Math.max(0, volume))
  }

  onMounted(() => {
    setupAudio()
  })

  onBeforeUnmount(() => {
    cleanupAudio()
  })

  // React to src changes
  watch(
    () => src,
    (newSrc) => {
      cleanupAudio()
      if (newSrc) {
        setupAudio()
      }
    }
  )

  return {
    playing,
    currentTime,
    duration,
    canPlay,
    error,
    play,
    pause,
    toggle,
    setTime,
    setVolume,
  }
}
