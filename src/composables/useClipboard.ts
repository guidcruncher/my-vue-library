import { ref } from 'vue'

export function useClipboard() {
  const text = ref('')
  const copied = ref(false)
  const isSupported = Boolean(navigator && navigator.clipboard)

  const copy = async (content: string) => {
    if (!isSupported) return
    await navigator.clipboard.writeText(content)
    text.value = content
    copied.value = true

    // Auto-reset "copied" status after 2 seconds
    setTimeout(() => (copied.value = false), 2000)
  }

  return { text, copied, isSupported, copy }
}
