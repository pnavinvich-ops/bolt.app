import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, RefreshCw, Award, Activity, Timer, AlertCircle } from 'lucide-react';
import { useLifts } from '@/stores/lifts';
import { useTendon } from '@/stores/tendon';
import { useSettings } from '@/stores/settings';
import { oneRepMax, benchmarkTier, topStrengthForVector, ormForLift } from '@/services/strength';
import { currentTendonIndex } from '@/services/tendonHealth';
import { VECTORS, VECTOR_LABEL, kgToUnit } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';
import { Link } from 'react-router-dom';

type ReactionState = 'idle' | 'waiting' | 'ready' | 'result' | 'tooSoon';

function ReactionTrainer() {
  const [state, setState] = useState<ReactionState>('idle');
  const [resultMs, setResultMs] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem('armlog:reactionBest');
    if (stored) setBest(parseInt(stored));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const start = useCallback(() => {
    setState('waiting');
    const delay = 1200 + Math.random() * 2800;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setState('ready');
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'result' || state === 'tooSoon') {
      start();
    } else if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('tooSoon');
    } else if (state === 'ready') {
      const ms = Math.round(performance.now() - startTimeRef.current);
      setResultMs(ms);
      setState('result');
      setHistory((h) => [ms, ...h].slice(0, 5));
      if (best === null || ms < best) {
        setBest(ms);
        localStorage.setItem('armlog:reactionBest', String(ms));
      }
    }
  }, [state, start, best]);

  const bg =
    state === 'ready'
      ? 'bg-ok'
      : state === 'waiting'
        ? 'bg-surfaceHigh'
        : state === 'tooSoon'
          ? 'bg-bad'
          : 'bg-surfaceAlt';

  const label =
    state === 'idle'
      ? 'Tap to start'
      : state === 'waiting'
        ? 'Wait for green...'
        : state === 'ready'
          ? 'TAP NOW!'
          : state === 'tooSoon'
            ? 'Too soon! Tap to retry'
            : `${resultMs} ms — tap to retry`;

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2">
        <Zap size={18} className="text-accent" />
        <h3 className="text-h3">Hold Reaction Trainer</h3>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-32 w-full flex-col items-center justify-center rounded-md border border-border transition-colors ${bg}`}
      >
        <span className={`text-h2 font-extrabold ${state === 'ready' ? 'text-onAccent' : 'text-text'}`}>
          {label}
        </span>
        {best !== null && state !== 'ready' && state !== 'waiting' && (
          <span className="mt-1 text-caption text-text-faint">Best: {best} ms</span>
        )}
      </button>
      {history.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {history.map((h, i) => (
            <span
              key={i}
              className={`rounded-xs px-2 py-1 text-micro font-semibold ${
                h < 250 ? 'bg-ok-tint text-ok' : h < 400 ? 'bg-warn-tint text-warn' : 'bg-bad-tint text-bad'
              }`}
            >
              {h}ms
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function TendonHealthCard() {
  const checks = useTendon((s) => s.checks);
  const index = currentTendonIndex(checks);

  const color =
    index.score >= 60 ? 'text-ok' : index.score >= 40 ? 'text-warn' : 'text-bad';
  const ringColor =
    index.score >= 60 ? 'border-ok' : index.score >= 40 ? 'border-warn' : 'border-bad';

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2">
        <Activity size={18} className="text-accent" />
        <h3 className="text-h3">Tendon Health</h3>
      </div>
      {index.daysLogged === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <AlertCircle size={24} className="text-text-faint" />
          <p className="text-center text-caption text-text-dim">
            No check-ins this week. Log daily to track your tendon health.
          </p>
          <Link to="/tendon" className="btn-ghost">
            <Timer size={16} /> Check in today
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 ${ringColor}`}>
            <span className={`text-h2 font-extrabold ${color}`}>{index.score}</span>
          </div>
          <div className="flex-1">
            <p className={`text-h3 ${color}`}>{index.label}</p>
            <p className="text-caption text-text-dim">
              Elbow {index.elbowAvg}/10 · Forearm {index.forearmAvg}/10
            </p>
            <p className="text-caption text-text-faint">
              {index.daysLogged} day{index.daysLogged > 1 ? 's' : ''} · trend:{' '}
              {index.trend === 'improving' ? 'improving' : index.trend === 'declining' ? 'declining' : index.trend}
            </p>
          </div>
          <Link to="/tendon" className="btn-ghost shrink-0 px-3 py-2">
            <RefreshCw size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}

function BenchmarksCard() {
  const lifts = useLifts((s) => s.lifts);
  const unit = useSettings((s) => s.settings.unit);

  const topByVector = VECTORS.map((v) => ({
    vector: v,
    orm: topStrengthForVector(lifts, v),
  })).filter((x) => x.orm > 0);

  const overallBest = lifts
    .filter((l) => l.mode === 'dynamic')
    .map((l) => ormForLift(l))
    .reduce((max, orm) => Math.max(max, orm), 0);

  const tier = benchmarkTier(overallBest);

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2">
        <Award size={18} className="text-accent" />
        <h3 className="text-h3">Strength Benchmarks</h3>
      </div>
      {overallBest === 0 ? (
        <p className="py-4 text-center text-caption text-text-faint">
          Log dynamic lifts to see your strength tier.
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-md bg-surfaceAlt p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: tier.color + '22' }}>
              <Award size={22} style={{ color: tier.color }} />
            </div>
            <div>
              <p className="text-h3" style={{ color: tier.color }}>{tier.tier}</p>
              <p className="text-caption text-text-dim">
                Top 1RM equiv: {kgToUnit(overallBest, unit)} {unit}
                {tier.next && ` · next tier at ${kgToUnit(tier.next, unit)} ${unit}`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {topByVector.map(({ vector, orm }) => {
              const t = benchmarkTier(orm);
              return (
                <div key={vector} className="flex items-center gap-2">
                  <span className="w-20 text-caption text-text-dim">{VECTOR_LABEL[vector]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((orm / 100) * 100, 100)}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <span className="w-14 text-right text-caption font-semibold text-text-dim">
                    {kgToUnit(orm, unit)} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default function ToolsScreen() {
  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title="Tools" subtitle="Reaction, tendon, benchmarks" />
      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        <ReactionTrainer />
        <TendonHealthCard />
        <BenchmarksCard />
      </div>
    </div>
  );
}
