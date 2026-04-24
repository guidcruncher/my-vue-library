import { ref, onMounted, onUnmounted } from 'vue';

export function useGeolocation(options: PositionOptions = {}) {
  const coords = ref<GeolocationCoordinates | null>(null);
  const error = ref<GeolocationPositionError | null>(null);
  let watcher: number | null = null;

  onMounted(() => {
    if ('geolocation' in navigator) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => (coords.value = pos.coords),
        (err) => (error.value = err),
        options
      );
    }
  });

  onUnmounted(() => {
    if (watcher !== null) navigator.geolocation.clearWatch(watcher);
  });

  return { coords, error };
}
