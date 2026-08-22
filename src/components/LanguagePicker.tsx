import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setLocale, SUPPORTED, type Locale } from '@/i18n';

const META: Record<Locale, { native: string; flag: string }> = {
  en: { native: 'English', flag: '🇬🇧' },
  ru: { native: 'Русский', flag: '🇷🇺' },
  es: { native: 'Español', flag: '🇪🇸' },
  tr: { native: 'Türkçe', flag: '🇹🇷' },
  ka: { native: 'ქართული', flag: '🇬🇪' },
  fr: { native: 'Français', flag: '🇫🇷' },
  hi: { native: 'हिन्दी', flag: '🇮🇳' },
};

export default function LanguagePicker() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language as Locale) ?? 'en';

  return (
    <section className="space-y-2">
      <p className="label flex items-center gap-2">
        <Globe size={14} /> {t('settings.language')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED.map((code) => {
          const active = current === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
                active ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
              }`}
            >
              <span className="text-h3">{META[code].flag}</span>
              <span className={`flex-1 text-body ${active ? 'text-accent-hi font-semibold' : ''}`}>
                {META[code].native}
              </span>
              {active && <Check size={16} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
