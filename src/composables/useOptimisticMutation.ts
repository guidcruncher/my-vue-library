import { ref, Ref } from 'vue';

export function useOptimisticMutation<T>(state: Ref<T>) {
  const isSyncing = ref(false);

  const mutate = async (newValue: T, mutationFn: (val: T) => Promise<any>) => {
    const previousValue = state.value;
    state.value = newValue; 
    isSyncing.value = true;

    try {
      await mutationFn(newValue);
    } catch (e) {
      state.value = previousValue; // Rollback on failure
      console.error("Mutation failed, rolling back.", e);
    } finally {
      isSyncing.value = false;
    }
  };

  return { mutate, isSyncing };
}
