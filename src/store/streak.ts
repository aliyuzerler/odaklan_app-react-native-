import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { diffDays, todayKey, yesterdayKey } from '@/lib/date';

interface StreakState {
  current: number;
  best: number;
  /** Son aktif günün anahtarı — seriyi bu gün bitirmiş */
  lastActive: string | null;

  /** Hedef tamamlama veya odak oturumunda çağrılır */
  registerActivity: () => void;
  /** Gün değişiminde: serisi kopanları sıfırlar */
  sync: () => void;
  resetAll: () => void;
}

export const useStreak = create<StreakState>()(
  persist(
    (set, get) => ({
      current: 0,
      best: 0,
      lastActive: null,

      registerActivity: () => {
        const today = todayKey();
        const { lastActive, current, best } = get();
        if (lastActive === today) return;
        const next =
          lastActive !== null && lastActive === yesterdayKey() ? current + 1 : 1;
        set({ current: next, best: Math.max(best, next), lastActive: today });
      },

      sync: () => {
        const { lastActive, current } = get();
        if (!lastActive || current === 0) return;
        const today = todayKey();
        // Son aktif gün dünden eskiyse seri kırıldı
        if (diffDays(lastActive, today) >= 2) {
          set({ current: 0 });
        }
      },

      resetAll: () => set({ current: 0, best: 0, lastActive: null }),
    }),
    {
      name: 'streak.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
