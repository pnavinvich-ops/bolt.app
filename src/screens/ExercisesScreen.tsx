import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '@/data/exercises';
import { VECTORS } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';
import ExerciseGlyph from '@/components/ExerciseGlyph';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const list = filter ? EXERCISES.filter((e) => e.vectors.includes(filter)) : EXERCISES;

  return (
    <div className="min-h-screen pb-24">
      <ScreenHeader title={t('ex.title')} subtitle={t('ex.subtitle')} backTo="/tools" />

      <div className="mx-auto max-w-md space-y-3 px-4 py-4">
        {/* Vector filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`rounded-md border px-2.5 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
              filter === null
                ? 'border-accent bg-accent-lo text-accent-hi'
                : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
            }`}
          >
            {t('ex.all')}
          </button>
          {VECTORS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(filter === v ? null : v)}
              className={`rounded-md border px-2.5 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
                filter === v
                  ? 'border-accent bg-accent-lo text-accent-hi'
                  : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
              }`}
            >
              {t(`enum.vector.${v}`)}
            </button>
          ))}
        </div>

        {/* Cards */}
        {list.map((ex) => {
          const expanded = open === ex.key;
          return (
            <section key={ex.key} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : ex.key)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="shrink-0 rounded-md border border-border bg-surfaceAlt p-1.5">
                  <ExerciseGlyph icon={ex.icon} size={52} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-h3">{t(`ex.${ex.key}.name`)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.vectors.map((v) => (
                      <span key={v} className="rounded-xs bg-accent-lo px-1.5 py-0.5 text-micro font-semibold text-accent-hi">
                        {t(`enum.vector.${v}`)}
                      </span>
                    ))}
                    {ex.equipment && (
                      <span className="rounded-xs bg-surfaceHigh px-1.5 py-0.5 text-micro text-text-faint">
                        {t(`enum.handle.${ex.equipment}`)}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown size={18} className={`shrink-0 text-text-faint transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>

              {expanded && (
                <div className="mt-3 space-y-3 border-t border-border pt-3 animate-slide-up">
                  <ol className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex items-start gap-2 text-body text-text-dim">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surfaceAlt text-caption font-bold text-text-faint">
                          {n}
                        </span>
                        {t(`ex.${ex.key}.step${n}`)}
                      </li>
                    ))}
                  </ol>
                  <p className="rounded-md border border-accent/30 bg-accent-lo p-2.5 text-caption font-semibold text-accent-hi">
                    {t(`ex.${ex.key}.cue`)}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
