import { shallowRef, computed } from 'vue'

interface ListNode<T> {
  value: T
  next: ListNode<T> | undefined
}

export function useLinkedList<T>() {
  const head = shallowRef<ListNode<T> | undefined>(undefined)
  const size = shallowRef(0)

  const isEmpty = computed(() => size.value === 0)

  // Add to the end
  const append = (value: T) => {
    const newNode: ListNode<T> = { value, next: undefined }
    if (!head.value) {
      head.value = newNode
    } else {
      let current = head.value
      while (current.next) {
        current = current.next
      }
      current.next = newNode
    }
    size.value++
  }

  // Convert to array for Vue v-for rendering
  const toArray = computed(() => {
    const result: T[] = []
    let current = head.value
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  })

  return { head, size, isEmpty, append, toArray }
}
