import { ref, onMounted, onUnmounted } from 'vue'

export function useGeolocation(options: PositionOptions = {}) {
  const coords = ref<GeolocationCoordinates | undefined>(undefined)
  const error = ref<GeolocationPositionError | undefined>(undefined)
  let watcher: number | undefined = undefined

  onMounted(() => {
    if ('geolocation' in navigator) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => (coords.value = pos.coords),
        (err) => (error.value = err),
        options
      )
    }
  })

  onUnmounted(() => {
    if (watcher !== undefined) navigator.geolocation.clearWatch(watcher)
  })

  return { coords, error }
}
