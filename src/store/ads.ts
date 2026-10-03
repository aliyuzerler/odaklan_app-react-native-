import { create } from 'zustand';

/**
 * Firebase Remote Config'den beslenen reklam bayrakları.
 * Varsayılan: reklamlar açık, her 3. odak oturumunda interstitial.
 */
interface AdConfigState {
  adsEnabled: boolean;
  /** Her N odak oturumunda bir interstitial (0 → asla) */
  interstitialFrequency: number;
  setFromRemote: (adsEnabled: boolean, frequency: number) => void;
}

export const useAdConfig = create<AdConfigState>()((set) => ({
  adsEnabled: true,
  interstitialFrequency: 3,
  setFromRemote: (adsEnabled, interstitialFrequency) =>
    set({ adsEnabled, interstitialFrequency }),
}));
