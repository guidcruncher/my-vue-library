import { ref, onUnmounted } from 'vue'

export function usePolling(callback: () => Promise<any>, interval: number = 5000) {
  const isActive = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined = undefined

  const poll = async () => {
    if (!isActive.value) return
    await callback()
    timer = setTimeout(poll, interval)
  }

  const start = () => {
    if (isActive.value) return
    isActive.value = true
    poll()
  }

  const stop = () => {
    isActive.value = false
    if (timer) clearTimeout(timer)
  }

  onUnmounted(() => stop())

  return { isActive, start, stop }
}
