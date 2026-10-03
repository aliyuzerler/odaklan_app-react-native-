import {
  Crown,
  Flame,
  Hourglass,
  Medal,
  Mountain,
  Rocket,
  Share2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import type { BadgeContext } from './types';

export type BadgeDef = {
  id: string;
  icon: LucideIcon;
  /** emerald vurgusu olmayan rozetler için renk */
  color: string;
  titleKey: string;
  descKey: string;
  check: (ctx: BadgeContext) => boolean;
};

const EMERALD = '#10B981';
const AMBER = '#F59E0B';
const VIOLET = '#8B5CF6';
const SKY = '#38BDF8';

/** 12 başarım rozeti — check fonksiyonları saf, test edilebilir */
export const BADGES: BadgeDef[] = [
  { id: 'first-goal', icon: Target, color: EMERALD, titleKey: 'badges.firstGoal.title', descKey: 'badges.firstGoal.desc', check: (c) => c.goalsCompleted >= 1 },
  { id: 'perfect-day', icon: Sparkles, color: VIOLET, titleKey: 'badges.perfectDay.title', descKey: 'badges.perfectDay.desc', check: (c) => c.perfectDays >= 1 },
  { id: 'first-focus', icon: Timer, color: SKY, titleKey: 'badges.firstFocus.title', descKey: 'badges.firstFocus.desc', check: (c) => c.sessions >= 1 },
  { id: 'focus-10', icon: Zap, color: AMBER, titleKey: 'badges.focus10.title', descKey: 'badges.focus10.desc', check: (c) => c.sessions >= 10 },
  { id: 'focus-50', icon: Medal, color: AMBER, titleKey: 'badges.focus50.title', descKey: 'badges.focus50.desc', check: (c) => c.sessions >= 50 },
  { id: 'focus-200', icon: Trophy, color: AMBER, titleKey: 'badges.focus200.title', descKey: 'badges.focus200.desc', check: (c) => c.sessions >= 200 },
  { id: 'minutes-600', icon: Hourglass, color: SKY, titleKey: 'badges.minutes600.title', descKey: 'badges.minutes600.desc', check: (c) => c.totalMinutes >= 600 },
  { id: 'minutes-3000', icon: Mountain, color: SKY, titleKey: 'badges.minutes3000.title', descKey: 'badges.minutes3000.desc', check: (c) => c.totalMinutes >= 3000 },
  { id: 'streak-7', icon: Flame, color: AMBER, titleKey: 'badges.streak7.title', descKey: 'badges.streak7.desc', check: (c) => c.bestStreak >= 7 },
  { id: 'streak-30', icon: Rocket, color: VIOLET, titleKey: 'badges.streak30.title', descKey: 'badges.streak30.desc', check: (c) => c.bestStreak >= 30 },
  { id: 'streak-100', icon: Crown, color: AMBER, titleKey: 'badges.streak100.title', descKey: 'badges.streak100.desc', check: (c) => c.bestStreak >= 100 },
  { id: 'share-card', icon: Share2, color: EMERALD, titleKey: 'badges.shareCard.title', descKey: 'badges.shareCard.desc', check: (c) => c.sharedCards >= 1 },
];

export function getBadgeDef(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
