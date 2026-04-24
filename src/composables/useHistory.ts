import { ref, computed, type Ref, watch } from 'vue'

export function useHistory<T>(source: Ref<T>, capacity: number = 20) {
  const history = ref<T[]>([JSON.parse(JSON.stringify(source.value))])
  const index = ref(0)
  let pause = false

  const canUndo = computed(() => index.value > 0)
  const canRedo = computed(() => index.value < history.value.length - 1)

  watch(
    source,
    (newVal) => {
      if (pause) return

      // Remove future history if we were in the middle of the stack
      const newHistory = history.value.slice(0, index.value + 1)
      newHistory.push(JSON.parse(JSON.stringify(newVal)))

      if (newHistory.length > capacity) newHistory.shift()

      history.value = newHistory
      index.value = history.value.length - 1
    },
    { deep: true }
  )

  const undo = () => {
    if (!canUndo.value) return
    pause = true
    index.value--
    source.value = JSON.parse(JSON.stringify(history.value[index.value]))
    setTimeout(() => (pause = false), 0)
  }

  const redo = () => {
    if (!canRedo.value) return
    pause = true
    index.value++
    source.value = JSON.parse(JSON.stringify(history.value[index.value]))
    setTimeout(() => (pause = false), 0)
  }

  return { undo, redo, canUndo, canRedo, history, index }
}
