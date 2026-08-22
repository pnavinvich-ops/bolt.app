import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, ChevronRight, Timer as TimerIcon, SkipForward, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Arm, SetEntry } from '@/types/domain';
import { ARMS, uid, kgToUnit } from '@/types/constants';
import { useOnboarding } from '@/stores/onboarding';
import { useLifts } from '@/stores/lifts';
import { useSettings } from '@/stores/settings';
import SegmentedControl from '@/components/SegmentedControl';
import ScreenHeader from '@/components/ScreenHeader';

interface LoggedSet extends SetEntry {
  vector: string;
}

export default function WorkoutSessionScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const profile = useOnboarding((s) => s.profile);
  const plan = useOnboarding((s) => s.plan);
  const addLift = useLifts((s) => s.addLift);
  const unit = useSettings((s) => s.settings.unit);

  const [arm, setArm] = useState<Arm>('right');
  const [dayIdx, setDayIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [exIdx, setExIdx] = useState(0);
  const [logged, setLogged] = useState<LoggedSet[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rest, setRest] = useState(0);
  const [finished, setFinished] = useState(false);

  const day = plan?.days[dayIdx];
  const exercise = day?.exercises[exIdx];
  const targetSets = exercise?.sets ?? 3;

  useEffect(() => {
    if (!started || !exercise) return;
    // prefill from previous logged set or last time's numbers handled by user
    setWeight('');
    setReps(exercise.reps.split('–')[0] ?? '');
  }, [exIdx, started]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rest <= 0) return;
    const id = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [rest]);

  const totalLogged = logged.length;
  const sessionVolumeKg = useMemo(
    () => logged.reduce((sum, s) => sum + s.weight * (s.reps ?? s.durationSec ?? 1), 0),
    [logged],
  );

  if (!profile || !plan) {
    navigate('/onboarding/quiz');
    return null;
  }

  if (finished) {
    return (
      <div className="min-h-screen pb-32">
        <ScreenHeader title={t('workout.title')} backTo="/log" />
        <div className="mx-auto max-w-md space-y-4 px-4 py-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-ok bg-ok-tint">
            <Check size={40} className="text-ok" />
          </div>
          <h2 className="text-h1">{t('workout.doneTitle')}</h2>
          <p className="text-body text-text-dim">
            {t('workout.doneSummary', {
              count: totalLogged,
              volume: Math.round(kgToUnit(sessionVolumeKg, unit)),
              unit,
            })}
          </p>
          <button type="button" onClick={() => navigate('/history')} className="btn-primary w-full">
            {t('history.title')}
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen pb-32">
        <ScreenHeader title={t('workout.title')} subtitle={t('workout.pickDay')} backTo="/plan" />
        <div className="mx-auto max-w-md space-y-4 px-4 py-4">
          {/* Arm selector */}
          <section className="card space-y-2.5">
            <p className="label">{t('log.arm')}</p>
            <SegmentedControl
              options={ARMS.map((a) => ({ value: a, label: t(`enum.arm.${a}`) }))}
              value={arm}
              onChange={setArm}
            />
          </section>

          <div className="grid grid-cols-2 gap-2">
            {plan.days.map((d) => (
              <button
                key={d.day}
                type="button"
                onClick={() => setDayIdx(d.slot)}
                className={`rounded-lg border p-4 text-left transition-all active:scale-[0.98] ${
                  d.slot === dayIdx ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                }`}
              >
                <span className="text-caption font-bold text-accent-hi">{t('workout.dayN', { n: d.day })}</span>
                <p className="mt-1 text-body font-semibold">{t(`planGen.day${d.slot}`)}</p>
                <p className="text-micro text-text-faint">{d.exercises.length} × {t('nav.log').toLowerCase()}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            disabled={!day}
            className="btn-primary w-full"
          >
            <Play size={18} /> {t('workout.start')}
          </button>
        </div>
      </div>
    );
  }

  if (!exercise) {
    setFinished(true);
    return null;
  }

  const doneThisExercise = logged.filter((l) => l.vector === exercise.vector).length;
  const isLastExercise = exIdx >= day.exercises.length - 1;

  const logSet = () => {
    const w = parseFloat(weight) || 0;
    if (!(w > 0)) return;
    const repsN = parseInt(reps) || 0;
    setLogged((prev) => [
      ...prev,
      {
        id: uid('set'),
        vector: exercise.vector,
        weight: w,
        ...(exercise.reps.includes('s') || repsN === 0
          ? { durationSec: repsN }
          : { reps: repsN }),
      },
    ]);
    setRest(120);
  };

  const nextExercise = () => {
    if (isLastExercise) {
      // persist all lifts grouped per vector
      const groups = new Map<string, LoggedSet[]>();
      for (const l of logged) {
        groups.set(l.vector, [...(groups.get(l.vector) ?? []), l]);
      }
      for (const [vector, setsOfVec] of groups) {
        const firstEx = day.exercises.find((e) => e.vector === vector)!;
        addLift({
          arm,
          vector: vector as never,
          handle: firstEx.handle,
          pulley: firstEx.pulley,
          mode: 'dynamic',
          sets: setsOfVec.map((s) => ({
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            durationSec: s.durationSec,
          })),
        });
      }
      setFinished(true);
    } else {
      setExIdx((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <ScreenHeader
        title={t(`planGen.day${day.slot}`)}
        subtitle={`${t(`enum.arm.${arm}`)} · ${t('workout.exerciseN', { cur: exIdx + 1, total: day.exercises.length })} · ${totalLogged} ${t('log.sets').toLowerCase()}`}
        backTo="/plan"
      />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {day.exercises.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < exIdx ? 'bg-ok' : i === exIdx ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Exercise card */}
        <section className="card space-y-4">
          <div>
            <h2 className="text-h2 font-extrabold">{t(`enum.vector.${exercise.vector}`)}</h2>
            <p className="text-caption text-text-faint">
              {t(`enum.handle.${exercise.handle}`)} · {t(`enum.pulley.${exercise.pulley}`)}
              {' · '}
              {targetSets}×{exercise.reps}
            </p>
          </div>

          <p className="text-caption text-text-dim">
            {doneThisExercise}/{targetSets} {t('workout.setsDone')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label mb-1 block">{t('log.weight', { unit })}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                className="input py-2 text-h3 font-bold"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label mb-1 block">{t('workout.repsOrSec')}</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                className="input py-2 text-h3 font-bold"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </label>
          </div>

          <button type="button" onClick={logSet} disabled={!(parseFloat(weight) > 0)} className="btn-primary w-full">
            <Check size={18} /> {t('workout.logSet')}
          </button>
        </section>

        {/* Rest timer */}
        {rest > 0 && (
          <section className="card flex items-center gap-4 border-accent/40">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent">
              <TimerIcon size={22} />
            </div>
            <div className="flex-1">
              <p className="label">{t('workout.restTitle')}</p>
              <p className="text-h2 font-extrabold tabular-nums">
                {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, '0')}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              {[60, 120, 180].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRest(s)}
                  className={`rounded-sm px-2 py-0.5 text-micro font-bold ${rest > s - 15 && rest <= s ? 'bg-accent-lo text-accent-hi' : 'bg-surfaceAlt text-text-dim'}`}
                >
                  {s / 60}m
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setRest(0)} aria-label={t('workout.skipRest')} className="shrink-0 text-text-faint hover:text-text">
              <SkipForward size={20} />
            </button>
          </section>
        )}

        <button type="button" onClick={nextExercise} className="btn-ghost w-full">
          {isLastExercise ? (
            <>
              <Flag size={16} /> {t('workout.finish')} <ChevronRight size={16} />
            </>
          ) : (
            <>
              {t('workout.nextExercise')} <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
