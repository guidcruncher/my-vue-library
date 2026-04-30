import { ref, onUnmounted, shallowRef } from 'vue'

export interface CameraOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
}

export function useCamera() {
  // Use shallowRef for the stream to avoid unnecessary deep reactivity overhead
  const stream = shallowRef<MediaStream | undefined>(undefined)
  const error = ref<Error | undefined>(undefined)
  const isPending = ref(false)
  const isActive = ref(false)

  /**
   * Start the camera stream
   */
  const start = async (options: CameraOptions = { video: true, audio: false }) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      error.value = new Error('Camera API not supported in this browser')
      return
    }

    isPending.value = true
    error.value = undefined

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(options)
      stream.value = mediaStream
      isActive.value = true
    } catch (err: any) {
      error.value = err
      isActive.value = false
    } finally {
      isPending.value = false
    }
  }

  /**
   * Stop the camera and release hardware resources
   */
  const stop = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = undefined
      isActive.value = false
    }
  }

  // Automatically clean up hardware tracks when component unmounts
  onUnmounted(() => {
    stop()
  })

  return {
    stream,
    error,
    isPending,
    isActive,
    start,
    stop,
  }
}
