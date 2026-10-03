import React from 'react';
import { View } from 'react-native';
import { isExpoGo } from '@/lib/environment';
import { bannerUnitId } from '@/lib/ads';
import { useAdConfig } from '@/store/ads';

type AdsModule = typeof import('react-native-google-mobile-ads');

/** Native reklam modülünü güvenli şekilde getirir; Expo Go'da null döner */
function getAdsModule(): AdsModule | null {
  if (isExpoGo()) return null;
  try {
    return require('react-native-google-mobile-ads') as AdsModule;
  } catch {
    return null;
  }
}

/**
 * Çapalı uyarlanabilir banner. Remote Config `ads_enabled=false` ise
 * hiç yüklenmez/gösterilmez.
 */
export function BannerAdView() {
  const adsEnabled = useAdConfig((s) => s.adsEnabled);
  const mod = React.useMemo(() => getAdsModule(), []);

  if (!adsEnabled || !mod) return null;

  return (
    <View className="items-center overflow-hidden rounded-2xl">
      <mod.BannerAd
        unitId={bannerUnitId()}
        size={mod.BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
