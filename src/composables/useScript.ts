import { ref } from 'vue'

export function useScript(src: string) {
  const status = ref<'loading' | 'ready' | 'error'>('loading')

  const load = () => {
    return new Promise((resolve, reject) => {
      // Check if already exists
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
        status.value = 'ready'
        return resolve(true)
      }

      const script = document.createElement('script')
      script.src = src
      script.async = true

      script.onload = () => {
        status.value = 'ready'
        resolve(true)
      }

      script.onerror = () => {
        status.value = 'error'
        reject(new Error(`Failed to load script: ${src}`))
      }

      document.head.appendChild(script)
    })
  }

  return { status, load }
}
