import { ref, shallowRef } from 'vue';

export function useFetch<T>(url: string, options: RequestInit = {}) {
  const data = shallowRef<T | null>(null);
  const error = ref<Error | null>(null);
  const isPending = ref(false);
  let controller: AbortController | null = null;

  const execute = async () => {
    controller?.abort(); // Cancel previous request
    controller = new AbortController();
    
    isPending.value = true;
    error.value = null;

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (!response.ok) throw new Error(response.statusText);
      data.value = await response.json();
    } catch (err: any) {
      if (err.name !== 'AbortError') error.value = err;
    } finally {
      isPending.value = false;
    }
  };

  return { data, error, isPending, execute, abort: () => controller?.abort() };
}
