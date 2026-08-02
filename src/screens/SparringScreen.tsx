import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Check } from 'lucide-react';
import type { Vector, Outcome } from '@/types/domain';
import { VECTORS, VECTOR_LABEL, OUTCOMES, OUTCOME_LABEL } from '@/types/constants';
import { useSparring } from '@/stores/sparring';
import ScreenHeader from '@/components/ScreenHeader';

export default function SparringScreen() {
  const navigate = useNavigate();
  const addSession = useSparring((s) => s.addSession);

  const [opponent, setOpponent] = useState('');
  const [opponentStyle, setOpponentStyle] = useState('');
  const [myStyles, setMyStyles] = useState<Vector[]>([]);
  const [outcome, setOutcome] = useState<Outcome>('win');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleStyle = (v: Vector) => {
    setMyStyles((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const canSave = opponent.trim().length > 0 || myStyles.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addSession({
      opponent: opponent.trim(),
      opponentStyle: opponentStyle.trim(),
      myStyles,
      outcome,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => navigate('/history'), 500);
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title="Log Sparring" subtitle="Record a match" backTo="/history" />

      <div className="mx-auto max-w-md space-y-5 px-4 py-4">
        <section>
          <p className="label mb-2">Opponent</p>
          <input
            className="input"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="Name or nickname"
          />
        </section>

        <section>
          <p className="label mb-2">Opponent's style</p>
          <input
            className="input"
            value={opponentStyle}
            onChange={(e) => setOpponentStyle(e.target.value)}
            placeholder="e.g. Top roll, hook, press"
          />
        </section>

        <section>
          <p className="label mb-2">Your techniques (multi-select)</p>
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
                {VECTOR_LABEL[v]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="label mb-2">Outcome</p>
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
                  {OUTCOME_LABEL[o]}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="label mb-2">Notes</p>
          <textarea
            className="input resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What worked? What to drill next?"
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
              <Check size={18} /> Saved
            </>
          ) : (
            <>
              <Swords size={18} /> Save sparring
            </>
          )}
        </button>
      </div>
    </div>
  );
}
