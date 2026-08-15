import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { readJSON, writeJSON } from '@/storage/storage';
import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import tr from './locales/tr.json';
import ka from './locales/ka.json';
import fr from './locales/fr.json';

const LOCALE_KEY = 'locale';
const SUPPORTED = ['en', 'ru', 'es', 'tr', 'ka', 'fr'] as const;
export type Locale = (typeof SUPPORTED)[number];

const stored = readJSON<{ code: Locale }>(LOCALE_KEY)?.code;
const initial: Locale = (SUPPORTED as readonly string[]).includes(stored as string) ? (stored as Locale) : 'en';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  es: { translation: es },
  tr: { translation: tr },
  ka: { translation: ka },
  fr: { translation: fr },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export const setLocale = (code: Locale) => {
  i18n.changeLanguage(code);
  writeJSON(LOCALE_KEY, { code });
};
export { SUPPORTED };
export default i18n;
