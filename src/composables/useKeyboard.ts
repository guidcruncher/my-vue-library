import { onMounted, onUnmounted } from 'vue'

export function useEscapeKey(handler, key, isActive = true) {
  const handleKeydown = (event) => {
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
