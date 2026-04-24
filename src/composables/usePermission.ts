import { ref, onMounted } from 'vue'

export function usePermission(name: PermissionName) {
  const state = ref<PermissionState | 'unknown'>('unknown')

  onMounted(async () => {
    try {
      const status = await navigator.permissions.query({ name })
      state.value = status.state

      status.onchange = () => {
        state.value = status.state
      }
    } catch (e) {
      state.value = 'denied'
    }
  })

  return state
}
