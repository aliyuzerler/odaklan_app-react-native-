import { useEffect } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import { useTimer } from '@/store/timer';
import { useGoals } from '@/store/goals';
import { useStreak } from '@/store/streak';
import { useBadges } from '@/store/badges';
import { addNotificationResponseListener } from '@/lib/notifications';

/**
 * Görünmez kalp atışı:
 * - 500ms'de bir timer'ı tiklettirir (süre dolmuşsa fazı ilerletir)
 * - 30 saniyede bir + her foreground'da gün değişimini kontrol eder
 * - timer bitiş bildirimine dokunulduğunda odak sekmesine götürür
 */
export function AppSync() {
  useEffect(() => {
    const dayCheck = () => {
      useGoals.getState().syncToday();
      useStreak.getState().sync();
      useBadges.getState().evaluate();
    };

    const tickInterval = setInterval(() => useTimer.getState().tick(), 500);
    const dayInterval = setInterval(dayCheck, 30_000);

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useTimer.getState().tick();
        dayCheck();
      }
    });

    const notifSub = addNotificationResponseListener(() => {
      router.push('/(tabs)/focus');
    });

    return () => {
      clearInterval(tickInterval);
      clearInterval(dayInterval);
      appState.remove();
      notifSub.remove();
    };
  }, []);

  return null;
}
