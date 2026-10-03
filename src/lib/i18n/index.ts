import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import tr from './tr';
import en from './en';
import type { Lang, LangSetting } from '../types';

const translations = { tr, en };

export function makeI18n(locale: Lang): I18n {
  const i18n = new I18n(translations);
  i18n.enableFallback = true;
  i18n.defaultLocale = 'tr';
  i18n.locale = locale;
  return i18n;
}

export type TFunction = (key: string, options?: Record<string, unknown>) => string;

export function createT(locale: Lang): TFunction {
  const i18n = makeI18n(locale);
  return (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
}

export function resolveLocale(setting: LangSetting): Lang {
  if (setting !== 'system') return setting;
  try {
    const device = Localization.getLocales()[0]?.languageCode;
    return device === 'en' ? 'en' : 'tr';
  } catch {
    return 'tr';
  }
}
