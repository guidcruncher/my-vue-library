import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { ComputedRef } from 'vue'

export interface UseAudio {
  playing: ComputedRef<boolean>
  currentTime: ComputedRef<number>
  duration: ComputedRef<number>
  canPlay: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  play: () => Promise<void>
  pause: () => void
  toggle: () => Promise<void>
  setTime: (time: number) => void
  setVolume: (volume: number) => void
}

export function useAudio(src: string): UseAudio {
  const audio = ref<HTMLAudioElement | null>(null)

  const _playing = ref(false)
  const _currentTime = ref(0)
  const _duration = ref(0)
  const _canPlay = ref(false)
  const _error = ref<Error | null>(null)

  const playing = computed(() => _playing.value)
  const currentTime = computed(() => _currentTime.value)
  const duration = computed(() => _duration.value)
  const canPlay = computed(() => _canPlay.value)
  const error = computed(() => _error.value)

  const play = async () => {
    if (!audio.value) return
    try {
      await audio.value.play()
      _playing.value = true
    } catch (err) {
      _error.value = err as Error
    }
  }

  const pause = () => {
    if (!audio.value) return
    audio.value.pause()
    _playing.value = false
  }

  const toggle = async () => {
    if (_playing.value) pause()
    else await play()
  }

  const setTime = (time: number) => {
    if (!audio.value) return
    audio.value.currentTime = time
  }

  const setVolume = (volume: number) => {
    if (!audio.value) return
    audio.value.volume = volume
  }

  const bindEvents = () => {
    if (!audio.value) return

    audio.value.addEventListener('timeupdate', () => {
      _currentTime.value = audio.value!.currentTime
    })

    audio.value.addEventListener('loadedmetadata', () => {
      _duration.value = audio.value!.duration
      _canPlay.value = true
    })

    audio.value.addEventListener('play', () => {
      _playing.value = true
    })

    audio.value.addEventListener('pause', () => {
      _playing.value = false
    })

    audio.value.addEventListener('error', () => {
      _error.value = new Error('Audio playback error')
    })
  }

  onMounted(() => {
    audio.value = new Audio(src)
    audio.value.preload = 'auto'
    bindEvents()
  })

  onBeforeUnmount(() => {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value.load()
    }
  })

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
