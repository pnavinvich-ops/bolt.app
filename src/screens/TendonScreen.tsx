import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, Calendar, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTendon } from '@/stores/tendon';
import { currentTendonIndex } from '@/services/tendonHealth';
import { deloadStatus } from '@/services/deload';
import { PAIN_AREAS } from '@/types/constants';
import type { PainArea } from '@/types/domain';
import i18n from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';

const TREND_KEY: Record<string, string> = {
  improving: 'tendon.trendImproving',
  stable: 'tendon.trendStable',
  declining: 'tendon.trendDeclining',
  unknown: 'tendon.trendUnknown',
};

const LABEL_KEY: Record<string, string> = {
  healthy: 'tendon.lHealthy',
  good: 'tendon.lGood',
  monitor: 'tendon.lMonitor',
  strained: 'tendon.lStrained',
  critical: 'tendon.lCritical',
};

function RehabCard() {
  const { t } = useTranslation();
  const checks = useTendon((s) => s.checks);
  const index = currentTendonIndex(checks);
  const deload = deloadStatus(checks);

  const recent = checks.slice(0, 7);
  const areaCounts = new Map<PainArea, number>();
  for (const c of recent) {
    for (const a of c.painAreas ?? []) {
      areaCounts.set(a, (areaCounts.get(a) ?? 0) + 1);
    }
  }
  const topAreas = Array.from(areaCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const severeDay = recent.some((c) => (c.elbow + c.forearm) / 2 <= 4);
  const criteria = [
    { ok: index.score >= 60, key: 'critScore' },
    { ok: index.trend !== 'declining', key: 'critTrend' },
    { ok: !severeDay, key: 'critSevere' },
    { ok: topAreas.length === 0, key: 'critPainFree' },
  ];
  const allClear = criteria.every((c) => c.ok);

  return (
    <section className="card space-y-3">
      <p className="label flex items-center gap-1.5">
        <AlertTriangle size={12} /> {t('tendon.rehabTitle')}
      </p>

      <div
        className={`rounded-md border p-3 ${
          deload.level === 'deload'
            ? 'border-bad/40 bg-bad/5'
            : deload.level === 'warn'
              ? 'border-warn/30 bg-warn/5'
              : 'border-ok/30 bg-ok/5'
        }`}
      >
        <p className={`text-body font-bold ${deload.level === 'deload' ? 'text-bad' : deload.level === 'warn' ? 'text-warn' : 'text-ok'}`}>
          {t(`rehab.status_${deload.level}`)}
        </p>
        <p className="mt-0.5 text-caption text-text-dim">{t(`rehab.advice_${deload.level}`)}</p>
      </div>

      <div>
        <p className="label mb-2">{t('rehab.criteriaTitle')}</p>
        <ul className="space-y-1.5">
          {criteria.map((c) => (
            <li key={c.key} className="flex items-start gap-2 text-caption">
              <Check size={15} className={`mt-0.5 shrink-0 ${c.ok ? 'text-ok' : 'text-text-faint opacity-40'}`} />
              <span className={c.ok ? 'text-text-dim' : 'text-text-faint'}>{t(`rehab.${c.key}`)}</span>
            </li>
          ))}
        </ul>
        <p className={`mt-2 text-caption font-bold ${allClear ? 'text-ok' : 'text-warn'}`}>
          {allClear ? t('rehab.allClear') : t('rehab.notYet')}
        </p>
      </div>

      {topAreas.length > 0 && (
        <div>
          <p className="label mb-1.5">{t('rehab.hotSpots')}</p>
          <div className="flex flex-wrap gap-1.5">
            {topAreas.map(([area, n]) => (
              <span key={area} className="rounded-xs bg-bad-tint px-2 py-1 text-micro font-semibold text-bad">
                {t(`tendon.area_${area}`)} ×{n}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const color = value <= 3 ? 'text-bad' : value <= 6 ? 'text-warn' : 'text-ok';
  const trackColor = value <= 3 ? 'bg-bad' : value <= 6 ? 'bg-warn' : 'bg-ok';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-body text-text-dim">{label}</span>
        <span className={`text-h3 font-bold ${color}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-accent"
        style={{ accentColor: value <= 3 ? '#EF476F' : value <= 6 ? '#FFD166' : '#3DDC97' }}
      />
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surfaceAlt">
        <div className={`h-full rounded-full transition-all ${trackColor}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

export default function TendonScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addCheck = useTendon((s) => s.addCheck);
  const checks = useTendon((s) => s.checks);
  const index = currentTendonIndex(checks);
  const alreadyToday = useTendon((s) => s.hasCheckForToday());

  const [elbow, setElbow] = useState(7);
  const [forearm, setForearm] = useState(7);
  const [painAreas, setPainAreas] = useState<PainArea[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleArea = (a: PainArea) => {
    setPainAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const handleSave = () => {
    addCheck({ elbow, forearm, painAreas: painAreas.length > 0 ? painAreas : undefined, notes: notes.trim() || undefined });
    setSaved(true);
    setTimeout(() => navigate('/tools'), 500);
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('tendon.title')} subtitle={t('tendon.subtitle')} backTo="/tools" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {index.daysLogged > 0 && (
          <section className="card flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${index.score >= 60 ? 'border-ok' : index.score >= 40 ? 'border-warn' : 'border-bad'}`}>
              <span className={`text-h3 font-extrabold ${index.score >= 60 ? 'text-ok' : index.score >= 40 ? 'text-warn' : 'text-bad'}`}>{index.score}</span>
            </div>
            <div className="flex-1">
              <p className="label">{t('tendon.sevenDayIndex')}</p>
              <p className="text-body font-semibold">
                {t(LABEL_KEY[index.label])} · {t(TREND_KEY[index.trend])}
              </p>
              <p className="text-caption text-text-faint">{t('tendon.daysLogged', { count: index.daysLogged })}</p>
            </div>
          </section>
        )}

        {alreadyToday && (
          <div className="card-alt flex items-center gap-2">
            <Calendar size={16} className="text-ok" />
            <p className="text-caption text-text-dim">{t('tendon.alreadyToday')}</p>
          </div>
        )}

        {index.daysLogged > 0 && (
          <RehabCard />
        )}

        <section className="card space-y-5">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-accent" />
            <h3 className="text-h3">{t('tendon.todayCheckin')}</h3>
          </div>
          <Slider label={t('tendon.elbowHealth')} value={elbow} onChange={setElbow} />
          <Slider label={t('tendon.forearmHealth')} value={forearm} onChange={setForearm} />
          <div>
            <p className="label mb-2">{t('tendon.painAreas')}</p>
            <div className="flex flex-wrap gap-1.5">
              {PAIN_AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  className={`rounded-md border px-2.5 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
                    painAreas.includes(a)
                      ? 'border-bad bg-bad-tint text-bad'
                      : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                  }`}
                >
                  {t(`tendon.area_${a}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-2">{t('tendon.notes')}</p>
            <textarea
              className="input resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tendon.notesPh')}
            />
          </div>
          <button type="button" onClick={handleSave} disabled={saved} className="btn-primary w-full">
            {saved ? <><Check size={18} /> {t('log.saved')}</> : <><Heart size={18} /> {t('tendon.saveCheckin')}</>}
          </button>
        </section>

        {checks.length > 0 && (
          <section>
            <p className="label mb-2">{t('tendon.recent')}</p>
            <div className="space-y-2">
              {checks.slice(0, 7).map((c) => {
                const avg = (c.elbow + c.forearm) / 2;
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-caption font-bold ${avg >= 7 ? 'bg-ok-tint text-ok' : avg >= 4 ? 'bg-warn-tint text-warn' : 'bg-bad-tint text-bad'}`}>
                      {Math.round(avg * 10)}
                    </span>
                    <div className="flex-1">
                      <p className="text-caption text-text-dim">
                        {new Date(c.createdAt).toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-micro text-text-faint">
                        {t('tendon.elbow')} {c.elbow} · {t('tendon.forearm')} {c.forearm}
                      </p>
                    </div>
                    {c.notes && <span className="line-clamp-1 max-w-[40%] text-micro text-text-faint">{c.notes}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
