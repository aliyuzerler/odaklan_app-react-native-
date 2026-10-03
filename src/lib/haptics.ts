import * as HapticsModule from 'expo-haptics';

/**
 * Merkezi haptik yardımcıları — tüm dokunuş geri bildirimleri tek yerden.
 * Desteklenmeyen cihazlarda sessizce yok sayar.
 */
function safe(fn: () => void) {
  try {
    fn();
  } catch {
    // haptics not available
  }
}

export const Haptics = {
  tap: () => safe(() => HapticsModule.selectionAsync()),
  success: () =>
    safe(() =>
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success),
    ),
  goalDone: () =>
    safe(() =>
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success),
    ),
  goalRemoved: () =>
    safe(() =>
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Warning),
    ),
  badgeUnlocked: () =>
    safe(() =>
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success),
    ),
  timerDone: () =>
    safe(() =>
      HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success),
    ),
  buttonPress: () =>
    safe(() => HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Light)),
  share: () =>
    safe(() => HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Medium)),
};
