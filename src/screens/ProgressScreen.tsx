import { useMemo, useState } from 'react';
import { TrendingUp, Trophy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Vector } from '@/types/domain';
import { useLifts } from '@/stores/lifts';
import { useSettings } from '@/stores/settings';
import { allPRs, holdTimeline, ormTimeline, type TimelinePoint } from '@/services/progression';
import { benchmarkTier } from '@/services/strength';
import { VECTORS, kgToUnit } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';
import LineChart from '@/components/LineChart';
import EmptyState from '@/components/EmptyState';

type Mode = 'dynamic' | 'isometric';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const lifts = useLifts((s) => s.lifts);
  const unit = useSettings((s) => s.settings.unit);

  const [vector, setVector] = useState<Vector>('pronation');
  const [mode, setMode] = useState<Mode>('dynamic');

  const prs = useMemo(() => allPRs(lifts), [lifts]);
  const timeline: TimelinePoint[] = useMemo(
    () => (mode === 'dynamic' ? ormTimeline(lifts, vector) : holdTimeline(lifts, vector)),
    [lifts, vector, mode],
  );

  const delta =
    timeline.length >= 2
      ? timeline[timeline.length - 1].value - timeline[timeline.length - 2].value
      : 0;

  if (lifts.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <ScreenHeader title={t('progress.title')} subtitle={t('progress.subtitle')} backTo="/tools" />
        <div className="mx-auto max-w-md px-4 py-4">
          <EmptyState
            icon={TrendingUp}
            title={t('progress.empty')}
            message={t('progress.emptyMsg')}
            action={
              <Link to="/log" className="btn-primary">
                {t('history.logLiftCta')}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader
        title={t('progress.title')}
        subtitle={t('progress.subtitle')}
        backTo="/tools"
        right={
          <Link
            to="/card"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-onAccent transition-transform active:scale-90"
            aria-label={t('card.title')}
          >
            <Share2 size={18} />
          </Link>
        }
      />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {/* Vector selector */}
        <div className="grid grid-cols-3 gap-2">
          {VECTORS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVector(v)}
              className={`rounded-md border px-2 py-2 text-caption font-semibold transition-all active:scale-95 ${
                vector === v
                  ? 'border-accent bg-accent-lo text-accent-hi'
                  : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
              }`}
            >
              {t(`enum.vector.${v}`)}
            </button>
          ))}
        </div>

        {/* Mode + chart */}
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="label">{mode === 'dynamic' ? t('progress.ormChart') : t('progress.holdChart')}</p>
            <div className="flex gap-1 rounded-md border border-border bg-surfaceAlt p-0.5">
              {(['dynamic', 'isometric'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`seg px-2 py-1 text-caption ${mode === m ? 'seg-active' : 'seg-idle'}`}
                >
                  {m === 'dynamic' ? t('enum.mode.dynamic') : t('enum.mode.isometric')}
                </button>
              ))}
            </div>
          </div>

          {timeline.length === 0 ? (
            <p className="py-6 text-center text-caption text-text-faint">{t('progress.noDataVector')}</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-h1 font-extrabold">
                  {kgToUnit(timeline[timeline.length - 1].value, unit)}
                </span>
                <span className="text-caption text-text-faint">{unit}</span>
                {delta !== 0 && (
                  <span className={`text-caption font-bold ${delta > 0 ? 'text-ok' : 'text-bad'}`}>
                    {delta > 0 ? '+' : ''}
                    {Math.round(kgToUnit(delta, unit) * 10) / 10} {unit}
                  </span>
                )}
              </div>
              <LineChart points={timeline} color={mode === 'dynamic' ? '#FF5A1F' : '#3DDC97'} />
            </>
          )}
        </section>

        {/* PR board */}
        <section className="space-y-2">
          <p className="label flex items-center gap-1.5">
            <Trophy size={12} /> {t('progress.prBoard')}
          </p>
          {VECTORS.map((v) => {
            const dyn = prs.find((p) => p.vector === v && p.mode === 'dynamic');
            const iso = prs.find((p) => p.vector === v && p.mode === 'isometric');
            const vTier = benchmarkTier(dyn?.valueKg ?? 0);
            return (
              <div key={v} className="card flex items-center gap-3">
                <span className="w-20 shrink-0 truncate text-body font-semibold">{t(`enum.vector.${v}`)}</span>
                <div className="flex flex-1 items-center gap-3 text-caption text-text-dim">
                  <span className="flex-1">
                    {dyn ? (
                      <>
                        {kgToUnit(dyn.valueKg, unit)} {unit}
                        <span className="ml-1 text-micro text-text-faint">({dyn.arm === 'left' ? t('enum.arm.left') : t('enum.arm.right')})</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                  <span className="flex-1">
                    {iso ? `${kgToUnit(iso.valueKg, unit)} ${unit}` : '—'}
                  </span>
                </div>
                <span
                  className="shrink-0 rounded-xs px-1.5 py-0.5 text-micro font-bold"
                  style={{ color: vTier.color, backgroundColor: vTier.color + '22' }}
                >
                  {dyn ? t(`bench.${vTier.tier}`) : ''}
                </span>
              </div>
            );
          })}
          <p className="pt-1 text-center text-micro text-text-faint">
            {t('progress.legendOrmHold')}
          </p>
        </section>
      </div>
    </div>
  );
}
