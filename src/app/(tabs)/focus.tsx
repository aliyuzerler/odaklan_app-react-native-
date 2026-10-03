import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BellOff,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
  Zap,
} from 'lucide-react-native';
import { useT, useLang } from '@/hooks/use-t';
import { useRemainingMs } from '@/hooks/use-remaining';
import { useTimer, phaseDurationMs } from '@/store/timer';
import { useSettings } from '@/store/settings';
import { useStats } from '@/store/stats';
import { todayKey, mmss, formatMinutes } from '@/lib/date';
import { Haptics } from '@/lib/haptics';
import {
  requestNotificationPermission,
  getNotifPermissionStatus,
  openAppNotificationSettings,
} from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { TimerRing } from '@/components/focus/timer-ring';

const FOCUS_COLOR = '#10B981';
const BREAK_COLOR = '#F59E0B';

export default function FocusScreen() {
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();

  const status = useTimer((s) => s.status);
  const type = useTimer((s) => s.type);
  const focusInGroup = useTimer((s) => s.focusInGroup);
  const remainingMs = useRemainingMs();

  const focusMin = useSettings((s) => s.focusMin);
  const breakMin = useSettings((s) => s.breakMin);
  const totalMs = useMemo(
    () => phaseDurationMs(type, focusInGroup),
    [type, focusInGroup, focusMin, breakMin],
  );

  const sessionsToday = useStats((s) => s.focusLog[todayKey()]?.sessions ?? 0);
  const minutesToday = useStats((s) => s.focusLog[todayKey()]?.minutes ?? 0);

  const isFocus = type === 'focus';
  const color = isFocus ? FOCUS_COLOR : BREAK_COLOR;
  const progress = status === 'idle' ? 0 : 1 - remainingMs / totalMs;
  const displayMs = status === 'idle' ? totalMs : remainingMs;

  // Bildirim izni durumu — reddedildiyse ekranda uyar
  const [notifStatus, setNotifStatus] = useState({ granted: true, canAskAgain: true });
  const refreshNotifStatus = useCallback(() => {
    void getNotifPermissionStatus().then(setNotifStatus);
  }, []);

  useEffect(() => {
    refreshNotifStatus();
  }, [refreshNotifStatus, status]);

  // İlk başlatmada bildirim izni iste
  const handleStart = () => {
    Haptics.buttonPress();
    void (async () => {
      const status0 = await getNotifPermissionStatus();
      if (!status0.granted && status0.canAskAgain) {
        await requestNotificationPermission();
      }
      useTimer.getState().start();
      refreshNotifStatus();
    })();
  };

  const primaryAction = () => {
    if (status === 'running') {
      Haptics.buttonPress();
      useTimer.getState().pause();
    } else if (status === 'paused') {
      Haptics.buttonPress();
      useTimer.getState().resume();
    } else if (status === 'done') {
      Haptics.success();
      useTimer.getState().start();
    } else {
      handleStart();
    }
  };

  const phaseLabel =
    type === 'focus'
      ? (t('focus.focusSession') as string)
      : focusInGroup >= 4
        ? (t('focus.longBreakSession') as string)
        : (t('focus.breakSession') as string);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center px-6" style={{ paddingBottom: 130 }}>
        {/* Faz rozeti + tur göstergesi */}
        <View className="mt-6 flex-row items-center gap-3">
          <View
            className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-1.5"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}14` }}
          >
            {isFocus ? (
              <Zap size={14} color={color} strokeWidth={2.4} />
            ) : (
              <Coffee size={14} color={color} strokeWidth={2.4} />
            )}
            <Text variant="tiny" className="font-sans-semibold" style={{ color }}>
              {phaseLabel}
            </Text>
          </View>

          {/* Tur noktaları */}
          <View className="flex-row items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: i < focusInGroup % 4 ? FOCUS_COLOR : '#27272A' }}
              />
            ))}
            <Text variant="micro" className="ml-1 text-muted-foreground">
              {t('focus.round') as string} {(focusInGroup % 4) + 1}/4
            </Text>
          </View>
        </View>

        {/* Bildirim izni uyarısı */}
        {!notifStatus.granted && (
          <Pressable
            onPress={() => {
              if (notifStatus.canAskAgain) {
                void requestNotificationPermission().then(refreshNotifStatus);
              } else {
                openAppNotificationSettings();
              }
            }}
            className="mx-6 mt-4"
          >
            <Card className="flex-row items-center gap-3 border-warning/40 bg-warning/10 p-3.5">
              <BellOff size={16} color="#F59E0B" />
              <Text variant="tiny" className="flex-1 text-warning">
                {t('focus.notifRationale') as string}
              </Text>
              <Text variant="tiny" className="font-sans-semibold text-warning">
                {notifStatus.canAskAgain
                  ? (t('focus.grant') as string)
                  : (t('focus.openSettings') as string)}
              </Text>
            </Card>
          </Pressable>
        )}

        {/* Halka + süre */}
        <View className="mt-10 items-center justify-center">
          <TimerRing progress={progress} color={color}>
            <View className="items-center gap-2">
              <Text
                className="font-sans-extrabold text-6xl text-foreground"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {mmss(displayMs)}
              </Text>
              <Text variant="small" className="text-muted-foreground">
                {status === 'done'
                  ? (isFocus ? (t('focus.focusDoneTitle') as string) : (t('focus.breakDoneTitle') as string))
                  : phaseLabel}
              </Text>
            </View>
          </TimerRing>
        </View>

        {/* Durum açıklaması */}
        <View className="mt-8 h-16 items-center justify-center">
          {status === 'done' && (
            <Text variant="small" className="text-center text-muted-foreground">
              {isFocus
                ? (t('focus.breakDoneDesc') as string)
                : (t('focus.focusDoneDesc') as string)}
            </Text>
          )}
          {status === 'idle' && !isFocus && (
            <Text variant="small" className="text-center text-muted-foreground">
              {t('focus.focusDoneDesc') as string}
            </Text>
          )}
        </View>

        {/* Kontroller */}
        <View className="flex-row items-center gap-4">
          {(status === 'paused' || status === 'running') && (
            <>
              <Button variant="outline" size="icon" onPress={() => {
                Haptics.buttonPress();
                useTimer.getState().stop();
              }}>
                <RotateCcw size={18} color="#A1A1AA" />
              </Button>

              <Button
                className="h-16 w-16 rounded-full"
                style={{ backgroundColor: color }}
                onPress={primaryAction}
              >
                {status === 'running' ? (
                  <Pause size={26} color={isFocus ? '#064E3B' : '#451A03'} />
                ) : (
                  <Play size={26} color={isFocus ? '#064E3B' : '#451A03'} />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onPress={() => {
                  Haptics.buttonPress();
                  useTimer.getState().skip();
                }}
              >
                <SkipForward size={18} color="#A1A1AA" />
              </Button>
            </>
          )}

          {(status === 'idle' || status === 'done') && (
            <>
              {status === 'done' && (
                <Button
                  variant="outline"
                  size="icon"
                  onPress={() => {
                    Haptics.buttonPress();
                    useTimer.getState().stop();
                  }}
                >
                  <RotateCcw size={18} color="#A1A1AA" />
                </Button>
              )}
              <Button
                className="h-14 px-10 rounded-full"
                style={{ backgroundColor: color }}
                onPress={primaryAction}
              >
                <View className="flex-row items-center gap-2">
                  {status === 'done' ? (
                    <Zap size={18} color={isFocus ? '#064E3B' : '#451A03'} />
                  ) : (
                    <Play size={18} color={isFocus ? '#064E3B' : '#451A03'} />
                  )}
                  <Text className="text-base" style={{ color: isFocus ? '#064E3B' : '#451A03' }}>
                    {status === 'done'
                      ? (isFocus
                        ? (t('focus.nextRound') as string)
                        : (t('focus.startBreak') as string))
                      : (isFocus ? (t('focus.startFocus') as string) : (t('focus.startBreak') as string))}
                  </Text>
                </View>
              </Button>
            </>
          )}
        </View>

        {/* Bugünkü özet */}
        <Card className="mt-10 w-full flex-row items-center justify-around p-4">
          <View className="items-center gap-1">
            <View className="flex-row items-center gap-1.5">
              <TimerIcon size={15} color="#71717A" />
              <Text className="font-sans-bold text-xl text-foreground">{sessionsToday}</Text>
            </View>
            <Text variant="tiny" className="text-muted-foreground">
              {t('focus.sessionsToday') as string}
            </Text>
          </View>
          <View className="h-8 w-px bg-border" />
          <View className="items-center gap-1">
            <Text className="font-sans-bold text-xl text-primary">
              {formatMinutes(minutesToday, lang)}
            </Text>
            <Text variant="tiny" className="text-muted-foreground">
              {t('focus.minutesToday', { minutes: minutesToday }) as string}
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
}
