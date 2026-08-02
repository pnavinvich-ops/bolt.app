import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Dumbbell, Swords, Calendar } from 'lucide-react';
import type { Lift, SparringSession } from '@/types/domain';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useSettings } from '@/stores/settings';
import {
  VECTOR_LABEL,
  HANDLE_LABEL,
  PULLEY_LABEL,
  ARM_LABEL,
  MODE_LABEL,
  OUTCOME_LABEL,
  todayKey,
  kgToUnit,
} from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import SegmentedControl from '@/components/SegmentedControl';

type Tab = 'lifts' | 'sparring';

function relativeDay(ts: number): string {
  const d = new Date(ts);
  const today = todayKey();
  const key = todayKey(ts);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (key === today) return 'Today';
  if (todayKey(yest.getTime()) === key) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDate<T extends { createdAt: number }>(items: T[]): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = todayKey(item.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries()).map(([key, items]) => ({
    label: relativeDay(items[0].createdAt),
    items: items.sort((a, b) => b.createdAt - a.createdAt),
  }));
}

function LiftRow({ lift, unit }: { lift: Lift; unit: 'kg' | 'lb' }) {
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
            <span className="text-body font-semibold">{VECTOR_LABEL[lift.vector]}</span>
            <span className="rounded-xs bg-surfaceAlt px-1.5 py-0.5 text-micro text-text-faint">
              {ARM_LABEL[lift.arm]}
            </span>
            <span className="text-micro text-text-faint">{MODE_LABEL[lift.mode]}</span>
          </div>
          <p className="mt-0.5 text-caption text-text-dim">
            {setCount} set{setCount > 1 ? 's' : ''} · top {kgToUnit(topWeight, unit)}{unit} · {HANDLE_LABEL[lift.handle]} · {PULLEY_LABEL[lift.pulley]}
          </p>
          {lift.notes && <p className="mt-1 line-clamp-2 text-caption text-text-faint">{lift.notes}</p>}
        </div>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
          aria-label="Delete lift"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Delete lift?"
        message="This lift will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={() => { removeLift(lift.id); setConfirm(false); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

function SparRow({ session }: { session: SparringSession }) {
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
            <span className="text-body font-semibold">vs {session.opponent || 'Unknown'}</span>
            <span className={`text-caption font-bold uppercase ${outcomeColor}`}>
              {OUTCOME_LABEL[session.outcome]}
            </span>
          </div>
          <p className="mt-0.5 text-caption text-text-dim">
            Style: {session.opponentStyle || '—'} · My styles: {session.myStyles.map((v) => VECTOR_LABEL[v]).join(', ') || '—'}
          </p>
          {session.notes && <p className="mt-1 line-clamp-2 text-caption text-text-faint">{session.notes}</p>}
        </div>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
          aria-label="Delete session"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Delete session?"
        message="This sparring log will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={() => { removeSession(session.id); setConfirm(false); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

export default function HistoryScreen() {
  const lifts = useLifts((s) => s.lifts);
  const sparring = useSparring((s) => s.sessions);
  const unit = useSettings((s) => s.settings.unit);
  const [tab, setTab] = useState<Tab>('lifts');

  const liftGroups = useMemo(() => groupByDate(lifts), [lifts]);
  const sparGroups = useMemo(() => groupByDate(sparring), [sparring]);

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader
        title="History"
        subtitle="Your training log"
        right={
          <Link
            to={tab === 'lifts' ? '/log' : '/sparring'}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-onAccent transition-transform active:scale-90"
            aria-label="Add"
          >
            <Plus size={20} />
          </Link>
        }
      />

      <div className="mx-auto max-w-md px-4 py-4">
        <div className="mb-4">
          <SegmentedControl
            options={[
              { value: 'lifts', label: 'Lifts' },
              { value: 'sparring', label: 'Sparring' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'lifts' ? (
          liftGroups.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No lifts logged yet"
              message="Tap the plus to record your first training set. Every lift builds your diagnostic profile."
              action={
                <Link to="/log" className="btn-primary">
                  <Plus size={18} /> Log a lift
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
            title="No sparring logged yet"
            message="Track your matches to surface weak vectors and improve your fight strategy."
            action={
              <Link to="/sparring" className="btn-primary">
                <Plus size={18} /> Log sparring
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
