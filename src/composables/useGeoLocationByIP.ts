import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface GeoLocation {
  ip: string
  city: string
  region: string
  country: string
  continent: string
  latitude: number
  longitude: number
  postalCode?: string
  timezone: string
}

export function useGeoLocationByIP() {
  const location = ref<GeoLocation | undefined>(undefined)
  const loading = ref(false)
  const error = ref<string | undefined>(undefined)
  const isOnline = ref(navigator.onLine)

  let lastIp: string | undefined = undefined

  async function fetchLocation() {
    try {
      loading.value = true
      error.value = undefined

      const res = await fetch('https://geo.kamero.ai/api/geo', {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      // Only update if IP changed
      if (data.ip !== lastIp) {
        lastIp = data.ip
        location.value = data
      }
    } catch (err: any) {
      error.value = err.message ?? 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function handleOnline() {
    isOnline.value = true
    fetchLocation()
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial fetch
    fetchLocation()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    location,
    loading,
    error,
    isOnline,
    refresh: fetchLocation,
  }
}
