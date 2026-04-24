import { ref, onMounted, onUnmounted } from 'vue';

export function useDeviceOrientation() {
  const alpha = ref<number | null>(0); // Z-axis rotation
  const beta = ref<number | null>(0);  // X-axis rotation
  const gamma = ref<number | null>(0); // Y-axis rotation

  const handler = (event: DeviceOrientationEvent) => {
    alpha.value = event.alpha;
    beta.value = event.beta;
    gamma.value = event.gamma;
  };

  onMounted(() => {
    window.addEventListener('deviceorientation', handler);
  });

  onUnmounted(() => {
    window.removeEventListener('deviceorientation', handler);
  });

  return { alpha, beta, gamma };
}

