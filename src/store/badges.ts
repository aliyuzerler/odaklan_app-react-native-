import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { BADGES } from '@/lib/badges';
import { computeBadgeContext, useStats } from './stats';
import { useStreak } from './streak';
import { Haptics } from '@/lib/haptics';

interface BadgesState {
  /** rozet id → açıldığı timestamp (ms) */
  unlocked: Record<string, number>;

  /** Tüm koşulları değerlendirir, yeni açılanları işaretler */
  evaluate: () => void;
  resetAll: () => void;
}

export const useBadges = create<BadgesState>()(
  persist(
    (set, get) => ({
      unlocked: {},

      evaluate: () => {
        const stats = useStats.getState();
        const streak = useStreak.getState();
        const ctx = computeBadgeContext(
          stats.focusLog,
          stats.goalsLog,
          stats.shareCount,
          streak.current,
          streak.best,
        );
        const now = Date.now();
        const newly: string[] = [];
        const next = { ...get().unlocked };
        for (const def of BADGES) {
          if (next[def.id]) continue;
          if (def.check(ctx)) {
            next[def.id] = now;
            newly.push(def.id);
          }
        }
        if (newly.length > 0) {
          set({ unlocked: next });
          Haptics.badgeUnlocked();
        }
      },

      resetAll: () => set({ unlocked: {} }),
    }),
    {
      name: 'badges.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
