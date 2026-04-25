import { onMounted, onUnmounted } from 'vue'

export type KeyHandler = () => void | Promise<void>

export function useKeyboard(handler: KeyHandler, key: any, isActive = true) {
  const handleKeydown = (event: any) => {
    if (isActive && event.key === key) {
      event.preventDefault()
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    console.log('Key listener attached.')
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    console.log('Key listener cleaned up.')
  })
}
