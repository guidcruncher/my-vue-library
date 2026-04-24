import { ref, computed, type Ref } from 'vue'

interface PriorityItem<T> {
  value: T
  priority: number // Lower number = higher priority
}

export function usePriorityQueue<T>() {
  const items = ref<PriorityItem<T>[]>([])

  const isEmpty = computed(() => items.value.length === 0)

  const enqueue = (value: T, priority: number) => {
    const newItem = { value, priority }

    // Find the correct insertion point (Simple Linear Insertion)
    const index = items.value.findIndex((item) => newItem.priority < item.priority)

    if (index === -1) {
      items.value.push(newItem)
    } else {
      items.value.splice(index, 0, newItem)
    }
  }

  const dequeue = (): T | undefined => {
    return items.value.shift()?.value
  }

  const peek = (): T | undefined => {
    return items.value[0]?.value
  }

  return { items, isEmpty, enqueue, dequeue, peek }
}
