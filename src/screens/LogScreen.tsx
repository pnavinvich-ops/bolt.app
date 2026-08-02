import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Dumbbell, Timer } from 'lucide-react';
import type { Arm, Vector, Handle, Pulley, Mode, SetEntry } from '@/types/domain';
import {
  ARMS,
  ARM_LABEL,
  VECTORS,
  VECTOR_LABEL,
  VECTOR_HINT,
  HANDLES,
  HANDLE_LABEL,
  PULLEYS,
  PULLEY_LABEL,
  MODES,
  MODE_LABEL,
  uid,
} from '@/types/constants';
import { useLifts } from '@/stores/lifts';
import { useSettings } from '@/stores/settings';
import SegmentedControl from '@/components/SegmentedControl';
import ScreenHeader from '@/components/ScreenHeader';

export default function LogScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addLift = useLifts((s) => s.addLift);
  const unit = useSettings((s) => s.settings.unit);

  const [arm, setArm] = useState<Arm>('right');
  const [vector, setVector] = useState<Vector>('pronation');
  const [handle, setHandle] = useState<Handle>('cone');
  const [pulley, setPulley] = useState<Pulley>('low');
  const [mode, setMode] = useState<Mode>('dynamic');
  const [sets, setSets] = useState<SetEntry[]>([{ id: uid('set'), weight: 0, reps: 0 }]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const pArm = params.get('arm') as Arm | null;
    const pVec = params.get('vector') as Vector | null;
    const pHandle = params.get('handle') as Handle | null;
    const pPulley = params.get('pulley') as Pulley | null;
    if (pArm && ARMS.includes(pArm)) setArm(pArm);
    if (pVec && VECTORS.includes(pVec)) setVector(pVec);
    if (pHandle && HANDLES.includes(pHandle)) setHandle(pHandle);
    if (pPulley && PULLEYS.includes(pPulley)) setPulley(pPulley);
  }, [params]);

  const updateSet = (id: string, patch: Partial<SetEntry>) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        id: uid('set'),
        weight: last?.weight ?? 0,
        reps: mode === 'dynamic' ? last?.reps ?? 0 : undefined,
        durationSec: mode === 'isometric' ? last?.durationSec ?? 0 : undefined,
      },
    ]);
  };

  const removeSet = (id: string) => {
    setSets((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSets((prev) =>
      prev.map((s) =>
        m === 'dynamic'
          ? { ...s, reps: s.reps ?? 0, durationSec: undefined }
          : { ...s, reps: undefined, durationSec: s.durationSec ?? 0 },
      ),
    );
  };

  const handleSave = (saveBoth: boolean) => {
    const cleanSets = sets.filter((s) => s.weight > 0 && ((mode === 'dynamic' && (s.reps ?? 0) > 0) || (mode === 'isometric' && (s.durationSec ?? 0) > 0)));
    if (cleanSets.length === 0) return;

    addLift({ arm, vector, handle, pulley, mode, sets: cleanSets, notes: notes.trim() || undefined });
    if (saveBoth && arm === 'left') {
      addLift({ arm: 'right', vector, handle, pulley, mode, sets: cleanSets, notes: notes.trim() || undefined });
    } else if (saveBoth && arm === 'right') {
      addLift({ arm: 'left', vector, handle, pulley, mode, sets: cleanSets, notes: notes.trim() || undefined });
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/history');
    }, 600);
  };

  const canSave = sets.some((s) => s.weight > 0 && ((mode === 'dynamic' && (s.reps ?? 0) > 0) || (mode === 'isometric' && (s.durationSec ?? 0) > 0)));

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title="Log Lift" subtitle="Record a training set" backTo="/history" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {/* Arm selector */}
        <section>
          <p className="label mb-2">Arm</p>
          <SegmentedControl
            options={ARMS.map((a) => ({ value: a, label: ARM_LABEL[a] }))}
            value={arm}
            onChange={setArm}
          />
        </section>

        {/* Vector */}
        <section>
          <p className="label mb-2">Vector</p>
          <div className="grid grid-cols-3 gap-2">
            {VECTORS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVector(v)}
                className={`rounded-md border px-2 py-2.5 text-caption font-semibold transition-all active:scale-95 ${
                  vector === v
                    ? 'border-accent bg-accent-lo text-accent-hi'
                    : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                }`}
              >
                {VECTOR_LABEL[v]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-caption text-text-faint">{VECTOR_HINT[vector]}</p>
        </section>

        {/* Mode */}
        <section>
          <p className="label mb-2">Mode</p>
          <SegmentedControl
            options={MODES.map((m) => ({ value: m, label: MODE_LABEL[m] }))}
            value={mode}
            onChange={switchMode}
          />
        </section>

        {/* Handle + Pulley */}
        <section className="grid grid-cols-2 gap-3">
          <div>
            <p className="label mb-2">Handle</p>
            <select
              className="input"
              value={handle}
              onChange={(e) => setHandle(e.target.value as Handle)}
            >
              {HANDLES.map((h) => (
                <option key={h} value={h}>
                  {HANDLE_LABEL[h]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="label mb-2">Pulley</p>
            <select
              className="input"
              value={pulley}
              onChange={(e) => setPulley(e.target.value as Pulley)}
            >
              {PULLEYS.map((p) => (
                <option key={p} value={p}>
                  {PULLEY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Sets */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="label">Sets</p>
            <span className="text-caption text-text-faint">{sets.length} set{sets.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {sets.map((set, idx) => (
              <div
                key={set.id}
                className="flex items-center gap-2 rounded-md border border-border bg-surfaceAlt p-3 animate-slide-up"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surfaceHigh text-caption font-bold text-text-dim">
                  {idx + 1}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-micro text-text-faint">Weight ({unit})</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="input py-1.5 text-body"
                      placeholder="0"
                    />
                  </div>
                  {mode === 'dynamic' ? (
                    <div className="flex-1">
                      <label className="mb-0.5 block text-micro text-text-faint">Reps</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) || 0 })}
                        className="input py-1.5 text-body"
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <label className="mb-0.5 block text-micro text-text-faint">Hold (sec)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={set.durationSec || ''}
                        onChange={(e) => updateSet(set.id, { durationSec: parseInt(e.target.value) || 0 })}
                        className="input py-1.5 text-body"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSet(set.id)}
                  disabled={sets.length === 1}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad disabled:opacity-30"
                  aria-label="Remove set"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSet}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-borderStrong py-2.5 text-caption text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            <Plus size={16} /> Add set
          </button>
        </section>

        {/* Notes */}
        <section>
          <p className="label mb-2">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any pain or PRs?"
            rows={3}
            className="input resize-none"
          />
        </section>

        {/* Save buttons */}
        <section className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={!canSave || saved}
            className="btn-primary w-full"
          >
            {saved ? (
              <>
                <Check size={18} /> Saved
              </>
            ) : mode === 'dynamic' ? (
              <>
                <Dumbbell size={18} /> Save {ARM_LABEL[arm]} lift
              </>
            ) : (
              <>
                <Timer size={18} /> Save {ARM_LABEL[arm]} hold
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={!canSave || saved}
            className="btn-ghost w-full"
          >
            Save both arms
          </button>
        </section>
      </div>
    </div>
  );
}
