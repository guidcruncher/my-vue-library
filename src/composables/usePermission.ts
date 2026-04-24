import { ref, watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * A comprehensive list of permission names supported by modern browsers.
 * This includes standard, experimental, and hardware-specific permissions.
 */
export type ExtendedPermissionName =
  | PermissionName
  | 'geolocation' // Access to GPS/Location
  | 'notifications' // Ability to show system notifications
  | 'push' // Push API access
  | 'midi' // MIDI device access
  | 'camera' // Camera access
  | 'microphone' // Microphone access
  | 'speaker-selection' // Ability to change output speakers
  | 'device-info' // Access to media device metadata
  | 'background-fetch' // Background download/upload support
  | 'background-sync' // Background data syncing
  | 'bluetooth' // Web Bluetooth API
  | 'persistent-storage' // Permission to use persistent storage
  | 'ambient-light-sensor' // Light level sensors
  | 'accelerometer' // Motion sensor
  | 'gyroscope' // Rotation sensor
  | 'magnetometer' // Compass/Magnetic sensor
  | 'screen-wake-lock' // Ability to keep screen from dimming
  | 'nfc' // Near Field Communication
  | 'display-capture' // Screen sharing/Recording
  | 'idle-detection' // Detecting when user is away
  | 'clipboard-read' // Reading from system clipboard
  | 'clipboard-write' // Writing to system clipboard
  | 'payment-handler' // Payment Request API handling
  | 'window-management' // Managing multiple windows/screens

export function usePermission(name: MaybeRefOrGetter<ExtendedPermissionName>) {
  const state = ref<PermissionState | 'unknown' | 'unsupported'>('unknown')
  let statusObj: PermissionStatus | null = null

  const cleanup = () => {
    if (statusObj) {
      statusObj.onchange = null
      statusObj = null
    }
  }

  const queryPermission = async () => {
    cleanup()
    const permissionName = toValue(name)

    if (!navigator?.permissions?.query) {
      state.value = 'unsupported'
      return
    }

    try {
      // Cast to PermissionName to satisfy the browser's native typing
      const status = await navigator.permissions.query({
        name: permissionName as PermissionName,
      })

      statusObj = status
      state.value = status.state

      // Listen for manual toggles in browser settings
      status.onchange = () => {
        state.value = status.state
      }
    } catch (e) {
      state.value = 'denied'
    }
  }

  // Re-run the query if the input name changes (if using a ref/getter)
  watch(() => toValue(name), queryPermission, { immediate: true })

  onUnmounted(cleanup)

  return state
}
