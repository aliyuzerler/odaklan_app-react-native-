import { Platform } from 'react-native';
import { isExpoGo } from './environment';
import { useAdConfig } from '@/store/ads';

/**
 * AD BİRİM ID'LERİ
 * Aşağıdaki değerler Google TEST birimleridir. Yayına çıkmadan önce
 * AdMob konsolundan aldığınız gerçek birim ID'leriyle değiştirin.
 */
export const AD_UNITS = {
  bannerAndroid: 'ca-app-pub-3940256099942544/6300978111',
  bannerIos: 'ca-app-pub-3940256099942544/2934735716',
  interstitialAndroid: 'ca-app-pub-3940256099942544/1033173712',
  interstitialIos: 'ca-app-pub-3940256099942544/4411468910',
} as const;

/** Interstitial'lar arasında en az bu kadar süre (45 dk) olmalı */
const MIN_INTERSTITIAL_INTERVAL_MS = 45 * 60 * 1000;

type InterstitialModule = typeof import('react-native-google-mobile-ads');

let initialized = false;
let interstitial: import('react-native-google-mobile-ads').InterstitialAd | null = null;
let interstitialLoaded = false;
let lastShownAt = 0;
let focusSessionCount = 0;

function getModule(): InterstitialModule | null {
  if (isExpoGo()) return null;
  try {
    // Expo Go'da native modül yok — import çökmesin diye tembel yüklenir
    return require('react-native-google-mobile-ads') as InterstitialModule;
  } catch {
    return null;
  }
}

export function bannerUnitId(): string {
  return Platform.OS === 'ios' ? AD_UNITS.bannerIos : AD_UNITS.bannerAndroid;
}

export function initAds(): void {
  const mod = getModule();
  if (!mod || initialized) return;
  initialized = true;

  void mod
    .default()
    .initialize()
    .then((status) => {
      log(`init: ${status.map((s) => s.state).join(',')}`);
    })
    .catch(() => {});
  createInterstitial(mod);
}

function createInterstitial(mod: InterstitialModule): void {
  const unitId = Platform.OS === 'ios' ? AD_UNITS.interstitialIos : AD_UNITS.interstitialAndroid;
  interstitial = mod.InterstitialAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  interstitial.addAdEventListener(mod.AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  interstitial.addAdEventListener(mod.AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  interstitial.addAdEventListener(mod.AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    interstitial?.load();
  });
  interstitial.load();
}

/** Odak oturumu tamamlandığında çağrılır — Remote Config sıklığına göre interstitial gösterir */
export function onFocusSessionComplete(): void {
  focusSessionCount += 1;
  const { adsEnabled, interstitialFrequency } = useAdConfig.getState();
  if (!adsEnabled) return;
  if (interstitialFrequency <= 0 || focusSessionCount % interstitialFrequency !== 0) return;
  if (Date.now() - lastShownAt < MIN_INTERSTITIAL_INTERVAL_MS) return;

  const mod = getModule();
  if (!mod || !interstitial) return;
  if (interstitialLoaded) {
    interstitial.show();
    lastShownAt = Date.now();
  } else {
    interstitial.load();
  }
}

function log(msg: string) {
  if (__DEV__) console.log(`[ads] ${msg}`);
}
