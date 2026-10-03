import { isExpoGo } from './environment';
import { useAdConfig } from '@/store/ads';

type RemoteConfigModule = typeof import('@react-native-firebase/remote-config');

const DEFAULTS = { ads_enabled: true, interstitial_frequency: 3 };
/** Yerel geliştirmede Remote Config değişikliğini 1 saatte bir çeker */
const MIN_FETCH_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Firebase Remote Config'i başlatır ve reklam bayraklarını çeker.
 * Firebase yapılandırması yoksa (placeholder google-services.json) sessizce
 * varsayılanlarla devam eder — uygulama her koşulda çalışır.
 */
export async function initRemoteConfig(): Promise<void> {
  if (isExpoGo()) return;
  try {
    const mod = (await import('@react-native-firebase/remote-config')) as RemoteConfigModule;
    const rc = mod.getRemoteConfig();
    rc.settings = { minimumFetchIntervalMillis: MIN_FETCH_INTERVAL_MS, fetchTimeoutMillis: 10_000 };
    rc.defaultConfig = DEFAULTS;

    const activated = await mod.fetchAndActivate(rc);
    const adsEnabled = mod.getBoolean(rc, 'ads_enabled');
    const frequency = mod.getNumber(rc, 'interstitial_frequency');

    useAdConfig
      .getState()
      .setFromRemote(
        activated ? adsEnabled : DEFAULTS.ads_enabled,
        frequency > 0 ? frequency : DEFAULTS.interstitial_frequency,
      );
    if (__DEV__) {
      console.log(`[remoteConfig] ads_enabled=${adsEnabled} frequency=${frequency}`);
    }
  } catch (e) {
    // Placeholder config / ağ yok → varsayılanlar geçerli kalır
    if (__DEV__) console.warn('[remoteConfig] kullanılamadı, varsayılanlar aktif:', (e as Error)?.message);
  }
}
