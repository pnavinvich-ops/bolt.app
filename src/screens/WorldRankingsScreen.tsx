import { useEffect, useMemo, useState } from 'react';
import { Filter, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import i18n from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';

interface Ranking {
  id: number;
  rank: number;
  athlete_name: string;
  country: string;
  weight_class: string;
  arm_hand: 'right' | 'left';
  updated_at: string;
}

const WEIGHTS = ['SHW', 'HW', 'LHW', 'MW', 'WW', 'LW', 'FE'] as const;
const ARMS = ['Right', 'Left'] as const;

export default function WorldRankingsScreen() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arm, setArm] = useState<(typeof ARMS)[number]>('Right');
  const [weight, setWeight] = useState<(typeof WEIGHTS)[number]>('SHW');

  const load = async () => {
    if (!isSupabaseConfigured) {
      setError(t('chat.notConfigured'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('rankings')
      .select('id,rank,athlete_name,country,weight_class,arm_hand,updated_at')
      .order('rank', { ascending: true })
      .limit(500);
    if (error) setError(error.message);
    else setRows((data ?? []) as Ranking[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.arm_hand === (arm === 'Right' ? 'right' : 'left') &&
          r.weight_class === weight
      ),
    [rows, arm, weight]
  );

  const subtitle = rows[0]
    ? t('rankings.updatedOn', { date: new Date(rows[0].updated_at).toLocaleDateString(i18n.language) })
    : ' ';

  return (
    <div className="min-h-screen pb-24">
      <ScreenHeader
        title={t('rankings.title')}
        subtitle={subtitle}
        backTo="/tools"
        right={
          <button
            type="button"
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-dim hover:bg-surfaceAlt hover:text-text"
            aria-label="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        }
      />

      <div className="mx-auto max-w-md space-y-3 px-4 py-4">
        <section className="card space-y-3">
          <p className="label flex items-center gap-1.5">
            <Filter size={12} /> {t('rankings.filter')}
          </p>
          <div>
            <p className="mb-1.5 text-caption text-text-faint">{t('rankings.filterArm')}</p>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surfaceAlt p-1">
              {ARMS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setArm(o)}
                  className={`rounded-sm py-1.5 text-caption transition-colors ${
                    arm === o ? 'bg-accent text-bg font-semibold' : 'text-text-dim'
                  }`}
                >
                  {o === 'Right' ? t('rankings.right') : t('rankings.left')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-caption text-text-faint">{t('rankings.filterWeight')}</p>
            <div className="grid grid-cols-4 gap-1 rounded-md border border-border bg-surfaceAlt p-1">
              {WEIGHTS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setWeight(o)}
                  className={`rounded-sm py-1.5 text-caption transition-colors ${
                    weight === o ? 'bg-accent text-bg font-semibold' : 'text-text-dim'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && <p className="py-8 text-center text-caption text-text-faint">{t('common.loading')}</p>}

        {error && (
          <div className="card flex items-start gap-3 border-warn/30">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-warn" />
            <div>
              <p className="text-body text-text">{error}</p>
              <p className="mt-1 text-caption text-text-faint">
                {t('rankings.migrationHint')}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="py-8 text-center text-caption text-text-faint">{t('rankings.noData')}</p>
        )}

        <ol className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="card flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-lo text-h3 font-bold text-accent-hi">
                {r.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-body font-semibold">{r.athlete_name}</p>
                <p className="text-caption text-text-faint">
                  {r.country} · {r.weight_class} · {r.arm_hand}
                </p>
              </div>
              <Trophy size={16} className="text-accent" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
