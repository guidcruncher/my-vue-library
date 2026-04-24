import { ref, onMounted, onUnmounted } from 'vue';

export function useIdle(ms: number = 60000) {
  const isIdle = ref(false);
  let timeout: ReturnType<typeof setTimeout>;

  const reset = () => {
    isIdle.value = false;
    clearTimeout(timeout);
    timeout = setTimeout(() => (isIdle.value = true), ms);
  };

  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];

  onMounted(() => {
    reset();
    events.forEach((e) => window.addEventListener(e, reset));
  });

  onUnmounted(() => {
    clearTimeout(timeout);
    events.forEach((e) => window.removeEventListener(e, reset));
  });

  return isIdle;
}
