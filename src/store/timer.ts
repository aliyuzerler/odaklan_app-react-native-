import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import type { TimerType, TimerStatus } from '@/lib/types';
import { useSettings } from './settings';
import { useStats } from './stats';
import { useStreak } from './streak';
import { useBadges } from './badges';
import { scheduleTimerEnd, cancelScheduledNotification } from '@/lib/notifications';
import { onFocusSessionComplete } from '@/lib/ads';
import { logEvent } from '@/lib/analytics';

interface TimerState {
  type: TimerType;
  status: TimerStatus;
  /** running durumunda bitiş duvar saati (ms epoch) — uygulama ölse bile süre doğru işler */
  endAt: number | null;
  /** paused durumunda kalan süre; idle'da görmezden gelinir (UI ayarlardan hesaplar) */
  remainingMs: number;
  /** mevcut turda tamamlanan odak sayısı (4 olunca uzun mola) */
  focusInGroup: number;
  /** planlanmış bildirim id'si — iptal için saklanır */
  notifId: string | null;

  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  /** 500ms ticker + app foreground çağırır */
  tick: () => void;
}

export function phaseMinutes(type: TimerType, focusInGroup: number): number {
  const s = useSettings.getState();
  if (type === 'focus') return s.focusMin;
  return focusInGroup >= 4 ? s.longBreakMin : s.breakMin;
}

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      type: 'focus',
      status: 'idle',
      endAt: null,
      remainingMs: useSettings.getState().focusMin * 60_000,
      focusInGroup: 0,
      notifId: null,

      start: () => {
        const { status, type, focusInGroup } = get();
        if (status === 'running') return;
        const minutes = phaseMinutes(type, focusInGroup);
        const endAt = Date.now() + minutes * 60_000;
        set({ status: 'running', endAt, remainingMs: minutes * 60_000 });
        scheduleTimerEnd(type, minutes * 60).then((id) => {
          if (id) set({ notifId: id });
        });
      },

      pause: () => {
        const { status, endAt } = get();
        if (status !== 'running' || !endAt) return;
        const remainingMs = Math.max(0, endAt - Date.now());
        set({ status: 'paused', endAt: null, remainingMs });
        if (get().notifId) {
          void cancelScheduledNotification(get().notifId!);
          set({ notifId: null });
        }
      },

      resume: () => {
        const { status, remainingMs } = get();
        if (status !== 'paused') return;
        const endAt = Date.now() + remainingMs;
        set({ status: 'running', endAt });
        scheduleTimerEnd(get().type, remainingMs / 1000).then((id) => {
          if (id) set({ notifId: id });
        });
      },

      stop: () => {
        const { notifId, type, focusInGroup } = get();
        if (notifId) void cancelScheduledNotification(notifId);
        set({
          status: 'idle',
          endAt: null,
          notifId: null,
          remainingMs: phaseMinutes(type, focusInGroup) * 60_000,
        });
      },

      skip: () => advance(set, get, false),

      tick: () => {
        const { status, endAt } = get();
        if (status === 'running' && endAt && Date.now() >= endAt) {
          advance(set, get, true);
        }
      },
    }),
    {
      name: 'timer.v1',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

type SetFn = (partial: Partial<TimerState>) => void;
type GetFn = () => TimerState;

/** Fazı bitirir, sonraki faza geçirir. logStats=false → istatistik yazılmaz (skip) */
function advance(set: SetFn, get: GetFn, logStats: boolean) {
  const { type, notifId, focusInGroup } = get();
  if (notifId) void cancelScheduledNotification(notifId);

  if (type === 'focus') {
    const nextGroup = focusInGroup + 1;
    const settings = useSettings.getState();
    const breakMinutes = nextGroup >= 4 ? settings.longBreakMin : settings.breakMin;

    if (logStats) {
      useStats.getState().logFocusSession(settings.focusMin);
      useStreak.getState().registerActivity();
      useBadges.getState().evaluate();
      logEvent('focus_session_complete', { minutes: settings.focusMin });
      onFocusSessionComplete();
    }

    set({
      type: 'break',
      status: 'done',
      focusInGroup: nextGroup,
      endAt: null,
      notifId: null,
      remainingMs: breakMinutes * 60_000,
    });
  } else {
    if (logStats) {
      logEvent('break_complete');
    }
    const focusMinutes = useSettings.getState().focusMin;
    set({
      type: 'focus',
      status: 'done',
      focusInGroup: 0,
      endAt: null,
      notifId: null,
      remainingMs: focusMinutes * 60_000,
    });
  }
}

/** UI: geçerli fazın toplam süresi (ms) — idle'da ayarlardan taze hesaplanır */
export function phaseDurationMs(type: TimerType, focusInGroup: number): number {
  return phaseMinutes(type, focusInGroup) * 60_000;
}
