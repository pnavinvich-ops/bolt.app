import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Vector, Outcome } from '@/types/domain';
import { VECTORS, OUTCOMES } from '@/types/constants';
import { useSparring } from '@/stores/sparring';
import { useOpponents } from '@/stores/opponents';
import ScreenHeader from '@/components/ScreenHeader';

export default function SparringScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addSession = useSparring((s) => s.addSession);
  const ensureByName = useOpponents((s) => s.ensureByName);

  const [opponent, setOpponent] = useState('');
  const [opponentStyle, setOpponentStyle] = useState('');
  const [myStyles, setMyStyles] = useState<Vector[]>([]);
  const [vectorOutcomes, setVectorOutcomes] = useState<Partial<Record<Vector, Outcome>>>({});
  const [outcome, setOutcome] = useState<Outcome>('win');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleStyle = (v: Vector) => {
    setMyStyles((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
    setVectorOutcomes((prev) => {
      if (!myStyles.includes(v)) return prev;
      const next = { ...prev };
      delete next[v];
      return next;
    });
  };

  const tagOutcome = (v: Vector, o: Outcome) => {
    setVectorOutcomes((prev) => {
      const next = { ...prev };
      if (next[v] === o) delete next[v];
      else next[v] = o;
      return next;
    });
  };

  const canSave = opponent.trim().length > 0 || myStyles.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    ensureByName(opponent);
    addSession({
      opponent: opponent.trim(),
      opponentStyle: opponentStyle.trim(),
      myStyles,
      outcome,
      vectorOutcomes: Object.keys(vectorOutcomes).length > 0 ? vectorOutcomes : undefined,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => navigate('/history'), 500);
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('spar.title')} subtitle={t('spar.subtitle')} backTo="/history" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        <section>
          <p className="label mb-2">{t('spar.opponent')}</p>
          <input
            className="input"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder={t('spar.opponentPh')}
          />
        </section>

        <section>
          <p className="label mb-2">{t('spar.oppStyle')}</p>
          <input
            className="input"
            value={opponentStyle}
            onChange={(e) => setOpponentStyle(e.target.value)}
            placeholder={t('spar.oppStylePh')}
          />
        </section>

        <section>
          <p className="label mb-2">{t('spar.yourTech')}</p>
          <div className="grid grid-cols-3 gap-2">
            {VECTORS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => toggleStyle(v)}
                className={`rounded-md border px-2 py-2.5 text-caption font-semibold transition-all active:scale-95 ${
                  myStyles.includes(v)
                    ? 'border-accent bg-accent-lo text-accent-hi'
                    : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                }`}
              >
                {t(`enum.vector.${v}`)}
              </button>
            ))}
          </div>

          {myStyles.length > 0 && (
            <div className="mt-3 space-y-2 rounded-md border border-border bg-surfaceAlt p-3">
              <p className="text-micro font-semibold uppercase tracking-wide text-text-faint">
                {t('spar.tagOutcomes')}
              </p>
              {myStyles.map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-caption text-text-dim">{t(`enum.vector.${v}`)}</span>
                  <div className="flex flex-1 gap-1">
                    {(['win', 'loss'] as Outcome[]).map((o) => {
                      const active = vectorOutcomes[v] === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => tagOutcome(v, o)}
                          className={`flex-1 rounded-sm border py-1 text-micro font-bold uppercase transition-all active:scale-95 ${
                            active
                              ? o === 'win'
                                ? 'border-ok bg-ok-tint text-ok'
                                : 'border-bad bg-bad-tint text-bad'
                              : 'border-border text-text-faint hover:text-text-dim'
                          }`}
                        >
                          {o === 'win' ? t('enum.outcome.win') : t('enum.outcome.loss')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-micro text-text-faint">{t('spar.tagHint')}</p>
            </div>
          )}
        </section>

        <section>
          <p className="label mb-2">{t('spar.outcome')}</p>
          <div className="grid grid-cols-3 gap-2">
            {OUTCOMES.map((o) => {
              const color =
                o === 'win'
                  ? 'border-ok text-ok bg-ok-tint'
                  : o === 'loss'
                    ? 'border-bad text-bad bg-bad-tint'
                    : 'border-warn text-warn bg-warn-tint';
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={`rounded-md border-2 px-2 py-2.5 text-caption font-bold uppercase transition-all active:scale-95 ${
                    outcome === o ? color : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
                  }`}
                >
                  {t(`enum.outcome.${o}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="label mb-2">{t('spar.notes')}</p>
          <textarea
            className="input resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('spar.notesPh')}
          />
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saved}
          className="btn-primary w-full"
        >
          {saved ? (
            <>
              <Check size={18} /> {t('log.saved')}
            </>
          ) : (
            <>
              <Swords size={18} /> {t('spar.save')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
