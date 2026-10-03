import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minus, Plus, Award, Globe, Bell, Clock, Info, Trash2, Check } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useT } from '@/hooks/use-t';
import { useSettings, FOCUS_MIN, BREAK_MIN, LONG_BREAK_MIN } from '@/store/settings';
import { useStats } from '@/store/stats';
import { useStreak } from '@/store/streak';
import { useBadges } from '@/store/badges';
import { useGoals } from '@/store/goals';
import { useTimer } from '@/store/timer';
import { BADGES } from '@/lib/badges';
import { Haptics } from '@/lib/haptics';
import {
  getNotifPermissionStatus,
  openAppNotificationSettings,
  openAppBatterySettings,
  NOTIFICATION_CHANNEL,
  type NotifPermissionStatus,
} from '@/lib/notifications';
import type { LangSetting } from '@/lib/types';
import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeGrid } from '@/components/badges/badge-grid';

export default function ProfileScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();

  const lang = useSettings((s) => s.lang);
  const focusMin = useSettings((s) => s.focusMin);
  const breakMin = useSettings((s) => s.breakMin);
  const longBreakMin = useSettings((s) => s.longBreakMin);
  const notificationsOn = useSettings((s) => s.notificationsOn);
  const unlockedCount = Object.keys(useBadges((s) => s.unlocked)).length;

  const [resetOpen, setResetOpen] = React.useState(false);

  const langOptions: { value: LangSetting; label: string }[] = [
    { value: 'system', label: t('profile.langSystem') as string },
    { value: 'tr', label: t('profile.langTr') as string },
    { value: 'en', label: t('profile.langEn') as string },
  ];

  const resetAll = () => {
    useStats.getState().resetAll();
    useStreak.getState().resetAll();
    useBadges.getState().resetAll();
    useGoals.getState().clearToday();
    useTimer.getState().stop();
    Haptics.goalRemoved();
    setResetOpen(false);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="px-6 pt-4">
          <Text variant="h2">{t('profile.title') as string}</Text>
        </View>

        {/* Rozetler */}
        <Card className="mx-6 mt-5">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle className="flex-row items-center gap-2">
                <Award size={16} color="#F59E0B" />
                {t('profile.badges') as string}
              </CardTitle>
              <Text variant="tiny" className="font-sans-semibold text-muted-foreground">
                {t('profile.badgesUnlocked', { count: unlockedCount, total: BADGES.length }) as string}
              </Text>
            </View>
          </CardHeader>
          <View className="px-4 pb-4 pt-3">
            <BadgeGrid />
          </View>
        </Card>

        {/* Ayarlar */}
        <Card className="mx-6 mt-4">
          <CardHeader>
            <CardTitle>{t('profile.settings') as string}</CardTitle>
          </CardHeader>
          <View className="gap-4 px-5 pb-5 pt-3">
            {/* Dil */}
            <View className="gap-2.5">
              <SettingLabel icon={Globe} label={t('profile.language') as string} />
              <View className="flex-row gap-2">
                {langOptions.map((opt) => {
                  const active = lang === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        Haptics.tap();
                        useSettings.getState().setLang(opt.value);
                      }}
                      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5"
                      style={{
                        borderColor: active ? '#10B98166' : '#232329',
                        backgroundColor: active ? '#10B9811A' : 'transparent',
                      }}
                    >
                      {active && <Check size={13} color="#34D399" />}
                      <Text
                        variant="tiny"
                        className={active ? 'font-sans-semibold text-primary' : 'text-muted-foreground'}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <DurationRow
              label={t('profile.focusDuration') as string}
              icon={Clock}
              value={focusMin}
              config={FOCUS_MIN}
              onChange={(v) => { useSettings.getState().setFocusMin(v); refreshTimerAfterSettingsChange(); }}
            />
            <DurationRow
              label={t('profile.breakDuration') as string}
              icon={Clock}
              value={breakMin}
              config={BREAK_MIN}
              onChange={(v) => { useSettings.getState().setBreakMin(v); refreshTimerAfterSettingsChange(); }}
            />
            <DurationRow
              label={t('profile.longBreakDuration') as string}
              icon={Clock}
              value={longBreakMin}
              config={LONG_BREAK_MIN}
              onChange={(v) => { useSettings.getState().setLongBreakMin(v); refreshTimerAfterSettingsChange(); }}
            />

            {/* Bildirimler */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2.5 pr-3">
                <Bell size={15} color="#71717A" />
                <View className="flex-1">
                  <Text variant="small" className="font-sans-medium text-foreground">
                    {t('profile.notifications') as string}
                  </Text>
                  <Text variant="tiny" className="text-muted-foreground">
                    {t('profile.notificationsDesc') as string}
                  </Text>
                </View>
              </View>
              <Switch
                checked={notificationsOn}
                onCheckedChange={(v) => {
                  Haptics.tap();
                  useSettings.getState().setNotificationsOn(v);
                }}
              />
            </View>
          </View>
        </Card>

        {/* Hakkında */}
        <Card className="mx-6 mt-4">
          <CardHeader>
            <CardTitle className="flex-row items-center gap-2">
              <Info size={15} color="#71717A" />
              {t('profile.about') as string}
            </CardTitle>
          </CardHeader>
          <View className="flex-row items-center justify-between px-5 pb-4 pt-1">
            <Text variant="small" className="text-muted-foreground">
              {t('profile.version') as string}
            </Text>
            <Text variant="small" className="font-sans-medium text-foreground">
              {Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>
        </Card>

        {/* Bildirim testi — zincirin neresi kırılıyor görürsün */}
        <NotificationTestCard />

        {/* Verileri sıfırla */}
        <View className="mx-6 mt-4">
          <Button
            variant="outline"
            className="border-destructive/30"
            onPress={() => setResetOpen(true)}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text className="font-sans-semibold text-destructive">
              {t('profile.resetData') as string}
            </Text>
          </Button>
        </View>
      </ScrollView>

      {/* Sıfırlama onayı */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <View className="gap-1.5">
            <DialogTitle>{t('profile.resetConfirmTitle') as string}</DialogTitle>
            <DialogDescription>{t('profile.resetConfirmDesc') as string}</DialogDescription>
          </View>
          <View className="flex-row justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                <Text className="text-muted-foreground">{t('common.cancel') as string}</Text>
              </Button>
            </DialogClose>
            <Button variant="destructive" size="sm" onPress={resetAll}>
              <Text className="text-destructive-foreground">{t('common.delete') as string}</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}

function SettingLabel({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Icon size={15} color="#71717A" />
      <Text variant="small" className="font-sans-medium text-foreground">
        {label}
      </Text>
    </View>
  );
}

function DurationRow({
  label,
  icon,
  value,
  config,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  value: number;
  config: { min: number; max: number; step: number };
  onChange: (v: number) => void;
}) {
  const t = useT();
  const dec = () => onChange(Math.max(config.min, value - config.step));
  const inc = () => onChange(Math.min(config.max, value + config.step));
  const atMin = value - config.step < config.min;
  const atMax = value + config.step > config.max;

  return (
    <View className="flex-row items-center justify-between">
      <SettingLabel icon={icon} label={label} />
      <View className="flex-row items-center gap-3">
        <StepperButton onPress={dec} disabled={atMin}>
          <Minus size={14} color={atMin ? '#3F3F46' : '#A1A1AA'} />
        </StepperButton>
        <View className="w-14 flex-row items-baseline justify-center">
          <Text className="font-sans-bold text-base text-foreground">{value}</Text>
          <Text variant="tiny" className="text-muted-foreground">
            {' '}
            {t('common.minute') as string}
          </Text>
        </View>
        <StepperButton onPress={inc} disabled={atMax}>
          <Plus size={14} color={atMax ? '#3F3F46' : '#A1A1AA'} />
        </StepperButton>
      </View>
    </View>
  );
}

/** Süre değişince timer bekleyen süresini yeni ayardan tazeler (koşu dışındaysa) */
function refreshTimerAfterSettingsChange() {
  const timer = useTimer.getState();
  if (timer.status === 'idle' || timer.status === 'done') {
    timer.stop();
  }
}

function StepperButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          Haptics.tap();
          onPress();
        }
      }}
      disabled={disabled}
      className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/50"
    >
      {children}
    </Pressable>
  );
}

