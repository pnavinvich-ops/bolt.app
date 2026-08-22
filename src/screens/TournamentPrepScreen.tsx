import { useState } from 'react';
import { CalendarDays, Plus, Trash2, Target, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTournaments } from '@/stores/tournaments';
import { useSettings } from '@/stores/settings';
import { WEIGHT_CLASS_LIMITS, classLimitKg } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';

type Phase = 'base' | 'build' | 'peak' | 'taper' | 'past';

function todayKeyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = todayKeyLocal().split('-').map(Number);
  const today = new Date(ty, tm - 1, td).getTime();
  return Math.round((target - today) / 86_400_000);
}

function phaseFor(days: number): Phase {
  if (days < 0) return 'past';
  if (days <= 2) return 'taper';
  if (days <= 7) return 'peak';
  if (days <= 21) return 'build';
  return 'base';
}

const PHASE_TIPS: Record<Exclude<Phase, 'past'>, string[]> = {
  base: ['tipBase1', 'tipBase2', 'tipBase3'],
  build: ['tipBuild1', 'tipBuild2', 'tipBuild3'],
  peak: ['tipPeak1', 'tipPeak2', 'tipPeak3'],
  taper: ['tipTaper1', 'tipTaper2', 'tipTaper3'],
};

const PHASE_COLOR: Record<Phase, string> = {
  base: 'text-text-dim',
  build: 'text-accent',
  peak: 'text-warn',
  taper: 'text-ok',
  past: 'text-text-faint',
};

