import { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, RotateCcw, UploadCloud, DownloadCloud, Bell, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useSettings } from '@/stores/settings';
import { useLifts } from '@/stores/lifts';
import { useOnboarding } from '@/stores/onboarding';
import { clearAllAppKeys, listAppKeys, readJSON } from '@/storage/storage';
import { currentUser, pushBackup, pullBackup, getLastSync } from '@/services/cloud';
import {
  applyReminders,
  loadReminders,
  type ReminderConfig,
} from '@/services/reminders';
import ScreenHeader from '@/components/ScreenHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import LanguagePicker from '@/components/LanguagePicker';
import { todayKey } from '@/types/constants';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const resetSettings = useSettings((s) => s.reset);
  const resetOnboarding = useOnboarding((s) => s.reset);

  const [confirmResetSettings, setConfirmResetSettings] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const lifts = useLifts((s) => s.lifts);

  const handleExport = () => {
    const keys = listAppKeys();
    const data: Record<string, unknown> = {};
    for (const k of keys) data[k] = readJSON(k);
    const blob = new Blob([JSON.stringify({ app: 'armlog', version: 1, exportedAt: Date.now(), data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `armlog-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const esc = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: (string | number)[][] = [
      ['date', 'arm', 'vector', 'handle', 'pulley', 'mode', 'weight_kg', 'reps', 'hold_sec'],
    ];
    for (const l of [...lifts].sort((a, b) => a.createdAt - b.createdAt)) {
      for (const s of l.sets) {
        rows.push([
          new Date(l.createdAt).toISOString().slice(0, 10),
          l.arm,
          l.vector,
          l.handle,
          l.pulley,
          l.mode,
          s.weight,
          s.reps ?? '',
          s.durationSec ?? '',
        ]);
      }
    }
    const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `armlog-lifts-${todayKey()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.data && typeof parsed.data === 'object') {
          for (const [k, v] of Object.entries(parsed.data)) {
            localStorage.setItem('armlog:' + k, JSON.stringify(v));
          }
          window.location.reload();
        }
      } catch {
        /* invalid file */
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    clearAllAppKeys();
    window.location.reload();
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {/* Profile */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <SettingsIcon size={18} className="text-accent" />
            <h3 className="text-h3">{t('settings.profile')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">{t('settings.displayName')}</label>
              <input
                type="text"
                className="input"
                value={settings.displayName ?? ''}
                onChange={(e) => update({ displayName: e.target.value || undefined })}
                placeholder={t('settings.displayNamePh')}
              />
            </div>
            <div>
              <label className="label mb-1.5 block">{t('settings.bodyWeight')}</label>
              <input
                type="number"
                inputMode="decimal"
                className="input"
                value={settings.bodyWeight ?? ''}
                onChange={(e) => update({ bodyWeight: parseFloat(e.target.value) || undefined })}
                placeholder="—"
              />
            </div>
            <div>
              <label className="label mb-1.5 block">{t('settings.weightClass')}</label>
              <input
                type="text"
                className="input"
                value={settings.weightClass ?? ''}
                onChange={(e) => update({ weightClass: e.target.value || undefined })}
                placeholder={t('settings.weightClassPh')}
              />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">{t('settings.units')}</label>
            <div className="flex gap-1 rounded-md border border-border bg-surfaceAlt p-1">
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => update({ unit: u })}
                  className={`seg ${settings.unit === u ? 'seg-active' : 'seg-idle'}`}
                >
                  {u === 'kg' ? t('settings.kilograms') : t('settings.pounds')}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Language */}
        <section className="card space-y-3">
          <LanguagePicker />
        </section>

        {/* Data */}
        <section className="card space-y-3">
          <h3 className="text-h3">{t('settings.data')}</h3>
          <button type="button" onClick={handleExport} className="btn-ghost w-full justify-start">
            <Download size={18} /> {t('settings.export')}
          </button>
          <button type="button" onClick={handleExportCsv} className="btn-ghost w-full justify-start">
            <Download size={18} /> {t('settings.exportCsv')}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost w-full justify-start">
            <Upload size={18} /> {t('settings.import')}
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          <CloudBackupCard />
        </section>

        {/* Reminders */}
        <RemindersCard />

        {/* Onboarding */}
        <section className="card space-y-3">
          <h3 className="text-h3">{t('settings.trainingPlan')}</h3>
          <button type="button" onClick={resetOnboarding} className="btn-ghost w-full justify-start">
            <RotateCcw size={18} /> {t('settings.resetOnboarding')}
          </button>
        </section>

        {/* Danger zone */}
        <section className="card space-y-3 border-bad/30">
          <h3 className="text-h3 text-bad">{t('settings.danger')}</h3>
          <button type="button" onClick={() => setConfirmResetSettings(true)} className="btn-ghost w-full justify-start">
            <RotateCcw size={18} /> {t('settings.resetSettings')}
          </button>
          <button type="button" onClick={() => setConfirmResetAll(true)} className="btn-danger w-full justify-start">
            <Trash2 size={18} /> {t('settings.resetAll')}
          </button>
        </section>

        <p className="pt-2 text-center text-micro text-text-faint">{t('settings.footer')}</p>
      </div>

      <ConfirmDialog
        open={confirmResetSettings}
        title={t('settings.resetSettingsTitle')}
        message={t('settings.resetSettingsMsg')}
        confirmLabel={t('common.reset')}
        danger
        onConfirm={() => { resetSettings(); setConfirmResetSettings(false); }}
        onCancel={() => setConfirmResetSettings(false)}
      />
      <ConfirmDialog
        open={confirmResetAll}
        title={t('settings.resetAllTitle')}
        message={t('settings.resetAllMsg')}
        confirmLabel={t('settings.deleteEverything')}
        danger
        onConfirm={handleResetAll}
        onCancel={() => setConfirmResetAll(false)}
      />
    </div>
  );
}

function CloudBackupCard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const lastSync = getLastSync();

  useEffect(() => {
    currentUser().then((u) => {
      setUser(u);
      setChecked(true);
    });
  }, []);

  const run = async (fn: () => Promise<number>) => {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
      setStatus(t('sync.ok'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'error';
      setStatus(msg === 'empty' ? t('sync.empty') : t('sync.fail'));
    }
    setBusy(false);
  };

  return (
    <div className="space-y-2 rounded-md border border-border bg-surfaceAlt p-3">
      <p className="label flex items-center gap-1.5">
        <UploadCloud size={12} /> {t('sync.title')}
      </p>
      {!checked ? null : !user ? (
        <p className="text-caption text-text-faint">
          {t('sync.needAuth')}{' '}
          <Link to="/chat" className="font-semibold text-accent">
            {t('chat.title')}
          </Link>
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run(pushBackup)}
              disabled={busy}
              className="btn-ghost flex-1 justify-start py-2 text-caption"
            >
              <UploadCloud size={15} /> {t('sync.push')}
            </button>
            <button
              type="button"
              onClick={() => run(() => pullBackup())}
              disabled={busy}
              className="btn-ghost flex-1 justify-start py-2 text-caption"
            >
              <DownloadCloud size={15} /> {t('sync.pull')}
            </button>
          </div>
          {status && (
            <p className={`text-caption font-semibold ${status === t('sync.ok') ? 'text-ok' : 'text-warn'}`}>{status}</p>
          )}
          {lastSync && <p className="text-micro text-text-faint">{t('sync.lastSync', { date: new Date(lastSync).toLocaleString() })}</p>}
          <p className="text-micro text-text-faint">{t('sync.note')}</p>
        </>
      )}
    </div>
  );
}

const ISO_DAYS = [1, 2, 3, 4, 5, 6, 7];

function RemindersCard() {
  const { t, i18n } = useTranslation();
  const [cfg, setCfg] = useState<ReminderConfig>(() => loadReminders());
  const native = Capacitor.isNativePlatform();
  const [status, setStatus] = useState<string | null>(null);

  const update = async (patch: Partial<ReminderConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    setStatus(null);
    const res = await applyReminders(next, {
      tendonTitle: t('rem.title'),
      tendonBody: t('rem.bodyTendon'),
      workoutTitle: t('rem.title'),
      workoutBody: t('rem.bodyWorkout'),
    });
    if (res === 'denied') setStatus(t('rem.denied'));
    else if (res === 'unsupported') setStatus(native ? null : t('rem.nativeOnly'));
    else setStatus(t('rem.scheduled'));
  };

  const dayName = (iso: number) => {
    // ISO weekday: 2023-01-02 was a Monday.
    const d = new Date(2023, 0, 1 + iso - 1);
    return d.toLocaleDateString(i18n.language, { weekday: 'narrow' });
  };

  return (
    <section className="card space-y-3">
      <h3 className="text-h3 flex items-center gap-2">
        <Bell size={18} /> {t('rem.title')}
      </h3>

      {!native && <p className="text-caption text-warn">{t('rem.nativeOnly')}</p>}

      {/* Tendon daily reminder */}
      <div className="space-y-2 rounded-md border border-border bg-surfaceAlt p-3">
        <ToggleRow
          label={t('rem.tendon')}
          checked={cfg.tendonOn}
          onChange={(v) => update({ tendonOn: v })}
          disabled={!native}
        />
        <input
          type="time"
          className="input py-1.5 text-caption"
          value={cfg.tendonTime}
          disabled={!native || !cfg.tendonOn}
          onChange={(e) => update({ tendonTime: e.target.value })}
        />
      </div>

      {/* Workout days */}
      <div className="space-y-2 rounded-md border border-border bg-surfaceAlt p-3">
        <ToggleRow
          label={t('rem.workout')}
          checked={cfg.workoutsOn}
          onChange={(v) => update({ workoutsOn: v })}
          disabled={!native}
        />
        <input
          type="time"
          className="input py-1.5 text-caption"
          value={cfg.workoutTime}
          disabled={!native || !cfg.workoutsOn}
          onChange={(e) => update({ workoutTime: e.target.value })}
        />
        <div className="flex gap-1">
          {ISO_DAYS.map((d) => {
            const active = cfg.days.includes(d);
            return (
              <button
                key={d}
                type="button"
                disabled={!native || !cfg.workoutsOn}
                onClick={() =>
                  update({
                    days: active ? cfg.days.filter((x) => x !== d) : [...cfg.days, d].sort(),
                  })
                }
                className={`h-8 flex-1 rounded-md border text-caption font-bold transition-all active:scale-90 ${
                  active && cfg.workoutsOn
                    ? 'border-accent bg-accent-lo text-accent-hi'
                    : 'border-border bg-surface text-text-faint'
                } ${!native || !cfg.workoutsOn ? 'opacity-40' : ''}`}
              >
                {dayName(d)}
              </button>
            );
          })}
        </div>
      </div>

      {status && (
        <p className={`flex items-center gap-1 text-caption font-semibold ${status === t('rem.scheduled') ? 'text-ok' : 'text-warn'}`}>
          {status === t('rem.scheduled') && <Check size={13} />} {status}
        </p>
      )}
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body text-text-dim">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-border'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
