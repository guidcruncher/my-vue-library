import { ref, computed, type Ref } from 'vue'

export interface UseStackReturn<T> {
  items: Ref<T[]>
  size: Ref<number>
  isEmpty: Ref<boolean>
  top: Ref<T | undefined>
  push: (item: T) => void
  pop: () => T | undefined
  peek: () => T | undefined
  clear: () => void
}

/**
 * useStack
 * A reactive Last-In-First-Out (LIFO) data structure utility.
 */
export function useStack<T>(initialItems: T[] = []): UseStackReturn<T> {
  // We represent the stack as an array where the end of the array is the "top"
  const items = ref<T[]>([...initialItems]) as Ref<T[]>

  const size = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  // The 'top' is the last element in the array
  const top = computed(() => items.value[items.value.length - 1])

  const push = (item: T) => {
    items.value.push(item)
  }

  const pop = (): T | undefined => {
    return items.value.pop()
  }

  const peek = (): T | undefined => {
    return items.value[items.value.length - 1]
  }

  const clear = () => {
    items.value = []
  }

  return {
    items,
    size,
    isEmpty,
    top,
    push,
    pop,
    peek,
    clear,
  }
}
