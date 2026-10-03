import type { Lang } from './types';

/** Yerel saat dilimine göre YYYY-MM-DD anahtarı */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function yesterdayKey(): string {
  return dateKey(addDays(new Date(), -1));
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Bugün dahil son n günün anahtarları (eskiden yeniye) */
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dateKey(addDays(end, -i)));
  }
  return keys;
}

/** İki gün anahtarı arasındaki tam gün farkı (a → b) */
export function diffDays(aKey: string, bKey: string): number {
  const a = keyToDate(aKey);
  const b = keyToDate(bKey);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Haftanın Pazartesi başlangıç anahtarı */
export function weekStartKey(d: Date = new Date()): string {
  const c = new Date(d);
  const dow = (c.getDay() + 6) % 7; // Pazartesi = 0
  return dateKey(addDays(c, -dow));
}

const LOCALE_MAP: Record<Lang, string> = { tr: 'tr-TR', en: 'en-US' };

/** Kısa gün adı — P, S, Ç… / M, T, W… */
export function dayShort(key: string, lang: Lang): string {
  return keyToDate(key).toLocaleDateString(LOCALE_MAP[lang], { weekday: 'narrow' });
}

/** "29 Eyl" tarzı kısa tarih */
export function dateShort(key: string, lang: Lang): string {
  return keyToDate(key).toLocaleDateString(LOCALE_MAP[lang], { day: 'numeric', month: 'short' });
}

/** "29 Eyl – 5 Eki" tarzı haftalık aralık */
export function weekRangeLabel(startKey: string, endKey: string, lang: Lang): string {
  return `${dateShort(startKey, lang)} – ${dateShort(endKey, lang)}`;
}

/** "2 Ekim Perşembe" tarzı tam tarih */
export function dateLong(key: string, lang: Lang): string {
  return keyToDate(key).toLocaleDateString(LOCALE_MAP[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${`${m}`.padStart(2, '0')}:${`${s}`.padStart(2, '0')}`;
}

/** 95 → "95 dk", 620 → "10 sa 20 dk" */
export function formatMinutes(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const hLabel = lang === 'tr' ? 'sa' : 'h';
  const mLabel = lang === 'tr' ? 'dk' : 'm';
  if (h <= 0) return `${m} ${mLabel}`;
  if (m === 0) return `${h} ${hLabel}`;
  return `${h} ${hLabel} ${m} ${mLabel}`;
}
