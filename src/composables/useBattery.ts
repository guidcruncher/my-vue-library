import { ref, onMounted } from 'vue'

export function useBattery() {
  const supported = ref('getBattery' in navigator)
  const loading = ref(true)
  const level = ref(0)
  const charging = ref(false)
  const chargingTime = ref(0)
  const dischargingTime = ref(0)

  const updateStatus = (battery: any) => {
    level.value = battery.level
    charging.value = battery.charging
    chargingTime.value = battery.chargingTime
    dischargingTime.value = battery.dischargingTime
    loading.value = false
  }

  onMounted(async () => {
    if (supported.value) {
      const battery = await (navigator as any).getBattery()
      updateStatus(battery)

      // Listen for changes
      battery.addEventListener('chargingchange', () => updateStatus(battery))
      battery.addEventListener('levelchange', () => updateStatus(battery))
    }
  })

  return { supported, loading, level, charging, chargingTime, dischargingTime }
}
