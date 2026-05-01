import { ref } from 'vue';

export interface PatchStorageOptions {
  namespace: string;
  version: number;
}

export interface StoredPatch {
  name: string;
  version: number;
  data: Record<string, number | string>;
}

export interface PatchStorage {
  patches: ReturnType<typeof ref<StoredPatch[]>>;
  savePatch: (name: string, data: Record<string, number | string>) => void;
  loadPatch: (name: string) => StoredPatch | null;
  deletePatch: (name: string) => void;
}

export function usePatchStorage(opts: PatchStorageOptions): PatchStorage {
  const patches = ref<StoredPatch[]>([]);

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(opts.namespace);
    if (!raw) return;
    try {
      patches.value = JSON.parse(raw);
    } catch {
      patches.value = [];
    }
  };

  const persist = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(opts.namespace, JSON.stringify(patches.value));
  };

  const savePatch = (name: string, data: Record<string, number | string>) => {
    const existing = patches.value.find(p => p.name === name);
    if (existing) {
      existing.data = data;
      existing.version = opts.version;
    } else {
      patches.value.push({
        name,
        version: opts.version,
        data,
      });
    }
    persist();
  };

  const loadPatch = (name: string): StoredPatch | null => {
    const p = patches.value.find(p => p.name === name);
    if (!p) return null;
    if (p.version !== opts.version) {
      console.warn(\`Patch version mismatch: \${p.version} != \${opts.version}\`);
    }
    return p;
  };

  const deletePatch = (name: string) => {
    patches.value = patches.value.filter(p => p.name !== name);
    persist();
  };

  loadFromLocalStorage();

  return {
    patches,
    savePatch,
    loadPatch,
    deletePatch,
  };
}
