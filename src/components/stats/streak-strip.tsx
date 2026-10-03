import { View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { lastNDays } from '@/lib/date';
import { useStreak } from '@/store/streak';
import { useStats } from '@/store/stats';
import { useT } from '@/hooks/use-t';
import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

/** Son 14 günün aktivite şeridi — aktif günler emerald yanar */
export function StreakStrip() {
  const t = useT();
  const streak = useStreak((s) => s.current);
  const focusLog = useStats((s) => s.focusLog);
  const goalsLog = useStats((s) => s.goalsLog);
  const keys = lastNDays(14);
  const today = keys[keys.length - 1];

  const isActive = (key: string) =>
    (focusLog[key]?.sessions ?? 0) > 0 ||
    (goalsLog[key]?.done ?? 0) > 0 ||
    (key === today && streak > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <Flame size={16} color="#F59E0B" />
          {t('stats.streakStrip') as string}
        </CardTitle>
      </CardHeader>
      <View className="flex-row items-end justify-between px-5 pb-5 pt-4">
        {keys.map((key) => {
          const active = isActive(key);
          return (
            <View key={key} className="items-center gap-1.5">
              <View
                className="w-2.5 rounded-full self-center"
                style={{
                  height: active ? 30 : 18,
                  backgroundColor: active ? '#10B981' : '#1C1C21',
                }}
              />
              <Text variant="micro" className="text-muted-foreground/60" style={{ fontSize: 8 }}>
                {key.slice(-2)}
              </Text>
            </View>
          );
        })}
      </View>
      <View className="flex-row items-center gap-4 border-t border-border/50 px-5 py-3">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text variant="tiny" className="text-muted-foreground">
            {t('stats.activeDay') as string}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-[#1C1C21]" />
          <Text variant="tiny" className="text-muted-foreground">
            {t('stats.idleDay') as string}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text variant="tiny" className="font-sans-semibold text-warning">
            {t('today.streakDays', { count: streak }) as string}
          </Text>
        </View>
      </View>
    </Card>
  );
}
