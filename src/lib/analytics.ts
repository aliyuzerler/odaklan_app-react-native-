import { isExpoGo } from './environment';

type AnalyticsModule = typeof import('@react-native-firebase/analytics');

/** Firebase Analytics event kaydı — yapılandırma yoksa sessizce atlanır */
export function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (isExpoGo()) return;
  void (async () => {
    try {
      const mod = (await import('@react-native-firebase/analytics')) as AnalyticsModule;
      await mod.logEvent(mod.getAnalytics(), name, params);
    } catch {
      // Analytics kullanılamıyor (placeholder config vb.)
    }
  })();
}

export function logAppOpen(): void {
  logEvent('app_open');
}

export function setAnalyticsUserProperty(name: string, value: string): void {
  if (isExpoGo()) return;
  void (async () => {
    try {
      const mod = (await import('@react-native-firebase/analytics')) as AnalyticsModule;
      await mod.setUserProperty(mod.getAnalytics(), name, value);
    } catch {
      // ignore
    }
  })();
}
