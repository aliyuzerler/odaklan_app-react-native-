import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { isExpoGo } from './environment';
import { useSettings } from '@/store/settings';
import { resolveLocale, createT } from './i18n';
import type { TimerType } from './types';

export const NOTIFICATION_CHANNEL = 'takip-asistan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function t() {
  return createT(resolveLocale(useSettings.getState().lang));
}

/** Uygulama açılışında: Android kanalı oluştur */
export async function initNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'android' && !isExpoGo()) {
      const dict = t();
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
        name: dict('notifications.channelName') as string,
        description: dict('notifications.channelDesc') as string,
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
      console.log('[notif] kanal hazır:', NOTIFICATION_CHANNEL);
    }
  } catch (e) {
    console.warn('[notif] kanal oluşturulamadı:', (e as Error)?.message);
  }
}

export type NotifPermissionStatus = {
  granted: boolean;
  canAskAgain: boolean;
};

export async function getNotifPermissionStatus(): Promise<NotifPermissionStatus> {
  try {
    const current = await Notifications.getPermissionsAsync();
    return { granted: current.granted, canAskAgain: current.canAskAgain };
  } catch {
    return { granted: false, canAskAgain: false };
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  return (await getNotifPermissionStatus()).granted;
}

/** Sistem izin diyaloğunu gösterir */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.requestPermissionsAsync();
    console.log('[notif] izin isteği sonucu:', JSON.stringify(current));
    return current.granted;
  } catch (e) {
    console.warn('[notif] izin isteği hata:', (e as Error)?.message);
    return false;
  }
}

/** İzin kalıcı olarak reddedildiyse uygulama ayarlarını açar */
export function openAppNotificationSettings(): void {
  void Linking.openSettings();
}

/**
 * Uygulamanın sistem ayarları sayfasını açar (bildirim + pil aynı ekranda).
 * Kullanıcı Pil → "Kısıtlama yok" seçerek agresif ROM'ların (Xiaomi, Huawei,
 * Oppo…) arka plan alarm ertelemesini devre dışı bırakabilir.
 * Not: Linking.openSettings Android'de ACTION_APPLICATION_DETAILS_SETTINGS açar.
 */
export function openAppBatterySettings(): void {
  void Linking.openSettings().catch(() => {});
}

/**
 * Timer bitişi için OS-seviyesinde lokal bildirim planlar.
 * Uygulama arka planda/öldürülmüş olsa bile süre dolunca tetiklenir.
 */
export async function scheduleTimerEnd(
  type: TimerType,
  seconds: number,
): Promise<string | null> {
  if (!useSettings.getState().notificationsOn) {
    console.log('[notif] ayarlardan kapalı — planlanmadı');
    return null;
  }
  if (isExpoGo()) return null;

  try {
    const { granted } = await getNotifPermissionStatus();
    if (!granted) {
      console.warn('[notif] İZİN YOK — bildirim planlanmadı (Android ayarlarından bildirimlere izin ver)');
      return null;
    }

    const dict = t();
    const isFocus = type === 'focus';
    const breakMin = useSettings.getState().breakMin;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: (isFocus
          ? dict('notifications.focusDoneTitle')
          : dict('notifications.breakDoneTitle')) as string,
        body: isFocus
          ? (dict('notifications.focusDoneBody', { minutes: breakMin }) as string)
          : (dict('notifications.breakDoneBody') as string),
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        repeats: false,
        seconds: Math.max(5, Math.ceil(seconds)),
        channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNEL : undefined,
      },
    });
    console.log(`[notif] planlandı (${id}) — ${Math.ceil(seconds)} sn sonra tetiklenecek`);
    return id;
  } catch (e) {
    console.warn('[notif] planlama HATASI:', (e as Error)?.message);
    return null;
  }
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // zaten iptal/tetiklenmiş olabilir
  }
}

/** Bildirime dokunulduğunda odak sekmesine götür */
export function addNotificationResponseListener(
  handler: () => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(() => handler());
}
