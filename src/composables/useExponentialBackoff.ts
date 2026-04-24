import { ref } from 'vue';

export function useExponentialBackoff() {
  const retryCount = ref(0);

  const execute = async <T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retryCount.value >= maxRetries) throw error;
      
      const delay = Math.pow(2, retryCount.value) * 1000;
      retryCount.value++;
      
      await new Promise(res => setTimeout(res, delay));
      return execute(fn, maxRetries);
    }
  };

  return { execute, retryCount };
}
