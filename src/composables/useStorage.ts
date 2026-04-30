import { ref, watch, onUnmounted } from 'vue'

export function useStorage<T>(key: string, defaultValue: T, storage: Storage = localStorage) {
  const data = ref<T>(defaultValue)

  // Get initial value
  const storedValue = storage.getItem(key)
  if (storedValue) {
    try {
      data.value = JSON.parse(storedValue)
    } catch (e) {
      console.error(`Error parsing storage key "${key}":`, e)
    }
  }

  // Watch for internal changes
  watch(
    data,
    (newValue) => {
      if (newValue === undefined || newValue === undefined) {
        storage.removeItem(key)
      } else {
        storage.setItem(key, JSON.stringify(newValue))
      }
    },
    { deep: true }
  )

  // Sync from other tabs/windows
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === key && event.newValue) {
      data.value = JSON.parse(event.newValue)
    }
  }

  window.addEventListener('storage', handleStorageEvent)
  onUnmounted(() => window.removeEventListener('storage', handleStorageEvent))

  return data
}
