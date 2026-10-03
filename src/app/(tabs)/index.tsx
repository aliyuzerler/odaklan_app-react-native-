import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, ListTodo, Plus, Sparkles, Timer } from 'lucide-react-native';
import { useT, useLang } from '@/hooks/use-t';
import { useGoals, MAX_DAILY_GOALS } from '@/store/goals';
import { useStreak } from '@/store/streak';
import { dateLong, todayKey } from '@/lib/date';
import { Haptics } from '@/lib/haptics';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { GoalItem } from '@/components/goals/goal-item';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import { ProgressRing } from '@/components/goals/progress-ring';
import { BannerAdView } from '@/components/ads/banner-ad';

export default function TodayScreen() {
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const goals = useGoals((s) => s.items);
  const streak = useStreak((s) => s.current);
  const [dialogOpen, setDialogOpen] = useState(false);

  const done = goals.filter((g) => g.done).length;
  const progress = goals.length > 0 ? done / goals.length : 0;
  const allDone = goals.length === MAX_DAILY_GOALS && done === MAX_DAILY_GOALS;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('today.morning');
    if (hour < 18) return t('today.afternoon');
    return t('today.evening');
  }, [t]);

  const handleAdd = (title: string): boolean => {
    const ok = useGoals.getState().add(title);
    if (ok) Haptics.tap();
    return ok;
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Üst bilgi */}
        <View className="flex-row items-start justify-between px-6 pt-4">
          <View className="gap-1">
            <Text variant="small" className="text-muted-foreground">
              {dateLong(todayKey(), lang)}
            </Text>
            <Text variant="h2">{greeting as string}</Text>
          </View>

          {/* Streak çipi */}
          <View className="flex-row items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-3 py-1.5">
            <Flame size={15} color="#F59E0B" strokeWidth={2.2} />
            <Text variant="tiny" className="font-sans-semibold text-warning">
              {streak > 0
                ? (t('today.streakDays', { count: streak }) as string)
                : (t('today.streakStart') as string)}
            </Text>
          </View>
        </View>

        {/* Günlük ilerleme kartı */}
        <Card className="mx-6 mt-5 flex-row items-center gap-5 p-5">
          <ProgressRing progress={progress} size={72} strokeWidth={7}>
            <Text className="font-sans-bold text-lg text-foreground">
              {done}/{goals.length || 0}
            </Text>
          </ProgressRing>
          <View className="flex-1 gap-1">
            {allDone ? (
              <>
                <Text variant="h4" className="text-primary">
                  {t('today.allDoneTitle') as string}
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  {t('today.allDoneDesc') as string}
                </Text>
              </>
            ) : (
              <>
                <Text variant="h4">{t('today.todayProgress') as string}</Text>
                <Text variant="small" className="text-muted-foreground">
                  {t('today.completed', { done, total: goals.length }) as string}
                </Text>
              </>
            )}
          </View>
          {allDone && <Sparkles size={26} color="#10B981" />}
        </Card>

        {/* Hedef listesi */}
        <View className="mt-6 gap-3 px-6">
          <View className="flex-row items-center gap-2">
            <ListTodo size={17} color="#71717A" />
            <Text variant="micro" className="text-muted-foreground">
              {t('today.goalsTitle') as string}
            </Text>
          </View>

          {goals.length === 0 && (
            <Card className="items-center gap-1.5 border-dashed p-8">
              <Timer size={30} color="#3F3F46" />
              <Text variant="h4" className="mt-2 text-foreground/90">
                {t('today.emptyTitle') as string}
              </Text>
              <Text variant="small" className="text-center text-muted-foreground">
                {t('today.emptyDesc') as string}
              </Text>
            </Card>
          )}

          {goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onToggle={(id) => useGoals.getState().toggle(id)}
              onDelete={(id) => useGoals.getState().remove(id)}
            />
          ))}

          {goals.length > 0 && goals.length < MAX_DAILY_GOALS && (
            <AddGoalButton onPress={() => setDialogOpen(true)} label={t('today.addGoal') as string} />
          )}

          {goals.length === MAX_DAILY_GOALS && !allDone && (
            <Text variant="tiny" className="text-center text-muted-foreground/70">
              {t('today.maxReached') as string}
            </Text>
          )}
        </View>

        {/* Reklam alanı */}
        <View className="mt-8 px-6">
          <BannerAdView />
        </View>
      </ScrollView>

      {/* Sabit ekleme butonu (liste dolu değilken) */}
      {goals.length === 0 && (
        <View
          className="absolute inset-x-0 px-6"
          style={{ bottom: 140 }}
          pointerEvents="box-none"
        >
          <AddGoalButton onPress={() => setDialogOpen(true)} label={t('today.addGoal') as string} />
        </View>
      )}

      <AddGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAdd} />
    </View>
  );
}

function AddGoalButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.buttonPress();
        onPress();
      }}
      className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-4 active:opacity-70"
    >
      <Plus size={18} color="#10B981" strokeWidth={2.4} />
      <Text className="font-sans-semibold text-primary">{label}</Text>
    </Pressable>
  );
}
