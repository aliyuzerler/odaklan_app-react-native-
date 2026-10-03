export type GoalItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

/** Günlük odak kaydı */
export type DayFocusLog = {
  sessions: number;
  minutes: number;
};

/** Günlük hedef kaydı — kaç hedefin kaçının bittiği */
export type DayGoalsLog = {
  done: number;
  total: number;
};

export type TimerType = 'focus' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

export type StreakState = {
  current: number;
  best: number;
  lastActive: string | null;
};

/** Rozet değerlendirme bağlamı */
export type BadgeContext = {
  goalsCompleted: number;
  perfectDays: number;
  sessions: number;
  totalMinutes: number;
  currentStreak: number;
  bestStreak: number;
  sharedCards: number;
};

export type Lang = 'tr' | 'en';
export type LangSetting = Lang | 'system';

/** Grafik noktası */
export type WeekPoint = {
  key: string;
  label: string;
  minutes: number;
  sessions: number;
  goalsDone: number;
};
