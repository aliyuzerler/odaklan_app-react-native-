import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Expo Go içinde mi çalışıyor? (native modüller yalnızca dev build'de var) */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}
