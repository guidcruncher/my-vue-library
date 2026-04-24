import { ref, computed, type Ref } from 'vue'

// Added constraint: T must be an object
export function useSort<T extends Record<string, any>>(
  data: Ref<T[]>,
  initialKey: keyof T,
  initialOrder: 'asc' | 'desc' = 'asc'
) {
  const sortKey = ref(initialKey) as Ref<keyof T>
  const sortOrder = ref(initialOrder)

  const sortedData = computed(() => {
    return [...data.value].sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]

      if (aVal === bVal) return 0

      const modifier = sortOrder.value === 'asc' ? 1 : -1
      return aVal > bVal ? modifier : -modifier
    })
  })

  const toggleSort = (key: keyof T) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  return { sortedData, sortKey, sortOrder, toggleSort }
}