export default function TournamentPrepScreen() {
  const { t } = useTranslation();
  const tournaments = useTournaments((s) => s.tournaments);
  const addTournament = useTournaments((s) => s.addTournament);
  const removeTournament = useTournaments((s) => s.removeTournament);
  const bodyWeightKg = useSettings((s) => s.settings.bodyWeight);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', dateKey: '', weightClass: '', targetWeightKg: '' });

  const upcoming = useTournaments.getState().nextUpcoming();

  const submit = () => {
    if (!form.name.trim() || !form.dateKey) return;
    addTournament({
      name: form.name.trim(),
      dateKey: form.dateKey,
      weightClass: form.weightClass || undefined,
      targetWeightKg: form.targetWeightKg ? parseFloat(form.targetWeightKg) : undefined,
    });
    setForm({ name: '', dateKey: '', weightClass: '', targetWeightKg: '' });
    setAdding(false);
  };

  const pickClass = (wc: string) => {
    const limit = classLimitKg(wc);
    setForm({
      ...form,
      weightClass: wc,
      targetWeightKg: limit != null ? String(limit) : form.targetWeightKg,
    });
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('tour.title')} subtitle={t('tour.subtitle')} backTo="/tools" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-primary w-full">
            <Plus size={18} /> {t('tour.addCta')}
          </button>
        )}

        {adding && (
          <section className="card space-y-3">
            <h3 className="text-h3">{t('tour.addTitle')}</h3>
            <input
              className="input"
              placeholder={t('tour.namePh')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="block">
              <span className="label mb-1.5 block">{t('tour.dateLabel')}</span>
              <input
                type="date"
                className="input"
                value={form.dateKey}
                min={todayKeyLocal()}
                onChange={(e) => setForm({ ...form, dateKey: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">{t('tour.classLabel')}</span>
              <select
                className="input"
                value={form.weightClass}
                onChange={(e) => pickClass(e.target.value)}
              >
                <option value="">{t('tour.classAny')}</option>
                {Object.keys(WEIGHT_CLASS_LIMITS).map((wc) => (
                  <option key={wc} value={wc}>
                    {wc}
                    {WEIGHT_CLASS_LIMITS[wc] != null ? ` (≤${WEIGHT_CLASS_LIMITS[wc]} kg)` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label mb-1.5 block">{t('tour.targetLabel')}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                className="input"
                placeholder={t('tour.targetPh')}
                value={form.targetWeightKg}
                onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })}
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAdding(false)} className="btn-ghost flex-1">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!form.name.trim() || !form.dateKey}
                className="btn-primary flex-1"
              >
                {t('common.save')}
              </button>
            </div>
          </section>
        )}

        {/* Next tournament detail */}
        {upcoming ? (
          <TournamentCard id={upcoming.id} bodyWeightKg={bodyWeightKg} />
        ) : (
          !adding && (
            <div className="card flex flex-col items-center gap-2 py-8 text-center">
              <CalendarDays size={24} className="text-text-faint" />
              <p className="text-body font-semibold">{t('tour.none')}</p>
              <p className="text-caption text-text-faint">{t('tour.noneMsg')}</p>
            </div>
          )
        )}

        {/* All tournaments */}
        {tournaments.length > 0 && (
          <section className="space-y-2">
            <p className="label">{t('tour.allTitle')}</p>
            {tournaments.map((tr) => {
              const days = daysUntil(tr.dateKey);
              return (
                <div
                  key={tr.id}
                  className={`card flex items-center gap-3 ${upcoming?.id === tr.id ? 'border-accent/40' : ''}`}
                >
                  <CalendarDays size={16} className={`shrink-0 ${PHASE_COLOR[phaseFor(days)]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold">{tr.name}</p>
                    <p className="text-caption text-text-faint">
                      {tr.dateKey}
                      {tr.weightClass ? ` · ${tr.weightClass}` : ''}
                      {tr.targetWeightKg ? ` · ${tr.targetWeightKg}kg` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 text-caption font-bold ${days < 0 ? 'text-text-faint' : 'text-accent'}`}>
                    {days >= 0 ? t('tour.daysLeft', { count: days }) : t('tour.past')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTournament(tr.id)}
                    aria-label={t('common.delete')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function TournamentCard({ id, bodyWeightKg }: { id: string; bodyWeightKg?: number }) {
  const { t } = useTranslation();
  const tr = useTournaments((s) => s.tournaments.find((x) => x.id === id));
  if (!tr) return null;

  const days = daysUntil(tr.dateKey);
  const phase = phaseFor(days);

  const target =
    tr.targetWeightKg ?? classLimitKg(tr.weightClass);
  const current = bodyWeightKg;
  let weightBlock: React.ReactNode = null;
  if (current != null && target != null && days >= 0) {
    const diff = Math.round((current - target) * 10) / 10;
    const weeksLeft = Math.max(days / 7, 0.5);
    if (diff > 0.3) {
      const pace = diff / weeksLeft;
      weightBlock = (
        <div className="space-y-1 text-caption text-text-dim">
          <p>
            {t('tour.toLose', { kg: diff })} · {t('tour.pace', { kg: Math.round(pace * 10) / 10 })}
          </p>
          <p className={pace > 1 ? 'font-bold text-bad' : 'text-ok'}>
            {pace > 1 ? t('tour.paceFast') : t('tour.paceOk')}
          </p>
        </div>
      );
    } else if (diff < -0.3) {
      weightBlock = (
        <p className="text-caption text-text-dim">{t('tour.toGain', { kg: Math.abs(diff) })}</p>
      );
    } else {
      weightBlock = <p className="text-caption text-ok font-bold">{t('tour.onTarget')}</p>;
    }
  }

  return (
    <section className="card space-y-4 border-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-h2 font-extrabold">{tr.name}</h3>
          <p className="text-caption text-text-faint">
            {[tr.dateKey, tr.weightClass].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-h1 font-extrabold leading-none ${days < 0 ? 'text-text-faint' : 'text-accent'}`}>
            {days >= 0 ? days : ''}
          </p>
          <p className={`text-micro font-bold uppercase tracking-wide ${PHASE_COLOR[phase]}`}>
            {days < 0 ? t('tour.past') : t(`tour.phase_${phase}`)}
          </p>
        </div>
      </div>

      {weightBlock && (
        <div className="rounded-md bg-surfaceAlt p-3 space-y-2">
          <p className="label flex items-center gap-1.5">
            <Scale size={12} /> {t('tour.weightTitle')}
          </p>
          {weightBlock}
        </div>
      )}

      {phase !== 'past' && (
        <div>
          <p className="label mb-2 flex items-center gap-1.5">
            <Target size={12} /> {t('tour.checklistTitle')}
          </p>
          <ul className="space-y-1.5">
            {PHASE_TIPS[phase].map((key) => (
              <li key={key} className="flex items-start gap-2 text-caption text-text-dim">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {t(`tour.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
