export function useVibrate() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  /**
   * @param pattern - Duration in ms, or an array of [vibrate, pause, vibrate]
   */
  const vibrate = (pattern: number | number[] = 200) => {
    if (isSupported) {
      navigator.vibrate(pattern)
    }
  }

  const stop = () => {
    if (isSupported) navigator.vibrate(0)
  }

  return { isSupported, vibrate, stop }
}
