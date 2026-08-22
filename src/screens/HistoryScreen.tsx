import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Dumbbell, Swords, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lift, SparringSession } from '@/types/domain';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useSettings } from '@/stores/settings';
import { todayKey, kgToUnit } from '@/types/constants';
import i18n from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import SegmentedControl from '@/components/SegmentedControl';

type Tab = 'lifts' | 'sparring';

function formatDayLabel(ts: number, t: (k: string) => string): string {
  const d = new Date(ts);
  const today = todayKey();
  const key = todayKey(ts);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (key === today) return t('common.today');
  if (todayKey(yest.getTime()) === key) return t('common.yesterday');
  return d.toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDate<T extends { createdAt: number }>(items: T[], t: (k: string) => string): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = todayKey(item.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries()).map(([, items]) => ({
    label: formatDayLabel(items[0].createdAt, t),
    items: items.sort((a, b) => b.createdAt - a.createdAt),
  }));
}

function LiftRow({ lift, unit }: { lift: Lift; unit: 'kg' | 'lb' }) {
  const { t } = useTranslation();
  const removeLift = useLifts((s) => s.removeLift);
  const [confirm, setConfirm] = useState(false);
  const topWeight = Math.max(...lift.sets.map((s) => s.weight));
  const setCount = lift.sets.length;

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surfaceAlt">
          <Dumbbell size={18} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold">{t(`enum.vector.${lift.vector}`)}</span>
            <span className="rounded-xs bg-surfaceAlt px-1.5 py-0.5 text-micro text-text-faint">
              {t(`enum.arm.${lift.arm}`)}
            </span>
            <span className="text-micro text-text-faint">{t(`enum.mode.${lift.mode}`)}</span>
          </div>
          <p className="mt-0.5 text-caption text-text-dim">
            {t('history.setsTop', { count: setCount, weight: kgToUnit(topWeight, unit), unit })}
            {' · '}
            {t(`enum.handle.${lift.handle}`)} · {t(`enum.pulley.${lift.pulley}`)}
          </p>
          {lift.notes && <p className="mt-1 line-clamp-2 text-caption text-text-faint">{lift.notes}</p>}
        </div>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
          aria-label={t('history.deleteLiftAria')}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('history.deleteLiftTitle')}
        message={t('history.deleteLiftMsg')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={() => { removeLift(lift.id); setConfirm(false); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

function SparRow({ session }: { session: SparringSession }) {
  const { t } = useTranslation();
  const removeSession = useSparring((s) => s.removeSession);
  const [confirm, setConfirm] = useState(false);
  const outcomeColor =
    session.outcome === 'win' ? 'text-ok' : session.outcome === 'loss' ? 'text-bad' : 'text-warn';

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surfaceAlt">
          <Swords size={18} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold">
              {t('history.vs', { name: session.opponent || t('history.unknown') })}
            </span>
            <span className={`text-caption font-bold uppercase ${outcomeColor}`}>
              {t(`enum.outcome.${session.outcome}`)}
            </span>
          </div>
          <p className="mt-0.5 text-caption text-text-dim">
            {t('history.style', { style: session.opponentStyle || '—' })} ·{' '}
            {t('history.myStyles', { styles: session.myStyles.map((v) => t(`enum.vector.${v}`)).join(', ') || '—' })}
          </p>
          {session.notes && <p className="mt-1 line-clamp-2 text-caption text-text-faint">{session.notes}</p>}
        </div>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
          aria-label={t('history.deleteSparAria')}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('history.deleteSparTitle')}
        message={t('history.deleteSparMsg')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={() => { removeSession(session.id); setConfirm(false); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const lifts = useLifts((s) => s.lifts);
  const sparring = useSparring((s) => s.sessions);
  const unit = useSettings((s) => s.settings.unit);
  const [tab, setTab] = useState<Tab>('lifts');

  const liftGroups = useMemo(() => groupByDate(lifts, t), [lifts, t]);
  const sparGroups = useMemo(() => groupByDate(sparring, t), [sparring, t]);

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        right={
          <Link
            to={tab === 'lifts' ? '/log' : '/sparring'}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-onAccent transition-transform active:scale-90"
            aria-label={t('history.addAria')}
          >
            <Plus size={20} />
          </Link>
        }
      />

      <div className="mx-auto max-w-md px-4 py-4">
        <div className="mb-4">
          <SegmentedControl
            options={[
              { value: 'lifts', label: t('history.tabLifts') },
              { value: 'sparring', label: t('history.tabSparring') },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'lifts' ? (
          liftGroups.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title={t('history.noLifts')}
              message={t('history.noLiftsMsg')}
              action={
                <Link to="/log" className="btn-primary">
                  <Plus size={18} /> {t('history.logLiftCta')}
                </Link>
              }
            />
          ) : (
            <div className="space-y-5">
              {liftGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-2">
                    <Calendar size={13} className="text-text-faint" />
                    <p className="text-caption font-semibold uppercase tracking-wide text-text-faint">
                      {group.label}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((lift) => (
                      <LiftRow key={lift.id} lift={lift} unit={unit} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : sparGroups.length === 0 ? (
          <EmptyState
            icon={Swords}
            title={t('history.noSpars')}
            message={t('history.noSparsMsg')}
            action={
              <Link to="/sparring" className="btn-primary">
                <Plus size={18} /> {t('history.logSparCta')}
              </Link>
            }
          />
        ) : (
          <div className="space-y-5">
            {sparGroups.map((group) => (
              <div key={group.label}>
                <div className="mb-2 flex items-center gap-2">
                  <Calendar size={13} className="text-text-faint" />
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-faint">
                    {group.label}
                  </p>
                </div>
                <div className="space-y-2">
                  {group.items.map((session) => (
                    <SparRow key={session.id} session={session} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
