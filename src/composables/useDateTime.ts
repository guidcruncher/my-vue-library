import { ref, computed, watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * @param source - A Date object, ISO string, Ref, or Getter function.
 * If undefined/undefined, it becomes a live clock.
 * @param timezone - IANA Timezone string (e.g., 'America/New_York')
 */
export function useDateTime(
  source?: MaybeRefOrGetter<Date | string | undefined | undefined>,
  timezone?: MaybeRefOrGetter<string>
) {
  // Resolve initial values using toValue (handles refs and getters)
  const now = ref(new Date(toValue(source) || Date.now()))

  const currentZone = computed(
    () => toValue(timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  let timer: ReturnType<typeof setInterval> | undefined = undefined

  // 1. Logic for the Live Ticking Clock
  const startClock = () => {
    if (!timer) {
      timer = setInterval(() => {
        now.value = new Date()
      }, 1000)
    }
  }

  const stopClock = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  // 2. Watch the source: If source exists, sync 'now'; if source is undefined, tick.
  watch(
    () => toValue(source),
    (newVal) => {
      if (newVal) {
        stopClock()
        now.value = new Date(newVal)
      } else {
        startClock()
      }
    },
    { immediate: true }
  )

  // 3. Formatters
  const formatted = computed(() => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: currentZone.value,
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(now.value)
  })

  const iso = computed(() => {
    // Custom ISO string for the specific timezone
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: currentZone.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .format(now.value)
      .replace(' ', 'T')
  })

  onUnmounted(stopClock)

  return {
    now,
    formatted,
    iso,
    zone: currentZone,
  }
}
