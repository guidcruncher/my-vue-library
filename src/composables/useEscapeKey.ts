import { onMounted, onUnmounted } from 'vue'

export function useEscapeKey(handler, isActive = true) {
  const handleKeydown = (event) => {
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
