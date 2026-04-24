import { ref, computed } from 'vue';

export function usePagination<T>(items: T[], pageSize: number = 10) {
  const currentPage = ref(1);
  const totalPages = computed(() => Math.ceil(items.length / pageSize));

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return items.slice(start, start + pageSize);
  });

  const next = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
  const prev = () => { if (currentPage.value > 1) currentPage.value--; };

  return { currentPage, totalPages, paginatedData, next, prev };
}
