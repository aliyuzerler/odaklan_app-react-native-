import { captureRef, type CaptureOptions } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import type { RefObject } from 'react';
import type { View } from 'react-native';

/**
 * Bir View'ı PNG olarak yakalayıp sistem paylaşım sayfasıyla açar.
 */
export async function shareViewAsImage(
  ref: RefObject<View | null>,
  dialogTitle: string,
): Promise<boolean> {
  try {
    const uri = await captureRef(ref, { format: 'png', quality: 1 } satisfies CaptureOptions);
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle,
      UTI: 'image.png',
    });
    return true;
  } catch {
    return false;
  }
}

export type SaveResult = 'saved' | 'denied' | 'error';

/** Bir View'ı PNG olarak galeriye kaydeder */
export async function saveViewToLibrary(ref: RefObject<View | null>): Promise<SaveResult> {
  try {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) return 'denied';
    const uri = await captureRef(ref, { format: 'png', quality: 1 } satisfies CaptureOptions);
    await MediaLibrary.saveToLibraryAsync(uri);
    return 'saved';
  } catch {
    return 'error';
  }
}
