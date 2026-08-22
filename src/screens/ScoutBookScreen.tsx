import { useMemo, useState } from 'react';
import { Users, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Opponent } from '@/types/domain';
import { useOpponents } from '@/stores/opponents';
import { useSparring } from '@/stores/sparring';
import { vectorOutcomeTallies, weakestTaggedVectors } from '@/services/matchAnalysis';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';

function matchesOpponent(name: string, o: Opponent): boolean {
  return name.trim().toLowerCase() === o.name.trim().toLowerCase();
}

export default function ScoutBookScreen() {
  const { t } = useTranslation();
  const opponents = useOpponents((s) => s.opponents);
  const addOpponent = useOpponents((s) => s.addOpponent);
  const updateOpponent = useOpponents((s) => s.updateOpponent);
  const removeOpponent = useOpponents((s) => s.removeOpponent);
  const sessions = useSparring((s) => s.sessions);

  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', style: '', weightClass: '', notes: '' });

  const tallies = useMemo(() => vectorOutcomeTallies(sessions), [sessions]);
  const ranked = useMemo(() => weakestTaggedVectors(tallies), [tallies]);
  const hasTagged = ranked.length > 0;

  const recordFor = (o: Opponent) => {
    const mine = sessions.filter((s) => matchesOpponent(s.opponent, o));
    const win = mine.filter((s) => s.outcome === 'win').length;
    const loss = mine.filter((s) => s.outcome === 'loss').length;
    const draw = mine.filter((s) => s.outcome === 'draw').length;
    return { win, loss, draw, total: mine.length, mine };
  };

  const startAdd = () => {
    setForm({ name: '', style: '', weightClass: '', notes: '' });
    setAdding(true);
    setEditingId(null);
  };

  const startEdit = (o: Opponent) => {
    setForm({ name: o.name, style: o.style, weightClass: o.weightClass ?? '', notes: o.notes ?? '' });
    setEditingId(o.id);
    setAdding(false);
  };

  const saveForm = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateOpponent(editingId, {
        name: form.name.trim(),
        style: form.style.trim(),
        weightClass: form.weightClass.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setEditingId(null);
    } else {
      addOpponent({
        name: form.name.trim(),
        style: form.style.trim(),
        weightClass: form.weightClass.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('scout.title')} subtitle={t('scout.subtitle')} backTo="/tools" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {/* Add button */}
        {!adding && !editingId && (
          <button type="button" onClick={startAdd} className="btn-primary w-full">
            <Plus size={18} /> {t('scout.addCta')}
          </button>
        )}

        {/* Add / Edit form */}
        {(adding || editingId) && (
          <section className="card space-y-3">
            <h3 className="text-h3">{editingId ? t('scout.editTitle') : t('scout.addTitle')}</h3>
            <input
              className="input"
              placeholder={t('scout.namePh')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder={t('scout.stylePh')}
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
            />
            <input
              className="input"
              placeholder={t('scout.classPh')}
              value={form.weightClass}
              onChange={(e) => setForm({ ...form, weightClass: e.target.value })}
            />
            <textarea
              className="input resize-none"
              rows={2}
              placeholder={t('scout.notesPh')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAdding(false); setEditingId(null); }} className="btn-ghost flex-1">
                {t('common.cancel')}
              </button>
              <button type="button" onClick={saveForm} disabled={!form.name.trim()} className="btn-primary flex-1">
                {t('common.save')}
              </button>
            </div>
          </section>
        )}

        {/* Match analysis */}
        <section className="card space-y-2">
          <p className="label">{t('scout.analysisTitle')}</p>
          {!hasTagged ? (
            <p className="py-2 text-caption text-text-dim">
              {t('scout.analysisEmpty')}
              {' '}
              <Link to="/sparring" className="font-semibold text-accent">
                {t('history.logSparCta')}
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {ranked.map(({ vector, tally }) => (
                <div key={vector} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-caption text-text-dim">{t(`enum.vector.${vector}`)}</span>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                    <div className="h-full bg-ok" style={{ width: `${(tally.win / tally.total) * 100}%` }} />
                    <div className="h-full bg-bad" style={{ width: `${(tally.loss / tally.total) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right text-micro font-semibold">
                    <span className="text-ok">{tally.win}W</span> · <span className="text-bad">{tally.loss}L</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Opponent list */}
        {opponents.length === 0 && !adding ? (
          <EmptyState icon={Users} title={t('scout.empty')} message={t('scout.emptyMsg')} />
        ) : (
          <div className="space-y-2">
            {opponents.map((o) => {
              const rec = recordFor(o);
              const expanded = openId === o.id;
              return (
                <section key={o.id} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : o.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-lo">
                      <Users size={18} className="text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-semibold">{o.name}</p>
                      <p className="truncate text-caption text-text-faint">
                        {o.style || t('history.unknown')}
                        {o.weightClass ? ` · ${o.weightClass}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-caption font-bold">
                      <span className="text-ok">{rec.win}</span>-<span className="text-bad">{rec.loss}</span>
                      {rec.draw > 0 && <span className="text-warn">-{rec.draw}</span>}
                    </span>
                    <ChevronDown size={16} className={`shrink-0 text-text-faint transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded && (
                    <div className="mt-3 space-y-3 border-t border-border pt-3 animate-slide-up">
                      {o.notes && <p className="text-caption text-text-dim">{o.notes}</p>}
                      <p className="label">{t('scout.history')}</p>
                      {rec.mine.length === 0 ? (
                        <p className="text-caption text-text-faint">{t('scout.noMatches')}</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {[...rec.mine]
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .slice(0, 10)
                            .map((s) => (
                              <li key={s.id} className="flex items-center gap-2 text-caption">
                                <span
                                  className={`rounded-xs px-1.5 py-0.5 text-micro font-bold uppercase ${
                                    s.outcome === 'win'
                                      ? 'bg-ok-tint text-ok'
                                      : s.outcome === 'loss'
                                        ? 'bg-bad-tint text-bad'
                                        : 'bg-warn-tint text-warn'
                                  }`}
                                >
                                  {t(`enum.outcome.${s.outcome}`)}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-text-dim">
                                  {s.myStyles.map((v) => t(`enum.vector.${v}`)).join(', ') || '—'}
                                </span>
                                <span className="text-micro text-text-faint">
                                  {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </li>
                            ))}
                        </ul>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => startEdit(o)} className="btn-ghost flex-1 justify-center py-2 text-caption">
                          <Pencil size={14} /> {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { removeOpponent(o.id); setOpenId(null); }}
                          className="btn-ghost flex-1 justify-center py-2 text-caption text-bad hover:bg-bad-tint"
                        >
                          <Trash2 size={14} /> {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
