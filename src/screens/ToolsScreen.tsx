import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, RefreshCw, Award, Activity, Timer as TimerIcon, AlertCircle, BookOpen, Trophy, Globe2, MessageCircle, TrendingUp, Users, CalendarDays, Scale, Dumbbell, Share2, Settings as SettingsIcon, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLifts } from '@/stores/lifts';
import { useTendon } from '@/stores/tendon';
import { useSettings } from '@/stores/settings';
import { benchmarkTier, topStrengthForVector, ormForLift } from '@/services/strength';
import { currentTendonIndex } from '@/services/tendonHealth';
import { deloadStatus } from '@/services/deload';
import { VECTORS, kgToUnit } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';
import { Link } from 'react-router-dom';

type ReactionState = 'idle' | 'waiting' | 'ready' | 'result' | 'tooSoon';

function ReactionTrainer({ title }: { title: string }) {
  const { t } = useTranslation();
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
      ? t('tools.tapStart')
      : state === 'waiting'
        ? t('tools.waitGreen')
        : state === 'ready'
          ? t('tools.tapNow')
          : state === 'tooSoon'
            ? t('tools.tooSoon')
            : t('tools.resultRetry', { ms: resultMs });

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2">
        <Zap size={18} className="text-accent" />
        <h3 className="text-h3">{title}</h3>
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
          <span className="mt-1 text-caption text-text-faint">{t('tools.bestMs', { ms: best })}</span>
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

function TendonHealthCard({ title, checkIn }: { title: string; checkIn: string }) {
  const { t } = useTranslation();
  const checks = useTendon((s) => s.checks);
  const index = currentTendonIndex(checks);
  const deload = deloadStatus(checks);

  const color =
    index.score >= 60 ? 'text-ok' : index.score >= 40 ? 'text-warn' : 'text-bad';
  const ringColor =
    index.score >= 60 ? 'border-ok' : index.score >= 40 ? 'border-warn' : 'border-bad';
  const trendKey =
    index.trend === 'improving'
      ? 'tendon.trendImproving'
      : index.trend === 'declining'
        ? 'tendon.trendDeclining'
        : 'tendon.trendStable';

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2">
        <Activity size={18} className="text-accent" />
        <h3 className="text-h3">{title}</h3>
      </div>
      {deload.level !== 'none' && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-md border p-2.5 ${
            deload.level === 'deload' ? 'border-bad/40 bg-bad/5' : 'border-warn/30 bg-warn/5'
          }`}
        >
          <AlertCircle size={16} className={`shrink-0 ${deload.level === 'deload' ? 'text-bad' : 'text-warn'}`} />
          <p className={`text-caption font-semibold ${deload.level === 'deload' ? 'text-bad' : 'text-warn'}`}>
            {t(`rehab.status_${deload.level}`)}
          </p>
          <Link to="/tendon" className="ml-auto shrink-0 text-caption font-bold text-accent">
            {t('rehab.details')}
          </Link>
        </div>
      )}
      {index.daysLogged === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <AlertCircle size={24} className="text-text-faint" />
          <p className="text-center text-caption text-text-dim">
            {t('tools.noCheckins')}
          </p>
          <Link to="/tendon" className="btn-ghost">
            <TimerIcon size={16} /> {checkIn}
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 ${ringColor}`}>
            <span className={`text-h2 font-extrabold ${color}`}>{index.score}</span>
          </div>
          <div className="flex-1">
            <p className={`text-h3 ${color}`}>
              {t(
                index.label === 'healthy'
                  ? 'tendon.lHealthy'
                  : index.label === 'good'
                    ? 'tendon.lGood'
                    : index.label === 'monitor'
                      ? 'tendon.lMonitor'
                      : index.label === 'strained'
                        ? 'tendon.lStrained'
                        : 'tendon.lCritical',
              )}
            </p>
            <p className="text-caption text-text-dim">
              {t('tools.elbowAvgLine', { e: index.elbowAvg, f: index.forearmAvg })}
            </p>
            <p className="text-caption text-text-faint">
              {t('common.days', { count: index.daysLogged })} · {t('common.trend')}: {t(trendKey)}
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

function BenchmarksCard({ title }: { title: string }) {
  const { t } = useTranslation();
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
        <h3 className="text-h3">{title}</h3>
      </div>
      {overallBest === 0 ? (
        <p className="py-4 text-center text-caption text-text-faint">
          {t('tools.logDynamicFirst')}
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-md bg-surfaceAlt p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: tier.color + '22' }}>
              <Award size={22} style={{ color: tier.color }} />
            </div>
            <div>
              <p className="text-h3" style={{ color: tier.color }}>{t(`bench.${tier.tier}`)}</p>
              <p className="text-caption text-text-dim">
                {t('tools.topEquiv', { weight: kgToUnit(overallBest, unit), unit })}
                {tier.next != null &&
                  ` · ${t('tools.nextTierAt', { weight: kgToUnit(tier.next, unit), unit })}`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {topByVector.map(({ vector, orm }) => {
              const vt = benchmarkTier(orm);
              return (
                <div key={vector} className="flex items-center gap-2">
                  <span className="w-20 text-caption text-text-dim">{t(`enum.vector.${vector}`)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((orm / 100) * 100, 100)}%`, backgroundColor: vt.color }}
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
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader
        title={t('tools.title')}
        subtitle={t('tools.subtitle')}
        right={
          <Link
            to="/settings"
            aria-label={t('nav.settings')}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surfaceAlt text-text-dim transition-all active:scale-90 hover:text-text"
          >
            <SettingsIcon size={18} />
          </Link>
        }
      />
      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        <ReactionTrainer title={t('tools.reactionTitle')} />
        <TendonHealthCard title={t('tools.tendonTitle')} checkIn={t('tools.tendonCheckIn')} />
        <BenchmarksCard title={t('tools.benchTitle')} />
        <MoreTools />
      </div>
    </div>
  );
}

function ToolTile({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surfaceAlt p-3 text-center transition-all active:scale-95 hover:border-borderStrong"
    >
      <Icon size={20} className="shrink-0 text-accent" />
      <span className="text-micro font-semibold leading-tight text-text-dim">{label}</span>
    </Link>
  );
}

function TileSection({ titleKey, children }: { titleKey: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <section>
      <p className="label mb-2">{t(titleKey)}</p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </section>
  );
}

function MoreTools() {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <TileSection titleKey="tools.secTrack">
        <ToolTile to="/progress" icon={TrendingUp} label={t('tools.moreProgress')} />
        <ToolTile to="/scout" icon={Users} label={t('tools.moreScout')} />
        <ToolTile to="/tournament" icon={CalendarDays} label={t('tools.moreTournament')} />
        <ToolTile to="/card" icon={Share2} label={t('tools.moreCard')} />
        <ToolTile to="/workout" icon={TimerIcon} label={t('tools.moreWorkout')} />
      </TileSection>

      <TileSection titleKey="tools.secLearn">
        <ToolTile to="/exercises" icon={Dumbbell} label={t('tools.moreExercises')} />
        <ToolTile to="/guide" icon={BookOpen} label={t('tools.moreGuide')} />
        <ToolTile to="/athletes" icon={Trophy} label={t('tools.moreAthletes')} />
        <ToolTile to="/rules" icon={Scale} label={t('tools.moreRules')} />
      </TileSection>

      <TileSection titleKey="tools.secCommunity">
        <ToolTile to="/partners" icon={Globe2} label={t('tools.morePartners')} />
        <ToolTile to="/rankings" icon={Trophy} label={t('tools.moreRankings')} />
        <ToolTile to="/chat" icon={MessageCircle} label={t('tools.moreChat')} />
        <ToolTile to="/scorekeeper" icon={Swords} label={t('tools.moreScorekeeper')} />
      </TileSection>

      <Link to="/settings" className="btn-ghost w-full justify-start">
        <SettingsIcon size={18} /> {t('nav.settings')}
      </Link>
    </div>
  );
}
