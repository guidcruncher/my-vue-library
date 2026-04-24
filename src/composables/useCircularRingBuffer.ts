import { ref, computed, type Ref } from 'vue';

export function useCircularBuffer<T>(capacity: number) {
  const buffer = ref<T[]>([]) as Ref<T[]>;
  const pointer = ref(0);

  const push = (item: T) => {
    if (buffer.value.length < capacity) {
      buffer.value.push(item);
    } else {
      buffer.value[pointer.value] = item;
      pointer.value = (pointer.value + 1) % capacity;
    }
  };

  // Returns the items in the correct chronological order
  const orderedItems = computed(() => {
    if (buffer.value.length < capacity) return [...buffer.value];
    return [
      ...buffer.value.slice(pointer.value),
      ...buffer.value.slice(0, pointer.value)
    ];
  });

  return { push, orderedItems, capacity };
}
