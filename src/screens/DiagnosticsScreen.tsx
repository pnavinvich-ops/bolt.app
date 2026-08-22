import { useMemo } from 'react';
import { Activity, TrendingUp, AlertTriangle, Scale, ArrowRight, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { runDiagnostics, type WeakVector } from '@/services/diagnostics';
import { vectorOutcomeTallies } from '@/services/matchAnalysis';
import { VECTORS } from '@/types/constants';
import SpiderChart from '@/components/SpiderChart';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';

const BALANCE_KEY: Record<string, string> = {
  excellent: 'diag.bExcellent',
  good: 'diag.bGood',
  fair: 'diag.bFair',
  imbalanced: 'diag.bImbalanced',
  critical: 'diag.bCritical',
};

function MatchOutcomes() {
  const { t } = useTranslation();
  const sparring = useSparring((s) => s.sessions);
  const tallies = useMemo(() => vectorOutcomeTallies(sparring), [sparring]);
  const any = VECTORS.some((v) => tallies[v].total > 0);

  if (!any) {
    return (
      <p className="text-caption text-text-faint">
        {t('diag.matchEmpty')}{' '}
        <Link to="/sparring" className="font-semibold text-accent">
          {t('history.logSparCta')}
        </Link>
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {VECTORS.filter((v) => tallies[v].total > 0).map((v) => {
        const tally = tallies[v];
        return (
          <div key={v} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-caption text-text-dim">{t(`enum.vector.${v}`)}</span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
              <div className="h-full bg-ok" style={{ width: `${(tally.win / tally.total) * 100}%` }} />
              <div className="h-full bg-bad" style={{ width: `${(tally.loss / tally.total) * 100}%` }} />
            </div>
            <span className="w-16 shrink-0 text-right text-micro font-semibold">
              <span className="text-ok">{tally.win}W</span> · <span className="text-bad">{tally.loss}L</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WeakSuggestion({ w }: { w: WeakVector }) {
  const { t } = useTranslation();
  const vectorName = t(`enum.vector.${w.vector}`);
  let msg: string;
  if (w.reason === 'both') msg = t('diag.sugBoth', { vector: vectorName });
  else if (w.reason === 'leftWeak') msg = t('diag.sugLeft', { vector: vectorName, gap: w.gap });
  else if (w.reason === 'rightWeak') msg = t('diag.sugRight', { vector: vectorName, gap: w.gap });
  else msg = t('diag.sugLosses', { count: w.losses ?? w.gap, vector: vectorName });
  return <p className="mt-0.5 text-caption text-text-dim">{msg}</p>;
}

export default function DiagnosticsScreen() {
  const { t } = useTranslation();
  const lifts = useLifts((s) => s.lifts);
  const sparring = useSparring((s) => s.sessions);

  const diag = useMemo(() => runDiagnostics(sparring, lifts), [sparring, lifts]);

  const hasData = lifts.length > 0;
  const maxVal = Math.max(
    ...diag.leftMaxes.map((v) => v.max),
    ...diag.rightMaxes.map((v) => v.max),
    1,
  );

  const balanceColor =
    diag.balanceScore >= 75 ? 'text-ok' : diag.balanceScore >= 60 ? 'text-warn' : 'text-bad';

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('diag.title')} subtitle={t('diag.subtitle')} />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {!hasData ? (
          <EmptyState
            icon={Activity}
            title={t('diag.noData')}
            message={t('diag.noDataMsg')}
            action={
              <Link to="/log" className="btn-primary">
                {t('history.logLiftCta')}
              </Link>
            }
          />
        ) : (
          <>
            {/* Balance score */}
            <section className="card flex items-center gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 ${diag.balanceScore >= 75 ? 'border-ok' : diag.balanceScore >= 60 ? 'border-warn' : 'border-bad'}`}>
                <span className={`text-h2 font-extrabold ${balanceColor}`}>{diag.balanceScore}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Scale size={15} className="text-text-faint" />
                  <p className="label">{t('diag.balance')}</p>
                </div>
                <p className={`text-h3 ${balanceColor}`}>{t(BALANCE_KEY[diag.balanceLabel])}</p>
                <p className="text-caption text-text-faint">
                  L:{Math.round(diag.leftMaxes.reduce((a, b) => a + b.max, 0))} · R:
                  {Math.round(diag.rightMaxes.reduce((a, b) => a + b.max, 0))} kg
                </p>
              </div>
            </section>

            {/* Spider chart */}
            <section className="card">
              <p className="label mb-3">{t('diag.byVector')}</p>
              <SpiderChart
                series={[
                  {
                    label: t('enum.arm.left'),
                    color: '#FF5A1F',
                    values: Object.fromEntries(diag.leftMaxes.map((v) => [v.vector, v.max])) as never,
                  },
                  {
                    label: t('enum.arm.right'),
                    color: '#3DDC97',
                    values: Object.fromEntries(diag.rightMaxes.map((v) => [v.vector, v.max])) as never,
                  },
                ]}
                max={maxVal}
              />
              <div className="mt-2 flex justify-center gap-4">
                <span className="flex items-center gap-1.5 text-caption text-text-dim">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" /> {t('enum.arm.left')}
                </span>
                <span className="flex items-center gap-1.5 text-caption text-text-dim">
                  <span className="h-2.5 w-2.5 rounded-full bg-ok" /> {t('enum.arm.right')}
                </span>
              </div>
            </section>

            {/* Volume bars */}
            <section className="card">
              <p className="label mb-3">{t('diag.volume30')}</p>
              <div className="space-y-2.5">
                {diag.leftVolumes.map((lv, i) => {
                  const rv = diag.rightVolumes[i];
                  const maxVol = Math.max(...diag.leftVolumes.map((x) => x.volume), ...diag.rightVolumes.map((x) => x.volume), 1);
                  return (
                    <div key={lv.vector}>
                      <p className="mb-1 text-caption text-text-dim">{t(`enum.vector.${lv.vector}`)}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-micro text-text-faint">L</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-500"
                              style={{ width: `${(lv.volume / maxVol) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-micro text-text-faint">R</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                            <div
                              className="h-full rounded-full bg-ok transition-all duration-500"
                              style={{ width: `${(rv.volume / maxVol) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Match outcomes */}
            <section className="card">
              <p className="label mb-3 flex items-center gap-1.5">
                <Swords size={12} /> {t('diag.matchTitle')}
              </p>
              <MatchOutcomes />
            </section>

            {/* Weak vectors */}
            <section>
              <p className="label mb-2">{t('diag.weakTitle')}</p>
              {diag.weakVectors.length === 0 ? (
                <div className="card flex items-center gap-2">
                  <TrendingUp size={18} className="text-ok" />
                  <p className="text-body text-text-dim">{t('diag.noWeak')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {diag.weakVectors.map((w, i) => (
                    <div key={i} className="card-alt flex items-start gap-3">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn" />
                      <div className="flex-1">
                        <p className="text-body font-semibold">
                          {t(`enum.vector.${w.vector}`)}{' '}
                          <span className="text-caption font-normal text-text-faint">
                            · {w.arm === 'both' ? t('diag.bothArms') : t(`enum.arm.${w.arm}`)}
                          </span>
                        </p>
                        <WeakSuggestion w={w} />
                        <Link
                          to={`/log?arm=${w.arm === 'right' ? 'right' : 'left'}&vector=${w.vector}`}
                          className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-accent"
                        >
                          {t('diag.drillIt')} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
