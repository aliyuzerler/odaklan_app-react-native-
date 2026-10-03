import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { todayKey } from '@/lib/date';
import type { GoalItem } from '@/lib/types';
import { useStats } from './stats';
import { useStreak } from './streak';
import { useBadges } from './badges';

const MAX_GOALS = 3;

interface GoalsState {
  dateKey: string;
  items: GoalItem[];

  add: (title: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  /** Gün değiştiyse listeyi sıfırlar; her çağrıda ilerlemeyi stats'a yazar */
  syncToday: () => void;
  /** Tüm bugünkü hedefleri siler (veri sıfırlama) */
  clearToday: () => void;
}

function pushProgress(items: GoalItem[]) {
  const done = items.filter((g) => g.done).length;
  useStats.getState().setGoalsProgress(done, items.length);
}

export const useGoals = create<GoalsState>()(
  persist(
    (set, get) => ({
      dateKey: todayKey(),
      items: [],

      add: (title) => {
        const trimmed = title.trim();
        if (!trimmed || get().items.length >= MAX_GOALS) return false;
        const item: GoalItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: trimmed, done: false, createdAt: Date.now() };
        const items = [...get().items, item];
        set({ items });
        pushProgress(items);
        return true;
      },

      toggle: (id) => {
        let becameDone = false;
        const items = get().items.map((g) => {
          if (g.id !== id) return g;
          becameDone = !g.done;
          return { ...g, done: !g.done };
        });
        set({ items });
        pushProgress(items);
        if (becameDone) {
          useStreak.getState().registerActivity();
          useBadges.getState().evaluate();
        }
      },

      remove: (id) => {
        const items = get().items.filter((g) => g.id !== id);
        set({ items });
        pushProgress(items);
      },

      syncToday: () => {
        const today = todayKey();
        if (get().dateKey !== today) {
          set({ dateKey: today, items: [] });
          pushProgress([]);
        } else {
          pushProgress(get().items);
        }
      },

      clearToday: () => {
        set({ items: [] });
        pushProgress([]);
      },
    }),
    {
      name: 'goals.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const MAX_DAILY_GOALS = MAX_GOALS;
