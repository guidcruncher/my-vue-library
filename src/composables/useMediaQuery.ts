import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQueryList: MediaQueryList | undefined = undefined

  const update = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  onMounted(() => {
    mediaQueryList = window.matchMedia(query)
    update(mediaQueryList)
    mediaQueryList.addEventListener('change', update)
  })

  onUnmounted(() => {
    mediaQueryList?.removeEventListener('change', update)
  })

  return matches
}
