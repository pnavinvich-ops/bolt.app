import { useState, useRef } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, RotateCcw, Check } from 'lucide-react';
import { useSettings } from '@/stores/settings';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useTendon } from '@/stores/tendon';
import { useOnboarding } from '@/stores/onboarding';
import { clearAllAppKeys, listAppKeys, readJSON } from '@/storage/storage';
import ScreenHeader from '@/components/ScreenHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { todayKey } from '@/types/constants';

export default function SettingsScreen() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const resetSettings = useSettings((s) => s.reset);
  const clearLifts = useLifts((s) => s.clearAll);
  const clearSparring = useSparring((s) => s.clearAll);
  const clearTendon = useTendon((s) => s.clearAll);
  const resetOnboarding = useOnboarding((s) => s.reset);

  const [confirmResetSettings, setConfirmResetSettings] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      <ScreenHeader title="Settings" subtitle="Profile & data" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        {/* Profile */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <SettingsIcon size={18} className="text-accent" />
            <h3 className="text-h3">Profile</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Body weight</label>
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
              <label className="label mb-1.5 block">Weight class</label>
              <input
                type="text"
                className="input"
                value={settings.weightClass ?? ''}
                onChange={(e) => update({ weightClass: e.target.value || undefined })}
                placeholder="e.g. -75kg"
              />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Unit</label>
            <div className="flex gap-1 rounded-md border border-border bg-surfaceAlt p-1">
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => update({ unit: u })}
                  className={`seg ${settings.unit === u ? 'seg-active' : 'seg-idle'}`}
                >
                  {u === 'kg' ? 'Kilograms' : 'Pounds'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="card space-y-3">
          <h3 className="text-h3">Data</h3>
          <button type="button" onClick={handleExport} className="btn-ghost w-full justify-start">
            <Download size={18} /> Export backup (JSON)
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost w-full justify-start">
            <Upload size={18} /> Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          {imported && <p className="flex items-center gap-1 text-caption text-ok"><Check size={14} /> Imported successfully</p>}
        </section>

        {/* Onboarding */}
        <section className="card space-y-3">
          <h3 className="text-h3">Training plan</h3>
          <button type="button" onClick={resetOnboarding} className="btn-ghost w-full justify-start">
            <RotateCcw size={18} /> Reset onboarding quiz
          </button>
        </section>

        {/* Danger zone */}
        <section className="card space-y-3 border-bad/30">
          <h3 className="text-h3 text-bad">Danger zone</h3>
          <button type="button" onClick={() => setConfirmResetSettings(true)} className="btn-ghost w-full justify-start">
            <RotateCcw size={18} /> Reset settings only
          </button>
          <button type="button" onClick={() => setConfirmResetAll(true)} className="btn-danger w-full justify-start">
            <Trash2 size={18} /> Reset all data
          </button>
        </section>

        <p className="pt-2 text-center text-micro text-text-faint">ArmLog · local-first training log</p>
      </div>

      <ConfirmDialog
        open={confirmResetSettings}
        title="Reset settings?"
        message="Your body weight, weight class, and unit preference will be cleared. Lifts and sparring logs are kept."
        confirmLabel="Reset"
        danger
        onConfirm={() => { resetSettings(); setConfirmResetSettings(false); }}
        onCancel={() => setConfirmResetSettings(false)}
      />
      <ConfirmDialog
        open={confirmResetAll}
        title="Reset all data?"
        message="This permanently deletes every lift, sparring session, tendon check, setting, and onboarding profile. This cannot be undone."
        confirmLabel="Delete everything"
        danger
        onConfirm={handleResetAll}
        onCancel={() => setConfirmResetAll(false)}
      />
    </div>
  );
}
