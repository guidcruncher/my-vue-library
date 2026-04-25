import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@server/router'; // Your backend types

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      // You can add headers here (e.g., for auth)
      headers() {
        return {
          Authorization: localStorage.getItem('token') ?? '',
        };
      },
    }),
  ],
});

import { ref } from 'vue';
import { client } from './trpc';

export function useTrpc() {
  const isLoading = ref(false);
  const error = ref<any>(null);

  // We return the raw client for flexible usage, 
  // but you can wrap specific calls here
  const query = async (cb: (trpc: typeof client) => Promise<any>) => {
    isLoading.value = true;
    error.value = null;
    try {
      return await cb(client);
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    client, // Access to all routes: client.user.getById.query({ id: 1 })
    query,
    isLoading,
    error
  };
}

