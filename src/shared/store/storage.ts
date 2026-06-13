import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore: Record<string, string> = {};

/** Redux-persist storage with in-memory fallback when native module is unavailable (e.g. Expo Go edge cases). */
export const persistStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },
};
