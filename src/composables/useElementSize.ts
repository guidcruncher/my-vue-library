import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export function useElementSize(target: Ref<HTMLElement | null>) {
  const width = ref(0);
  const height = ref(0);

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  });

  onMounted(() => {
    if (target.value) observer.observe(target.value);
  });

  onUnmounted(() => observer.disconnect());

  return { width, height };
}
