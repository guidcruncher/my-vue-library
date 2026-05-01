import { ref, watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * A comprehensive list of permission names supported by modern browsers.
 * This includes standard, experimental, and hardware-specific permissions.
 */
export type ExtendedPermissionName =
  | PermissionName
  | 'geolocation'
  | 'notifications'
  | 'push'
  | 'midi'
  | 'camera'
  | 'microphone'
  | 'speaker-selection'
  | 'device-info'
  | 'background-fetch'
  | 'background-sync'
  | 'bluetooth'
  | 'persistent-storage'
  | 'ambient-light-sensor'
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'screen-wake-lock'
  | 'nfc'
  | 'display-capture'
  | 'idle-detection'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'payment-handler'
  | 'window-management'

export function usePermission(name: MaybeRefOrGetter<ExtendedPermissionName>) {
  const state = ref<PermissionState | 'unknown' | 'unsupported'>('unknown')
  let statusObj: PermissionStatus | undefined = undefined

  const cleanup = () => {
    if (statusObj) {
      statusObj.onchange = null // ← FIXED: must be null, not undefined
      statusObj = undefined
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
      const status = await navigator.permissions.query({
        name: permissionName as PermissionName,
      })

      statusObj = status
      state.value = status.state

      status.onchange = () => {
        state.value = status.state
      }
    } catch {
      state.value = 'denied'
    }
  }

  watch(() => toValue(name), queryPermission, { immediate: true })
  onUnmounted(cleanup)

  return state
}
