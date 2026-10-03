import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Flame, Target, Timer, Award } from 'lucide-react-native';
import { weekRangeLabel, weekStartKey, todayKey, lastNDays } from '@/lib/date';
import type { Lang } from '@/lib/types';
import { useStats, sumWeek } from '@/store/stats';
import { useStreak } from '@/store/streak';
import { useBadges } from '@/store/badges';
import { Text } from '@/components/ui/text';

/**
 * Haftalık performans kartı — istatistik ekranı ekran dışında render eder,
 * react-native-view-shot ile PNG yakalanıp paylaşılır/kaydedilir.
 */
export const ShareCard = React.forwardRef<View>(function ShareCard(_, ref) {
  const lang: Lang = 'tr';
  const focusLog = useStats((s) => s.focusLog);
  const goalsLog = useStats((s) => s.goalsLog);
  const badgeCount = Object.keys(useBadges((s) => s.unlocked)).length;
  const streak = useStreak((s) => s.current);

  const keys = lastNDays(7);
  const { minutes, sessions } = sumWeek(keys, focusLog);
  const goalsDone = keys.reduce((acc, k) => acc + (goalsLog[k]?.done ?? 0), 0);

  const range = weekRangeLabel(weekStartKey(new Date()), todayKey(), lang);

  return (
    <View ref={ref} className="w-[330px] overflow-hidden rounded-[32px] border border-border/70 bg-[#0C0C0E] p-7">
      {/* Dekoratif parıltılar */}
      <View pointerEvents="none" className="absolute inset-0">
        <Svg width={330} height={430} style={{ position: 'absolute' }}>
          <Circle cx={305} cy={20} r={110} fill="#10B981" opacity={0.09} />
          <Circle cx={10} cy={410} r={130} fill="#10B981" opacity={0.06} />
          <Path d="M 0 0 H 330 V 4 H 0 Z" fill="#10B981" opacity={0.9} />
        </Svg>
      </View>

      {/* Marka */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-primary">
            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
          </View>
          <View>
            <Text className="font-sans-bold text-base text-foreground">Takip Asistan</Text>
            <Text variant="micro" className="text-muted-foreground">
              Odak · Hedef · Seri
            </Text>
          </View>
        </View>
        <Text variant="micro" className="text-primary">
          HAFTALIK RAPOR
        </Text>
      </View>

      {/* Ana metrik */}
      <View className="mt-8 items-start">
        <Text className="font-sans-extrabold text-[64px] leading-[64px] text-foreground">
          {minutes}
        </Text>
        <Text variant="large" className="mt-1 text-primary">
          {lang === 'tr' ? 'dk odak' : 'min focus'}
        </Text>
      </View>

      {/* Mini metrikler */}
      <View className="mt-7 flex-row gap-3">
        <ShareStat icon={Timer} label={lang === 'tr' ? 'oturum' : 'sessions'} value={`${sessions}`} />
        <ShareStat icon={Target} label={lang === 'tr' ? 'hedef' : 'goals'} value={`${goalsDone}`} />
        <ShareStat icon={Award} label={lang === 'tr' ? 'rozet' : 'badges'} value={`${badgeCount}`} />
      </View>

      {/* Alt satır */}
      <View className="mt-7 flex-row items-center justify-between border-t border-border/50 pt-5">
        <View className="flex-row items-center gap-2">
          <Flame size={20} color="#F59E0B" />
          <Text className="font-sans-bold text-lg text-warning">
            {streak} {lang === 'tr' ? 'gün seri' : 'day streak'}
          </Text>
        </View>
        <Text variant="small" className="text-muted-foreground">
          {range}
        </Text>
      </View>
    </View>
  );
});

function ShareStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-border/50 bg-secondary/50 p-3">
      <Icon size={15} color="#71717A" />
      <Text className="mt-2 font-sans-bold text-lg text-foreground">{value}</Text>
      <Text variant="micro" className="text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}