/**
 * Bildirim zinciri tanılaması: izin → kanal → planlama → teslimat.
 * 3 saniyelik test bildirimi ile ucu uca çalıştığını ekranda doğrular.
 */
function NotificationTestCard() {
  const t = useT();
  const [perm, setPerm] = React.useState<NotifPermissionStatus | null>(null);
  const [scheduledCount, setScheduledCount] = React.useState(0);
  const [result, setResult] = React.useState<string | null>(null);

  const refresh = React.useCallback(() => {
    void getNotifPermissionStatus().then(setPerm);
    void Notifications.getAllScheduledNotificationsAsync().then((ns) =>
      setScheduledCount(ns.length),
    );
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const sendTest = () => {
    void (async () => {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: (t('profile.testTitle') as string) || 'Test 🔔',
            body: t('profile.testBody') as string,
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            repeats: false,
            seconds: 3,
            channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNEL : undefined,
          },
        });
        setResult(`${t('profile.testScheduled') as string} · ${id.slice(0, 8)}…`);
        console.log('[notif] test planlandı:', id);
        refresh();
      } catch (e) {
        setResult(`⚠ ${(e as Error).message}`);
        console.warn('[notif] test hatası:', e);
      }
    })();
  };

  return (
    <Card className="mx-6 mt-4">
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <Bell size={15} color="#71717A" />
          {t('profile.notifTest') as string}
        </CardTitle>
      </CardHeader>
      <View className="gap-2 px-5 pb-5 pt-2">
        <Text variant="tiny" className="text-muted-foreground">
          {`• ${t('profile.testPermission') as string}: ${
            perm === null
              ? '…'
              : perm.granted
                ? (t('profile.testGranted') as string)
                : (t('profile.testDenied') as string)
          }`}
        </Text>
        <Text variant="tiny" className="text-muted-foreground">
          {`• ${t('profile.testPending') as string}: ${scheduledCount}`}
        </Text>
        {result && (
          <Text variant="tiny" className="font-sans-semibold text-primary">
            {result}
          </Text>
        )}
        <Text variant="micro" className="leading-4 text-muted-foreground/70">
          {t('profile.testBatteryHint') as string}
        </Text>
        <View className="mt-1 flex-row gap-2">
          <Button size="sm" onPress={sendTest} className="flex-1">
            <Text className="text-primary-foreground">
              {t('profile.testSend') as string}
            </Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              refresh();
              openAppBatterySettings();
            }}
          >
            <Text className="text-muted-foreground">
              {t('profile.testBattery') as string}
            </Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              refresh();
              openAppNotificationSettings();
            }}
          >
            <Text className="text-muted-foreground">
              {t('focus.openSettings') as string}
            </Text>
          </Button>
        </View>
      </View>
    </Card>
  );
}
