import { ref, computed, type Ref } from 'vue';

export interface UseQueueReturn<T> {
  items: Ref<T[]>;
  size: Ref<number>;
  isEmpty: Ref<boolean>;
  front: Ref<T | undefined>;
  enqueue: (item: T) => void;
  dequeue: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
}

/**
 * useQueue
 * A reactive First-In-First-Out (FIFO) data structure utility.
 */
export function useQueue<T>(initialItems: T[] = []): UseQueueReturn<T> {
  const items = ref<T[]>([...initialItems]) as Ref<T[]>;

  const size = computed(() => items.value.length);
  const isEmpty = computed(() => items.value.length === 0);
  
  // Returns the first item without removing it
  const front = computed(() => items.value[0]);

  const enqueue = (item: T) => {
    items.value.push(item);
  };

  const dequeue = (): T | undefined => {
    return items.value.shift();
  };

  const peek = (): T | undefined => {
    return items.value[0];
  };

  const clear = () => {
    items.value = [];
  };

  return {
    items,
    size,
    isEmpty,
    front,
    enqueue,
    dequeue,
    peek,
    clear
  };
}
