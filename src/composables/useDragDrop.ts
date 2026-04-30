import { ref } from 'vue'

export function useDragDrop() {
  const isDragging = ref(false)
  const isOver = ref(false)
  const dragData = ref<any>(undefined)

  /**
   * Bind to the element you want to drag
   */
  const draggableProps = (data: any) => ({
    draggable: true,
    onDragstart: (event: DragEvent) => {
      isDragging.value = true
      dragData.value = data

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        // Required for Firefox compatibility
        event.dataTransfer.setData('text/plain', JSON.stringify(data))
      }
    },
    onDragend: () => {
      isDragging.value = false
      dragData.value = undefined
    },
  })

  /**
   * Bind to the zone where items can be dropped
   */
  const droppableProps = (onDrop: (data: any) => void) => ({
    onDragover: (event: DragEvent) => {
      event.preventDefault() // Required to allow a drop
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
      isOver.value = true
    },
    onDragleave: () => {
      isOver.value = false
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      isOver.value = false

      let data = dragData.value

      // Fallback if the drag started outside this specific composable instance
      if (!data && event.dataTransfer) {
        const raw = event.dataTransfer.getData('text/plain')
        try {
          data = JSON.parse(raw)
        } catch {
          data = raw
        }
      }

      onDrop(data)
    },
  })

  return {
    isDragging,
    isOver,
    draggableProps,
    droppableProps,
  }
}
