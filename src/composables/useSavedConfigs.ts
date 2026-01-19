import { ref, watch } from 'vue';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Generic composable to persist and restore data from LocalStorage.
 * Fully typed, without using `any`.
 */
export function useSavedConfigs<T extends JsonValue>(storageKey: string, defaultValue: T) {
  const data = ref<T>(load());

  function load(): T {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return structuredClone(defaultValue);
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[useSavedConfigs] Failed to load ${storageKey}`, err);
      return structuredClone(defaultValue);
    }
  }

  function save(): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data.value));
    } catch (err) {
      console.warn(`[useSavedConfigs] Failed to save ${storageKey}`, err);
    }
  }

  function reset(): void {
    data.value = structuredClone(defaultValue);
    save();
  }

  watch(data, save, { deep: true });

  return {
    data,
    load,
    save,
    reset,
  };
}
