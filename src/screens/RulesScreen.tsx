import { useState } from 'react';
import { ChevronDown, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';

const SECTIONS = [
  'setup',
  'commands',
  'fouls',
  'straps',
  'winning',
  'conduct',
] as const;

type Section = (typeof SECTIONS)[number];

const ITEMS: Record<Section, string[]> = {
  setup: ['setup1', 'setup2', 'setup3', 'setup4'],
  commands: ['cmd1', 'cmd2', 'cmd3', 'cmd4'],
  fouls: ['foul1', 'foul2', 'foul3', 'foul4'],
  straps: ['strap1', 'strap2', 'strap3'],
  winning: ['win1', 'win2', 'win3'],
  conduct: ['cond1', 'cond2', 'cond3'],
};

export default function RulesScreen() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Section | null>('commands');

  return (
    <div className="min-h-screen pb-24">
      <ScreenHeader title={t('rules.title')} subtitle={t('rules.subtitle')} backTo="/tools" />
      <div className="mx-auto max-w-md space-y-2 px-4 py-4">
        <p className="mb-2 flex items-center gap-1.5 text-caption text-text-faint">
          <Scale size={13} /> {t('rules.disclaimer')}
        </p>
        {SECTIONS.map((s) => {
          const expanded = open === s;
          return (
            <section key={s} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : s)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <p className="text-h3">{t(`rules.s_${s}`)}</p>
                <ChevronDown size={18} className={`shrink-0 text-text-faint transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && (
                <ul className="mt-3 space-y-2 animate-slide-up">
                  {ITEMS[s].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-text-dim">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {t(`rules.${item}`)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
