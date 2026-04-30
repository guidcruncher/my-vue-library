import { ref, unref, type Ref } from 'vue'

export function useFetch(url: string | Ref<string>) {
  const data = ref<unknown>(undefined)
  const error = ref<unknown>(undefined)
  const loading = ref(false)

  const executeFetch = async (u: string) => {
    loading.value = true
    error.value = undefined

    try {
      const res = await fetch(u)
      data.value = await res.json()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const run = () => {
    executeFetch(unref(url))
  }

  // optional autostart
  run()

  return {
    data,
    error,
    loading,
    run,
  }
}
