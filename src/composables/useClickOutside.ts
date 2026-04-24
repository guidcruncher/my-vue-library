import { onMounted, onUnmounted, type Ref } from 'vue'

export function useClickOutside(elRef: Ref<HTMLElement | null>, callback: () => void) {
  const listener = (event: MouseEvent | TouchEvent) => {
    if (!elRef.value || elRef.value.contains(event.target as Node)) {
      return
    }
    callback()
  }

  onMounted(() => {
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', listener)
    document.removeEventListener('touchstart', listener)
  })
}
