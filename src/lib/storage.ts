import { createMMKV } from 'react-native-mmkv';

/** Tek MMKV örneği — tüm uygulama verisi burada */
export const storage = createMMKV({ id: 'takip-asistan' });

/** zustand persist için senkron adaptör */
export const mmkvStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
