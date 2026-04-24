import { ref, watch } from 'vue';

export function useCookie(key: string, options: { expires?: number | Date; path?: string } = {}) {
  const getCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const cookieValue = ref<string | null>(getCookie());

  watch(cookieValue, (newVal) => {
    let str = `${encodeURIComponent(key)}=${encodeURIComponent(newVal ?? '')}`;
    if (options.expires) {
      const exp = options.expires instanceof Date ? options.expires.toUTCString() : new Date(Date.now() + options.expires).toUTCString();
      str += `; expires=${exp}`;
    }
    str += `; path=${options.path || '/'}`;
    document.cookie = str;
  });

  return cookieValue;
}
