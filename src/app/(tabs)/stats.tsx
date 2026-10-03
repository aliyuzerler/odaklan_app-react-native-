import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Target,
  TrendingUp,
  Share2,
  ImageDown,
  BarChart3,
} from 'lucide-react-native';
import { useT, useLang } from '@/hooks/use-t';
import { useStats, sumWeek, weekSeries, bestDayKey } from '@/store/stats';
import { useBadges } from '@/store/badges';
import {
  lastNDays,
  formatMinutes,
  dateShort,
  weekRangeLabel,
  weekStartKey,
  todayKey,
} from '@/lib/date';
import { Haptics } from '@/lib/haptics';
import { shareViewAsImage, saveViewToLibrary } from '@/lib/share';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsTriggerLabel } from '@/components/ui/tabs';
import { WeeklyChart } from '@/components/stats/weekly-chart';
import { StreakStrip } from '@/components/stats/streak-strip';
import { ShareCard } from '@/components/stats/share-card';
import { BannerAdView } from '@/components/ads/banner-ad';

export default function StatsScreen() {
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();

  const focusLog = useStats((s) => s.focusLog);
  const goalsLog = useStats((s) => s.goalsLog);
  const badgeCount = Object.keys(useBadges((s) => s.unlocked)).length;

  const [metric, setMetric] = React.useState<'minutes' | 'goalsDone'>('minutes');
  const shareRef = React.useRef<React.ComponentRef<typeof ShareCard>>(null);
  const [busy, setBusy] = React.useState(false);

  const keys = lastNDays(7);
  const series = weekSeries(keys, focusLog, goalsLog).map((p, i) => ({
    ...p,
    label: dateShort(keys[i], lang),
  }));
  const { minutes, sessions } = sumWeek(keys, focusLog);
  const avg = Math.round(minutes / 7);
  const best = bestDayKey(keys, focusLog);
  const goalsTotal = keys.reduce((acc, k) => acc + (goalsLog[k]?.total ?? 0), 0);
  const goalsDone = keys.reduce((acc, k) => acc + (goalsLog[k]?.done ?? 0), 0);
  const goalsRate = goalsTotal > 0 ? Math.round((goalsDone / goalsTotal) * 100) : 0;

  const onShare = async () => {
    if (busy || !shareRef.current) return;
    setBusy(true);
    Haptics.share();
    try {
      const ok = await shareViewAsImage(shareRef, t('share.dialogTitle') as string);
      if (ok) {
        useStats.getState().registerShare();
        useBadges.getState().evaluate();
      }
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (busy || !shareRef.current) return;
    setBusy(true);
    Haptics.share();
    try {
      await saveViewToLibrary(shareRef);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Başlık */}
        <View className="px-6 pt-4">
          <Text variant="h2">{t('stats.title') as string}</Text>
          <Text variant="small" className="mt-1 text-muted-foreground">
            {weekRangeLabel(weekStartKey(new Date()), todayKey(), lang)}
          </Text>
        </View>

        {/* Özet kartları */}
        <View className="mt-5 flex-row gap-3 px-6">
          <StatCard icon={Clock} label={t('stats.weekTotal') as string} value={formatMinutes(minutes, lang)} color="#10B981" />
          <StatCard icon={TrendingUp} label={t('stats.dailyAvg') as string} value={formatMinutes(avg, lang)} color="#38BDF8" />
        </View>
        <View className="mt-3 flex-row gap-3 px-6">
          <StatCard icon={BarChart3} label={t('stats.sessions') as string} value={`${sessions}`} color="#F59E0B" />
          <StatCard icon={Target} label={t('stats.goalsRate') as string} value={`${goalsRate}%`} color="#8B5CF6" />
        </View>

        {/* Haftalık grafik */}
        <Card className="mx-6 mt-6">
          <View className="flex-row items-center justify-between px-5 pt-5">
            <Text variant="h4">{t('stats.last7') as string}</Text>
            <Tabs
              value={metric}
              onValueChange={(v) => {
                Haptics.tap();
                setMetric(v as 'minutes' | 'goalsDone');
              }}
              className="w-44"
            >
              <TabsList>
                <TabsTrigger value="minutes">
                  <TabsTriggerLabel active={metric === 'minutes'}>
                    {t('stats.metricFocus') as string}
                  </TabsTriggerLabel>
                </TabsTrigger>
                <TabsTrigger value="goalsDone">
                  <TabsTriggerLabel active={metric === 'goalsDone'}>
                    {t('stats.metricGoals') as string}
                  </TabsTriggerLabel>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </View>
          <View className="items-center px-4 pb-5 pt-2">
            {minutes === 0 && goalsDone === 0 ? (
              <View className="h-[210px] items-center justify-center gap-2">
                <BarChart3 size={30} color="#3F3F46" />
                <Text variant="small" className="text-center text-muted-foreground">
                  {t('stats.emptyWeek') as string}
                </Text>
              </View>
            ) : (
              <WeeklyChart data={series} metric={metric} lang={lang} />
            )}
          </View>
          {best && (
            <View className="border-t border-border/50 px-5 py-3">
              <Text variant="tiny" className="text-muted-foreground">
                {`${t('stats.bestDay') as string}: ${dateShort(best, lang)} · ${formatMinutes(focusLog[best]?.minutes ?? 0, lang)}`}
              </Text>
            </View>
          )}
        </Card>

        {/* Streak şeridi */}
        <View className="mt-4 px-6">
          <StreakStrip />
        </View>

        {/* Paylaşım */}
        <Card className="mx-6 mt-4">
          <View className="flex-row items-center gap-3 px-5 pt-5">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <Share2 size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text variant="h4">{t('stats.shareCard') as string}</Text>
              <Text variant="tiny" className="text-muted-foreground">
                {t('stats.shareHint') as string}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3 px-5 pb-5 pt-4">
            <Pressable
              onPress={onShare}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 active:opacity-80"
            >
              <Share2 size={16} color="#064E3B" />
              <Text variant="small" className="font-sans-semibold text-primary-foreground">
                {t('stats.shareCard') as string}
              </Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3.5 active:opacity-80"
            >
              <ImageDown size={16} color="#A1A1AA" />
              <Text variant="small" className="font-sans-semibold text-muted-foreground">
                {t('share.saveCard') as string}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Reklam */}
        <View className="mt-6 px-6">
          <BannerAdView />
        </View>
      </ScrollView>

      {/* Yakalanacak kart — ekran dışı render edilir */}
      <View className="absolute -left-[500px] top-0" pointerEvents="none">
        <ShareCard ref={shareRef} />
      </View>
    </View>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="flex-1 p-4">
      <Icon size={16} color={color} />
      <Text className="mt-2.5 font-sans-bold text-xl text-foreground">{value}</Text>
      <Text variant="micro" className="mt-0.5 text-muted-foreground">
        {label}
      </Text>
    </Card>
  );
}
