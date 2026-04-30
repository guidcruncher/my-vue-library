import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export type InfiniteScrollCallback = () => Promise<void> | void

export interface UseInfiniteScrollOptions {
  distance?: number
  disabled?: boolean
  root?: HTMLElement | undefined
}

/**
 * useInfiniteScroll
 * A visibility-based trigger for infinite loading patterns.
 */
export function useInfiniteScroll(
  target: Ref<HTMLElement | undefined>,
  callback: InfiniteScrollCallback,
  options: UseInfiniteScrollOptions = {}
) {
  const isFetching = ref(false)
  const isFinished = ref(false) // Internal tracker to stop observing if no more data

  // We use a internal ref for disabled to allow the reset function
  // to override the initial disabled state.
  const internalDisabled = ref(options.disabled ?? false)

  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (
        entry.isIntersecting &&
        !isFetching.value &&
        !internalDisabled.value &&
        !isFinished.value
      ) {
        isFetching.value = true

        try {
          await callback()
        } finally {
          isFetching.value = false
        }
      }
    },
    {
      root: options.root ?? undefined,
      rootMargin: `0px 0px ${options.distance ?? 10}px 0px`,
      threshold: 0.1,
    }
  )

  /**
   * Reset Function
   * Clears the 'finished' state and restarts the observer logic.
   * Useful when changing search filters or sorting.
   */
  const reset = async () => {
    isFinished.value = false
    isFetching.value = false

    // Stop and restart observing to trigger an immediate check
    // if the sentinel is already in view after a reset.
    if (target.value) {
      observer.unobserve(target.value)
      await nextTick()
      observer.observe(target.value)
    }
  }

  /**
   * Finish Function
   * Manually stop the observer when the backend reports no more data.
   */
  const setFinished = (state: boolean = true) => {
    isFinished.value = state
  }

  onMounted(() => {
    if (target.value) observer.observe(target.value)
  })

  onUnmounted(() => {
    observer.disconnect()
  })

  return {
    isFetching,
    isFinished,
    reset,
    setFinished,
  }
}
