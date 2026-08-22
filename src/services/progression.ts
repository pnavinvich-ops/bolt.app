import type { Lift, Vector } from '@/types/domain';
import { ormForLift } from '@/services/strength';
import { effectiveWeight } from '@/services/diagnostics';

export interface TimelinePoint {
  ts: number;
  value: number;
}

export interface PR {
  vector: Vector;
  mode: 'dynamic' | 'isometric';
  arm: Lift['arm'];
  /** kg (dynamic: est. 1RM; isometric: effective hold weight) */
  valueKg: number;
  liftId: string;
  createdAt: number;
}

function bestPerDay(lifts: Lift[], pick: (l: Lift) => number): TimelinePoint[] {
  const byDay = new Map<string, { ts: number; value: number }>();
  for (const l of lifts) {
    const v = pick(l);
    if (!(v > 0)) continue;
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const cur = byDay.get(key);
    if (!cur || v > cur.value) byDay.set(key, { ts: l.createdAt, value: Math.round(v * 10) / 10 });
  }
  return Array.from(byDay.values()).sort((a, b) => a.ts - b.ts);
}

/** Best estimated 1RM per day for dynamic lifts of a vector (both arms). */
export function ormTimeline(lifts: Lift[], vector: Vector): TimelinePoint[] {
  return bestPerDay(
    lifts.filter((l) => l.vector === vector && l.mode === 'dynamic'),
    (l) => ormForLift(l),
  );
}

/** Best effective hold weight per day for isometric lifts of a vector. */
export function holdTimeline(lifts: Lift[], vector: Vector): TimelinePoint[] {
  return bestPerDay(
    lifts.filter((l) => l.vector === vector && l.mode === 'isometric'),
    (l) => effectiveWeight(l),
  );
}

/** Current personal records across all vectors and modes. */
export function allPRs(lifts: Lift[]): PR[] {
  const best = new Map<string, PR>();
  for (const l of lifts) {
    let v = 0;
    if (l.mode === 'dynamic') {
      v = ormForLift(l);
    } else {
      v = effectiveWeight(l);
    }
    if (!(v > 0)) continue;
    const key = `${l.vector}|${l.mode}`;
    const cur = best.get(key);
    if (!cur || v > cur.valueKg) {
      best.set(key, {
        vector: l.vector,
        mode: l.mode,
        arm: l.arm,
        valueKg: Math.round(v * 10) / 10,
        liftId: l.id,
        createdAt: l.createdAt,
      });
    }
  }
  return Array.from(best.values());
}
