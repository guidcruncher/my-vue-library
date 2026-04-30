import { ref } from 'vue'

export interface NotificationOptions extends Partial<Notification> {
  title: string
  body?: string
  icon?: string
  tag?: string
  silent?: boolean
}

export function useNotification() {
  const isSupported = ref('Notification' in window)
  const permission = ref<NotificationPermission>(
    isSupported.value ? Notification.permission : 'denied'
  )

  /**
   * Request manual permission from the user
   */
  const requestPermission = async () => {
    if (!isSupported.value) return 'denied'

    const result = await Notification.requestPermission()
    permission.value = result
    return result
  }

  /**
   * Display a notification
   * @param options - Notification title and body/icon options
   */
  const showNotification = (options: NotificationOptions) => {
    if (!isSupported.value || permission.value !== 'granted') {
      console.warn('Notifications are not supported or permission was denied.')
      return undefined
    }

    const { title, ...rest } = options
    const notification = new Notification(title, rest)

    // Optional: Auto-close after 5 seconds
    notification.onshow = () => {
      setTimeout(() => notification.close(), 5000)
    }

    return notification
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  }
}
