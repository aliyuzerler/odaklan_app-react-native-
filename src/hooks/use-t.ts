import { useMemo } from 'react';
import { useSettings } from '@/store/settings';
import { createT, resolveLocale, type TFunction } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

/** Çeviri fonksiyonu — dil değişince yeniden oluşturulur */
export function useT(): TFunction {
  const lang = useSettings((s) => s.lang);
  return useMemo(() => createT(resolveLocale(lang)), [lang]);
}

/** Çözümlenmiş dil — tarih/biçim yardımcıları için */
export function useLang(): Lang {
  const lang = useSettings((s) => s.lang);
  return useMemo(() => resolveLocale(lang), [lang]);
}
