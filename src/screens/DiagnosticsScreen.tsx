import { useMemo } from 'react';
import { Activity, TrendingUp, AlertTriangle, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { runDiagnostics } from '@/services/diagnostics';
import { VECTOR_LABEL, ARM_LABEL } from '@/types/constants';
import SpiderChart from '@/components/SpiderChart';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';

export default function DiagnosticsScreen() {
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
      <ScreenHeader title="Diagnostics" subtitle="Strength profile & balance" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {!hasData ? (
          <EmptyState
            icon={Activity}
            title="No data yet"
            message="Log some lifts and the spider chart, balance score, and weak-vector suggestions will appear here."
            action={
              <Link to="/log" className="btn-primary">
                Log a lift
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
                  <p className="label">Arm Balance</p>
                </div>
                <p className={`text-h3 ${balanceColor}`}>{diag.balanceLabel}</p>
                <p className="text-caption text-text-faint">
                  L:{Math.round(diag.leftMaxes.reduce((a, b) => a + b.max, 0))} · R:
                  {Math.round(diag.rightMaxes.reduce((a, b) => a + b.max, 0))} kg
                </p>
              </div>
            </section>

            {/* Spider chart */}
            <section className="card">
              <p className="label mb-3">Strength by vector</p>
              <SpiderChart
                series={[
                  {
                    label: 'Left',
                    color: '#FF5A1F',
                    values: Object.fromEntries(diag.leftMaxes.map((v) => [v.vector, v.max])) as never,
                  },
                  {
                    label: 'Right',
                    color: '#3DDC97',
                    values: Object.fromEntries(diag.rightMaxes.map((v) => [v.vector, v.max])) as never,
                  },
                ]}
                max={maxVal}
              />
              <div className="mt-2 flex justify-center gap-4">
                <span className="flex items-center gap-1.5 text-caption text-text-dim">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Left
                </span>
                <span className="flex items-center gap-1.5 text-caption text-text-dim">
                  <span className="h-2.5 w-2.5 rounded-full bg-ok" /> Right
                </span>
              </div>
            </section>

            {/* Volume bars */}
            <section className="card">
              <p className="label mb-3">Training volume (last 30 days)</p>
              <div className="space-y-2.5">
                {diag.leftVolumes.map((lv, i) => {
                  const rv = diag.rightVolumes[i];
                  const maxVol = Math.max(...diag.leftVolumes.map((x) => x.volume), ...diag.rightVolumes.map((x) => x.volume), 1);
                  return (
                    <div key={lv.vector}>
                      <p className="mb-1 text-caption text-text-dim">{VECTOR_LABEL[lv.vector]}</p>
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

            {/* Weak vectors */}
            <section>
              <p className="label mb-2">Weak vector suggestions</p>
              {diag.weakVectors.length === 0 ? (
                <div className="card flex items-center gap-2">
                  <TrendingUp size={18} className="text-ok" />
                  <p className="text-body text-text-dim">No major weaknesses detected. Keep training balanced.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {diag.weakVectors.map((w, i) => (
                    <div key={i} className="card-alt flex items-start gap-3">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn" />
                      <div className="flex-1">
                        <p className="text-body font-semibold">
                          {VECTOR_LABEL[w.vector]}{' '}
                          <span className="text-caption font-normal text-text-faint">
                            · {w.arm === 'both' ? 'both arms' : ARM_LABEL[w.arm]}
                          </span>
                        </p>
                        <p className="mt-0.5 text-caption text-text-dim">{w.suggestion}</p>
                        <Link
                          to={`/log?arm=${w.arm === 'right' ? 'right' : 'left'}&vector=${w.vector}`}
                          className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-accent"
                        >
                          Drill it <ArrowRight size={12} />
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
