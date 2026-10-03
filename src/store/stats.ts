import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { todayKey } from '@/lib/date';
import type { BadgeContext, DayFocusLog, DayGoalsLog, WeekPoint } from '@/lib/types';

interface StatsState {
  /** gün anahtarı → odak kaydı */
  focusLog: Record<string, DayFocusLog>;
  /** gün anahtarı → hedef kaydı */
  goalsLog: Record<string, DayGoalsLog>;
  shareCount: number;

  logFocusSession: (minutes: number) => void;
  setGoalsProgress: (done: number, total: number) => void;
  registerShare: () => void;
  resetAll: () => void;
}

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      focusLog: {},
      goalsLog: {},
      shareCount: 0,

      logFocusSession: (minutes) =>
        set((s) => {
          const key = todayKey();
          const day = s.focusLog[key] ?? { sessions: 0, minutes: 0 };
          return {
            focusLog: { ...s.focusLog, [key]: { sessions: day.sessions + 1, minutes: day.minutes + minutes } },
          };
        }),

      setGoalsProgress: (done, total) =>
        set((s) => ({ goalsLog: { ...s.goalsLog, [todayKey()]: { done, total } } })),

      registerShare: () => set((s) => ({ shareCount: s.shareCount + 1 })),

      resetAll: () => set({ focusLog: {}, goalsLog: {}, shareCount: 0 }),
    }),
    {
      name: 'stats.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

/** Rozet motoru için toplu sayılar */
export function computeBadgeContext(
  focusLog: Record<string, DayFocusLog>,
  goalsLog: Record<string, DayGoalsLog>,
  shareCount: number,
  currentStreak: number,
  bestStreak: number,
): BadgeContext {
  let sessions = 0;
  let totalMinutes = 0;
  for (const day of Object.values(focusLog)) {
    sessions += day.sessions;
    totalMinutes += day.minutes;
  }
  let goalsCompleted = 0;
  let perfectDays = 0;
  for (const day of Object.values(goalsLog)) {
    goalsCompleted += day.done;
    if (day.total >= 3 && day.done >= 3) perfectDays++;
  }
  return {
    goalsCompleted,
    perfectDays,
    sessions,
    totalMinutes,
    currentStreak,
    bestStreak,
    sharedCards: shareCount,
  };
}

export function weekSeries(
  keys: string[],
  focusLog: Record<string, DayFocusLog>,
  goalsLog: Record<string, DayGoalsLog>,
): WeekPoint[] {
  return keys.map((key) => ({
    key,
    label: '',
    minutes: focusLog[key]?.minutes ?? 0,
    sessions: focusLog[key]?.sessions ?? 0,
    goalsDone: goalsLog[key]?.done ?? 0,
  }));
}

export function sumWeek(
  keys: string[],
  focusLog: Record<string, DayFocusLog>,
): { minutes: number; sessions: number } {
  let minutes = 0;
  let sessions = 0;
  for (const key of keys) {
    minutes += focusLog[key]?.minutes ?? 0;
    sessions += focusLog[key]?.sessions ?? 0;
  }
  return { minutes, sessions };
}

/** En yüksek odak dakikasına sahip gün */
export function bestDayKey(
  keys: string[],
  focusLog: Record<string, DayFocusLog>,
): string | null {
  let best: string | null = null;
  let bestVal = -1;
  for (const key of keys) {
    const val = focusLog[key]?.minutes ?? 0;
    if (val > bestVal) {
      bestVal = val;
      best = key;
    }
  }
  return bestVal > 0 ? best : null;
}
