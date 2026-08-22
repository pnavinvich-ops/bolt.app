import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, RotateCcw, Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSparring } from '@/stores/sparring';
import { useOpponents } from '@/stores/opponents';
import { todayKey } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';

type Slot = 'me' | 'them' | 'draw' | null;

export default function MatchScorekeeperScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addSession = useSparring((s) => s.addSession);
  const opponents = useOpponents((s) => s.opponents);

  const [name, setName] = useState('');
  const [bestOf, setBestOf] = useState<3 | 5>(3);
  const [rounds, setRounds] = useState<Slot[]>([null, null, null]);
  const [foulsMe, setFoulsMe] = useState(0);
  const [foulsThem, setFoulsThem] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meScore = rounds.filter((r) => r === 'me').length;
  const themScore = rounds.filter((r) => r === 'them').length;
  const draws = rounds.filter((r) => r === 'draw').length;
  const winsNeeded = Math.floor(bestOf / 2) + 1;

  const decided = useMemo(
    () => meScore >= winsNeeded || themScore >= winsNeeded,
    [meScore, themScore, winsNeeded],
  );

  const setSlot = (i: number, v: Exclude<Slot, null>) => {
    setRounds((prev) => {
      const next = [...prev];
      next[i] = next[i] === v ? null : v;
      return next;
    });
  };

  const resetMatch = () => {
    const size = bestOf === 3 ? 3 : 5;
    setRounds(Array.from({ length: size }, () => null));
    setFoulsMe(0);
    setFoulsThem(0);
    setSaved(false);
    setError(null);
  };

  const changeBestOf = (n: 3 | 5) => {
    setBestOf(n);
    setRounds(Array.from({ length: n }, (_, i) => (i < rounds.length ? rounds[i] : null)).slice(0, n));
    setSaved(false);
  };

  const saveMatch = () => {
    if (!name.trim()) {
      setError(t('match.needName'));
      return;
    }
    useOpponents.getState().ensureByName(name);
    const outcome = meScore > themScore ? 'win' : themScore > meScore ? 'loss' : 'draw';
    addSession({
      opponent: name.trim(),
      opponentStyle: '',
      myStyles: [],
      outcome,
      notes: `${t('match.bestOf', { n: bestOf })} · ${meScore}:${themScore}${draws ? ` (${t('enum.outcome.draw')} ${draws})` : ''} · ${t('match.fouls')}: ${t('match.you')} ${foulsMe} / ${t('match.them')} ${foulsThem}`,
    });
    setSaved(true);
    setTimeout(() => navigate('/history'), 900);
  };

  const banner =
    meScore >= winsNeeded ? (
      <p className="text-h2 font-extrabold text-ok">
        {t('match.winnerYou', { a: meScore, b: themScore })}
      </p>
    ) : themScore >= winsNeeded ? (
      <p className="text-h2 font-extrabold text-bad">
        {t('match.winnerThem', { name: name.trim() || t('history.unknown'), a: themScore, b: meScore })}
      </p>
    ) : null;

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('match.title')} subtitle={t('match.subtitle')} backTo="/tools" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {/* Opponent */}
        <section className="card space-y-3">
          <input
            className="input"
            placeholder={t('spar.opponent')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="scout-names"
          />
          <datalist id="scout-names">
            {opponents.map((o) => (
              <option key={o.id} value={o.name} />
            ))}
          </datalist>

          <div>
            <p className="label mb-1.5">{t('match.format')}</p>
            <div className="flex gap-1 rounded-md border border-border bg-surfaceAlt p-1">
              {([3, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => changeBestOf(n)}
                  className={`seg ${bestOf === n ? 'seg-active' : 'seg-idle'} py-1.5 text-caption`}
                >
                  {t('match.bestOf', { n })}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Score */}
        <section className="card flex items-center justify-around py-5">
          <div className="text-center">
            <p className="label mb-1">{t('match.you')}</p>
            <p className={`text-display font-extrabold leading-none ${decided && meScore > themScore ? 'text-ok' : ''}`}>{meScore}</p>
          </div>
          <span className="text-h1 font-bold text-text-faint">:</span>
          <div className="text-center">
            <p className="label mb-1 truncate px-2">{name.trim() || t('match.them')}</p>
            <p className={`text-display font-extrabold leading-none ${decided && themScore > meScore ? 'text-bad' : ''}`}>{themScore}</p>
          </div>
        </section>

        {banner && <div className="card-alt text-center">{banner}</div>}

        {/* Rounds */}
        <section className="space-y-2">
          {Array.from({ length: bestOf }).map((_, i) => (
            <div key={i} className={`card flex items-center gap-2 ${decided ? 'opacity-50' : ''}`}>
              <span className="w-16 shrink-0 text-caption font-semibold text-text-faint">
                #{i + 1}
              </span>
              {(['me', 'draw', 'them'] as const).map((v) => {
                const active = rounds[i] === v;
                const colorCls =
                  v === 'me'
                    ? active
                      ? 'border-ok bg-ok-tint text-ok'
                      : ''
                    : v === 'them'
                      ? active
                        ? 'border-bad bg-bad-tint text-bad'
                        : ''
                      : active
                        ? 'border-warn bg-warn-tint text-warn'
                        : '';
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={decided}
                    onClick={() => setSlot(i, v)}
                    className={`flex-1 rounded-md border py-2 text-caption font-bold uppercase transition-all active:scale-95 ${
                      active ? colorCls : 'border-border bg-surfaceAlt text-text-dim'
                    }`}
                  >
                    {active && v !== 'draw' ? <Check size={14} className="mx-auto" /> : ''}
                    {v === 'me' ? t('match.you') : v === 'them' ? t('match.them') : t('enum.outcome.draw')}
                  </button>
                );
              })}
            </div>
          ))}
        </section>

        {/* Fouls */}
        <section className="card space-y-3">
          <p className="label">{t('match.fouls')}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('match.you'), val: foulsMe, set: setFoulsMe },
              { label: name.trim() || t('match.them'), val: foulsThem, set: setFoulsThem },
            ].map((side, si) => (
              <div key={si} className="rounded-md border border-border bg-surfaceAlt p-2.5">
                <p className="mb-1.5 truncate text-micro font-semibold text-text-faint">{side.label}</p>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => side.set(Math.max(0, side.val - 1))}
                    aria-label="−"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-dim active:scale-90"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-h3 font-extrabold">{side.val}</span>
                  <button
                    type="button"
                    onClick={() => side.set(side.val + 1)}
                    aria-label="+"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-dim active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        {decided && !saved && (
          <button type="button" onClick={saveMatch} className="btn-primary w-full">
            <Swords size={18} /> {t('match.saveCta')}
          </button>
        )}
        {saved ? (
          <p className="flex items-center justify-center gap-1.5 text-caption font-semibold text-ok">
            <Check size={14} /> {t('log.saved')}
          </p>
        ) : (
          <button type="button" onClick={resetMatch} className="btn-ghost w-full justify-center">
            <RotateCcw size={16} /> {t('match.newMatch')}
          </button>
        )}
        {error && <p className="text-center text-caption text-bad">{error}</p>}
        <p className="text-center text-micro text-text-faint">{todayKey()}</p>
      </div>
    </div>
  );
}
