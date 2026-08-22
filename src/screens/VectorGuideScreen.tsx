import { useState } from 'react';
import { ChevronDown, Lightbulb, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VECTOR_GUIDE } from '@/data/vectors';
import ScreenHeader from '@/components/ScreenHeader';

export default function VectorGuideScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24">
      <ScreenHeader title={t('nav.guide')} backTo="/tools" />
      <div className="mx-auto max-w-md space-y-3 px-4 py-4">
        {VECTOR_GUIDE.map((v) => {
          const expanded = open === v.key;
          return (
            <section key={v.key} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : v.key)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={expanded}
              >
                <div>
                  <p className="text-h3">{t(`enum.vector.${v.key}`)}</p>
                  <p className="text-caption text-text-faint">{t(`guide.${v.key}.cue`)}</p>
                </div>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-text-faint transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </button>

              {expanded && (
                <div className="mt-4 space-y-3 animate-slide-up">
                  <Block title={t('vectorGuide.what')} body={t(`guide.${v.key}.what`)} />
                  <Block title={t('vectorGuide.why')} body={t(`guide.${v.key}.why`)} />
                  <Block title={t('vectorGuide.how')} body={t(`guide.${v.key}.how`)} accent />
                  <Block title={t('vectorGuide.mistakes')} body={t(`guide.${v.key}.mistakes`)} warn />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Block({ title, body, accent, warn }: { title: string; body: string; accent?: boolean; warn?: boolean }) {
  const cls = warn
    ? 'border-warn/30 bg-warn/5'
    : accent
      ? 'border-accent/30 bg-accent-lo'
      : 'border-border bg-surfaceAlt';
  return (
    <div className={`rounded-md border p-3 ${cls}`}>
      <p className="label mb-1 flex items-center gap-1.5">
        {accent ? <Lightbulb size={12} className="text-accent" /> : <Info size={12} className="text-text-faint" />}
        {title}
      </p>
      <p className="text-body text-text-dim">{body}</p>
    </div>
  );
}
