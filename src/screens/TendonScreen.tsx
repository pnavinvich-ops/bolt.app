import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTendon } from '@/stores/tendon';
import { currentTendonIndex } from '@/services/tendonHealth';
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
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    addCheck({ elbow, forearm, notes: notes.trim() || undefined });
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

        <section className="card space-y-5">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-accent" />
            <h3 className="text-h3">{t('tendon.todayCheckin')}</h3>
          </div>
          <Slider label={t('tendon.elbowHealth')} value={elbow} onChange={setElbow} />
          <Slider label={t('tendon.forearmHealth')} value={forearm} onChange={setForearm} />
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
