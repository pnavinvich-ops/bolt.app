import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GymSet } from '@/types/domain';
import { GYM_EXERCISES, GYM_MUSCLES } from '@/data/gymExercises';
import { useGym } from '@/stores/gym';
import { useSettings } from '@/stores/settings';
import { kgToUnit, uid } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';

export default function GymLogScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addLog = useGym((s) => s.addLog);
  const logs = useGym((s) => s.logs);
  const unit = useSettings((s) => s.settings.unit);

  const [muscle, setMuscle] = useState<string | null>(null);
  const [exerciseKey, setExerciseKey] = useState<string | null>(null);
  const [sets, setSets] = useState<GymSet[]>([{ id: uid('gs'), weight: 0, reps: 0 }]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const list = useMemo(
    () => GYM_EXERCISES.filter((e) => !muscle || e.muscle === muscle),
    [muscle],
  );

  const lastForExercise = useMemo(
    () => logs.find((l) => l.exerciseKey === exerciseKey),
    [logs, exerciseKey],
  );

  const applyLast = () => {
    if (!lastForExercise) return;
    const s0 = lastForExercise.sets[0];
    if (!s0) return;
    setSets((prev) =>
      prev.map((s, i) =>
        i === 0 ? { ...s, weight: s.weight || s0.weight, reps: s.reps || s0.reps } : s,
      ),
    );
  };

  const updateSet = (id: string, patch: Partial<GymSet>) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSetRow = () => {
    const last = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      { id: uid('gs'), weight: last?.weight ?? 0, reps: last?.reps ?? 0 },
    ]);
  };

  const canSave =
    !!exerciseKey && sets.some((s) => s.weight > 0 && s.reps > 0);

  const save = () => {
    if (!exerciseKey || !canSave) return;
    addLog({
      exerciseKey,
      sets: sets.filter((s) => s.weight > 0 && s.reps > 0),
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => navigate('/history'), 600);
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('gym.title')} subtitle={t('gym.subtitle')} backTo="/history" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {/* Muscle filter */}
        <section>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
            <button
              type="button"
              onClick={() => setMuscle(null)}
              className={`shrink-0 rounded-md border px-2.5 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
                muscle === null
                  ? 'border-accent bg-accent-lo text-accent-hi'
                  : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
              }`}
            >
              {t('gym.all')}
            </button>
            {GYM_MUSCLES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMuscle(muscle === m ? null : m)}
                className={`shrink-0 rounded-md border px-2.5 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
                  muscle === m
                    ? 'border-accent bg-accent-lo text-accent-hi'
                    : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                }`}
              >
                {t(`gym.muscle_${m}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Exercise picker */}
        <section>
          <div className="grid grid-cols-2 gap-2">
            {list.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => {
                  setExerciseKey(e.key);
                  setSaved(false);
                }}
                className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-caption font-semibold transition-all active:scale-95 ${
                  exerciseKey === e.key
                    ? 'border-accent bg-accent-lo text-accent-hi'
                    : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                }`}
              >
                <Dumbbell size={14} className="shrink-0 opacity-60" />
                <span className="truncate">{t(`gym.ex_${e.key}`)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sets editor */}
        {exerciseKey && (
          <section className="space-y-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="label">{t('log.sets')}</p>
              <span className="text-caption text-text-faint">{t('log.setCount', { count: sets.length })}</span>
            </div>

            {lastForExercise && (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surfaceAlt px-3 py-2">
                <span className="flex-1 truncate text-caption text-text-faint">
                  {t('log.lastTime', {
                    weight: `${kgToUnit(Math.max(...lastForExercise.sets.map((s) => s.weight)), unit)}`,
                    unit,
                    detail: `× ${Math.max(...lastForExercise.sets.map((s) => s.reps))} ${t('log.reps').toLowerCase()}`,
                  })}
                </span>
                <button
                  type="button"
                  onClick={applyLast}
                  className="shrink-0 text-caption font-bold text-accent active:scale-95"
                >
                  {t('log.fillLast')}
                </button>
              </div>
            )}

            {sets.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-surfaceAlt p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surfaceHigh text-caption font-bold text-text-dim">
                  {idx + 1}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    placeholder="0"
                    value={s.weight || ''}
                    onChange={(e) =>
                      updateSet(s.id, { weight: parseFloat(e.target.value) || 0 })
                    }
                    className="input py-1.5 text-body"
                  />
                  <span className="text-micro text-text-faint">{unit}</span>
                  <span className="text-micro text-text-faint">×</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="0"
                    value={s.reps || ''}
                    onChange={(e) => updateSet(s.id, { reps: parseInt(e.target.value) || 0 })}
                    className="input py-1.5 text-body"
                  />
                  <span className="text-micro text-text-faint">{t('log.reps').toLowerCase()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSets((prev) => (prev.length > 1 ? prev.filter((x) => x.id !== s.id) : prev))}
                  disabled={sets.length === 1}
                  aria-label={t('log.removeSetAria')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSetRow}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-borderStrong py-2.5 text-caption text-text-dim transition-colors hover:border-accent hover:text-accent"
            >
              <Plus size={16} /> {t('log.addSet')}
            </button>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('log.notesPh')}
              rows={2}
              className="input resize-none"
            />

            <button type="button" onClick={save} disabled={!canSave || saved} className="btn-primary w-full">
              {saved ? (
                <>
                  <Check size={18} /> {t('log.saved')}
                </>
              ) : (
                <>
                  <Dumbbell size={18} /> {t('gym.saveWorkout')}
                </>
              )}
            </button>
          </section>
        )}

        {!exerciseKey && list.length > 0 && (
          <p className="pt-2 text-center text-caption text-text-faint">{t('gym.pickExercise')}</p>
        )}
      </div>
    </div>
  );
}
