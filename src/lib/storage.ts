import { LocalStorage } from "@raycast/api";
import type { StorageLike } from "./cache";

export type FlushableStorage = StorageLike & { flush(): Promise<void> };

export async function createSyncedStorage(): Promise<FlushableStorage> {
  const items = await LocalStorage.allItems();
  const data = new Map<string, string>(
    Object.entries(items).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]),
  );
  const dirty = new Set<string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
      dirty.add(key);
    },
    removeItem: (key) => {
      data.delete(key);
      dirty.add(key);
    },
    flush: async () => {
      for (const key of dirty) {
        const value = data.get(key);
        if (value == null) await LocalStorage.removeItem(key);
        else await LocalStorage.setItem(key, value);
      }
      dirty.clear();
    },
  };
}