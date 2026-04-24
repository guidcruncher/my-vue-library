import { ref, computed, type Ref } from 'vue';

interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

export function useLinkedList<T>() {
  const head = ref<ListNode<T> | null>(null);
  const size = ref(0);

  const isEmpty = computed(() => size.value === 0);

  // Add to the end
  const append = (value: T) => {
    const newNode: ListNode<T> = { value, next: null };
    if (!head.value) {
      head.value = newNode;
    } else {
      let current = head.value;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    size.value++;
  };

  // Convert to array for Vue v-for rendering
  const toArray = computed(() => {
    const result: T[] = [];
    let current = head.value;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  });

  return { head, size, isEmpty, append, toArray };
}
