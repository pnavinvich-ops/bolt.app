import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Dumbbell, Timer, Bookmark, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Arm, Vector, Handle, Pulley, Mode, SetEntry } from '@/types/domain';
import {
  ARMS,
  VECTORS,
  HANDLES,
  PULLEYS,
  MODES,
  uid,
  kgToUnit,
} from '@/types/constants';
import { useLifts } from '@/stores/lifts';
import { useSettings } from '@/stores/settings';
import { usePresets } from '@/stores/presets';
import { oneRepMax } from '@/services/strength';
import SegmentedControl from '@/components/SegmentedControl';
import ScreenHeader from '@/components/ScreenHeader';
import ThemeSelect from '@/components/ThemeSelect';

export default function LogScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addLift = useLifts((s) => s.addLift);
  const lifts = useLifts((s) => s.lifts);
  const unit = useSettings((s) => s.settings.unit);
  const presets = usePresets((s) => s.presets);
  const addPreset = usePresets((s) => s.addPreset);
  const removePreset = usePresets((s) => s.removePreset);
  usePresets((s) => s.hydrate);

  const [arm, setArm] = useState<Arm>('right');
  const [vector, setVector] = useState<Vector>('pronation');
  const [handle, setHandle] = useState<Handle>('cone');
  const [pulley, setPulley] = useState<Pulley>('low');
  const [mode, setMode] = useState<Mode>('dynamic');
  const [sets, setSets] = useState<SetEntry[]>([{ id: uid('set'), weight: 0, reps: 0 }]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [presetSaved, setPresetSaved] = useState(false);

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

  // Smart prefill: most recent lift with the exact same setup.
  const lastLift = useMemo(
    () =>
      lifts.find(
        (l) =>
          l.arm === arm &&
          l.vector === vector &&
          l.handle === handle &&
          l.pulley === pulley &&
          l.mode === mode,
      ),
    [lifts, arm, vector, handle, pulley, mode],
  );

  const applyLastLift = () => {
    if (!lastLift) return;
    const s0 = lastLift.sets[0];
    if (!s0) return;
    setSets((prev) =>
      prev.map((s, i) =>
        i === 0
          ? {
              ...s,
              weight: s.weight || s0.weight,
              reps: mode === 'dynamic' ? s.reps || s0.reps : undefined,
              durationSec: mode === 'isometric' ? s.durationSec || s0.durationSec : undefined,
            }
          : s,
      ),
    );
  };

  // Live estimated 1RM from the strongest entered dynamic set.
  const liveE1rm = useMemo(() => {
    if (mode !== 'dynamic') return 0;
    let best = 0;
    for (const s of sets) {
      const orm = oneRepMax(s.weight, s.reps ?? 0);
      if (orm > best) best = orm;
    }
    return best;
  }, [sets, mode]);

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

  const applyPreset = (p: (typeof presets)[number]) => {
    setArm(p.arm);
    setVector(p.vector);
    setHandle(p.handle);
    setPulley(p.pulley);
    setMode(p.mode);
  };

  const saveCurrentAsPreset = () => {
    addPreset({ arm, vector, handle, pulley, mode });
    setPresetSaved(true);
    setTimeout(() => setPresetSaved(false), 1500);
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('log.title')} subtitle={t('log.subtitle')} backTo="/history" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {/* Presets */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="label">{t('presets.title')}</p>
            <button
              type="button"
              onClick={saveCurrentAsPreset}
              className={`flex items-center gap-1 text-caption font-semibold transition-colors ${
                presetSaved ? 'text-ok' : 'text-text-faint hover:text-accent'
              }`}
            >
              {presetSaved ? <Check size={14} /> : <Bookmark size={14} />}
              {presetSaved ? t('presets.saved') : t('presets.save')}
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="text-caption text-text-faint">{t('presets.empty')}</p>
          ) : (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {presets.map((p) => (
                <span
                  key={p.id}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-surfaceAlt py-1.5 pl-3 pr-1.5"
                >
                  <button type="button" onClick={() => applyPreset(p)} className="text-caption font-semibold text-text-dim transition-colors hover:text-accent">
                    {t(`enum.vector.${p.vector}`)} · {t(`enum.handle.${p.handle}`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePreset(p.id)}
                    aria-label={t('common.delete')}
                    className="text-text-faint transition-colors hover:text-bad"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Arm selector */}
        <section>
          <p className="label mb-2">{t('log.arm')}</p>
          <SegmentedControl
            options={ARMS.map((a) => ({ value: a, label: t(`enum.arm.${a}`) }))}
            value={arm}
            onChange={setArm}
          />
        </section>

        {/* Vector */}
        <section>
          <p className="label mb-2">{t('log.vector')}</p>
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
                {t(`enum.vector.${v}`)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-caption text-text-faint">{t(`enum.vectorHint.${vector}`)}</p>
        </section>

        {/* Mode */}
        <section>
          <p className="label mb-2">{t('log.mode')}</p>
          <SegmentedControl
            options={MODES.map((m) => ({ value: m, label: t(`enum.mode.${m}`) }))}
            value={mode}
            onChange={switchMode}
          />
        </section>

        {/* Handle + Pulley */}
        <section className="grid grid-cols-2 gap-3">
          <div>
            <p className="label mb-2">{t('log.handle')}</p>
            <ThemeSelect
              value={handle}
              onChange={setHandle}
              options={HANDLES.map((h) => ({ value: h, label: t(`enum.handle.${h}`) }))}
            />
          </div>
          <div>
            <p className="label mb-2">{t('log.pulley')}</p>
            <ThemeSelect
              value={pulley}
              onChange={setPulley}
              options={PULLEYS.map((p) => ({ value: p, label: t(`enum.pulley.${p}`) }))}
            />
          </div>
        </section>

        {/* Sets */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="label">{t('log.sets')}</p>
            <div className="flex items-center gap-3">
              {liveE1rm > 0 && (
                <span className="text-caption font-bold text-accent">
                  e1RM ≈ {kgToUnit(liveE1rm, unit)} {unit}
                </span>
              )}
              <span className="text-caption text-text-faint">{t('log.setCount', { count: sets.length })}</span>
            </div>
          </div>

          {lastLift && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surfaceAlt px-3 py-2">
              <span className="flex-1 truncate text-caption text-text-faint">
                {t('log.lastTime', {
                  weight: `${kgToUnit(Math.max(...lastLift.sets.map((s) => s.weight)), unit)}`,
                  unit,
                  detail:
                    mode === 'dynamic'
                      ? `× ${Math.max(...lastLift.sets.map((s) => s.reps ?? 0))} ${t('log.reps').toLowerCase()}`
                      : `× ${Math.max(...lastLift.sets.map((s) => s.durationSec ?? 0))} ${t('log.secondsShort')}`,
                })}
              </span>
              <button
                type="button"
                onClick={applyLastLift}
                className="shrink-0 text-caption font-bold text-accent transition-transform active:scale-95"
              >
                {t('log.fillLast')}
              </button>
            </div>
          )}
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
                    <label className="mb-0.5 block text-micro text-text-faint">{t('log.weight', { unit })}</label>
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
                      <label className="mb-0.5 block text-micro text-text-faint">{t('log.reps')}</label>
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
                      <label className="mb-0.5 block text-micro text-text-faint">{t('log.holdSec')}</label>
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
                  aria-label={t('log.removeSetAria')}
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
            <Plus size={16} /> {t('log.addSet')}
          </button>
        </section>

        {/* Notes */}
        <section>
          <p className="label mb-2">{t('log.notes')}</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('log.notesPh')}
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
                <Check size={18} /> {t('log.saved')}
              </>
            ) : mode === 'dynamic' ? (
              <>
                <Dumbbell size={18} /> {t('log.saveLift', { arm: t(`enum.arm.${arm}`) })}
              </>
            ) : (
              <>
                <Timer size={18} /> {t('log.saveHold', { arm: t(`enum.arm.${arm}`) })}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={!canSave || saved}
            className="btn-ghost w-full"
          >
            {t('log.saveBoth')}
          </button>
        </section>
      </div>
    </div>
  );
}
