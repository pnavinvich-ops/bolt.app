import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { readJSON, writeJSON } from '@/storage/storage';
import en from './locales/en.json';

const LOCALE_KEY = 'locale';
const SUPPORTED = ['en', 'ru', 'es', 'tr', 'ka', 'fr', 'hi'] as const;
export type Locale = (typeof SUPPORTED)[number];

const stored = readJSON<{ code: Locale }>(LOCALE_KEY)?.code;
const initial: Locale = (SUPPORTED as readonly string[]).includes(stored as string) ? (stored as Locale) : 'en';

// Only the active language ships in the main bundle; the rest are
// code-split and fetched on demand (~30 KB saved per unused locale).
const loaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: async () => ({ default: en }),
  ru: () => import('./locales/ru.json'),
  es: () => import('./locales/es.json'),
  tr: () => import('./locales/tr.json'),
  ka: () => import('./locales/ka.json'),
  fr: () => import('./locales/fr.json'),
  hi: () => import('./locales/hi.json'),
};

const loadedLocales = new Set<Locale>(['en']);

export async function ensureLocale(code: Locale): Promise<void> {
  if (loadedLocales.has(code)) return;
  const mod = await loaders[code]();
  i18n.addResourceBundle(code, 'translation', mod.default, true, true);
  loadedLocales.add(code);
  // Force react-i18next consumers to re-render now that strings exist.
  if ((i18n.languages ?? []).includes(code)) {
    i18n.emit('languageChanged', code);
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export const setLocale = async (code: Locale) => {
  await ensureLocale(code);
  await i18n.changeLanguage(code);
  writeJSON(LOCALE_KEY, { code });
};
export { SUPPORTED };
export default i18n;

// Restore the persisted language at startup (English renders until ready).
void ensureLocale(initial).then(() => i18n.changeLanguage(initial));
