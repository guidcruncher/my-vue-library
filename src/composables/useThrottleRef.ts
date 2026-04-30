import { ref, watch, type Ref } from 'vue'

export function useThrottleRef<T>(value: Ref<T>, limit: number = 300): Ref<T> {
  const throttledValue = ref(value.value) as Ref<T>
  let lastRan = 0
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined

  watch(value, (newValue) => {
    const now = Date.now()

    if (now - lastRan >= limit) {
      throttledValue.value = newValue
      lastRan = now
    } else {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(
        () => {
          throttledValue.value = newValue
          lastRan = Date.now()
        },
        limit - (now - lastRan)
      )
    }
  })

  return throttledValue
}
