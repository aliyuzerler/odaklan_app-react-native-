import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import type { LangSetting } from '@/lib/types';

interface SettingsState {
  /** 'system' → cihaz diline göre çözümlenir */
  lang: LangSetting;
  focusMin: number;
  breakMin: number;
  longBreakMin: number;
  notificationsOn: boolean;
  onboardingDone: boolean;

  setLang: (lang: LangSetting) => void;
  setFocusMin: (min: number) => void;
  setBreakMin: (min: number) => void;
  setLongBreakMin: (min: number) => void;
  setNotificationsOn: (on: boolean) => void;
  completeOnboarding: () => void;
}

export const FOCUS_MIN = { min: 5, max: 90, step: 5, default: 25 };
export const BREAK_MIN = { min: 1, max: 30, step: 1, default: 5 };
export const LONG_BREAK_MIN = { min: 5, max: 60, step: 5, default: 15 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'system',
      focusMin: FOCUS_MIN.default,
      breakMin: BREAK_MIN.default,
      longBreakMin: LONG_BREAK_MIN.default,
      notificationsOn: true,
      onboardingDone: false,

      setLang: (lang) => set({ lang }),
      setFocusMin: (min) => set({ focusMin: clamp(min, FOCUS_MIN.min, FOCUS_MIN.max) }),
      setBreakMin: (min) => set({ breakMin: clamp(min, BREAK_MIN.min, BREAK_MIN.max) }),
      setLongBreakMin: (min) => set({ longBreakMin: clamp(min, LONG_BREAK_MIN.min, LONG_BREAK_MIN.max) }),
      setNotificationsOn: (on) => set({ notificationsOn: on }),
      completeOnboarding: () => set({ onboardingDone: true }),
    }),
    {
      name: 'settings.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
