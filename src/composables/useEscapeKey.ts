import { onMounted, onUnmounted } from 'vue'

import { type KeyHandler } from './useKeyboard'

export function useEscapeKey(handler: KeyHandler, isActive = true) {
  const handleKeydown = (event: any) => {
    if (isActive && event.key === 'Escape') {
      event.preventDefault()
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    console.log('Escape key listener attached.')
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    console.log('Escape key listener cleaned up.')
  })
}
