import type { Lift, SparringSession } from '@/types/domain';
import { todayKey } from '@/types/constants';
import { allPRs } from '@/services/progression';
import { benchmarkTier } from '@/services/strength';

const DAY = 86_400_000;

function dateKeyAt(ts: number): string {
  return todayKey(ts);
}

export function activityByDay(lifts: Lift[], sparring: SparringSession[]): Map<string, number> {
  const map = new Map<string, number>();
  const bump = (ts: number) => {
    const k = dateKeyAt(ts);
    map.set(k, (map.get(k) ?? 0) + 1);
  };
  for (const l of lifts) bump(l.createdAt);
  for (const s of sparring) bump(s.createdAt);
  return map;
}

export interface HeatWeek {
  /** 7 cells Monday..Sunday; null = outside displayed range */
  days: ({ key: string; count: number } | null)[];
}

/** Last `weeks` columns ending with the current week (Monday-start). */
export function heatmap(activity: Map<string, number>, weeks = 16): HeatWeek[] {
  const today = new Date();
  const dowMon0 = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dowMon0);

  const cols: HeatWeek[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const days: HeatWeek['days'] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - w * 7 + d);
      const ts = cellDate.getTime();
      if (ts > Date.now()) {
        days.push(null);
        continue;
      }
      const key = dateKeyAt(ts);
      days.push({ key, count: activity.get(key) ?? 0 });
    }
    cols.push({ days });
  }
  return cols;
}

export function mondayOfWeek(tsOrKey: number | string): string {
  let d: Date;
  if (typeof tsOrKey === 'string') {
    const [y, m, day] = tsOrKey.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(tsOrKey);
  }
  const dowMon0 = (d.getDay() + 6) % 7;
  return dateKeyAt(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dowMon0).getTime());
}

export function weeklyAdherence(
  activity: Map<string, number>,
  targetPerWeek: number,
): { thisWeek: number; avg8: number; pct: number } {
  const thisKey = mondayOfWeek(Date.now());
  let thisWeek = 0;
  for (const [k, n] of activity) if (mondayOfWeek(k) === thisKey && n > 0) thisWeek += 1;

  let total = 0;
  for (let i = 1; i <= 8; i++) {
    const start = Date.now() - i * 7 * DAY;
    const wk = mondayOfWeek(start);
    let days = 0;
    for (const [k, n] of activity) if (n > 0 && mondayOfWeek(k) === wk) days += 1;
    total += days;
  }
  const avg8 = Math.round((total / 8) * 10) / 10;
  const pct = targetPerWeek > 0 ? Math.min(Math.round((avg8 / targetPerWeek) * 100), 200) : 0;
  return { thisWeek, avg8, pct };
}

/** Longest recent run of consecutive active days ending today or yesterday. */
export function currentStreak(activity: Map<string, number>): number {
  let streak = 0;
  const d = new Date();
  // allow today to be empty without breaking the streak
  if (!activity.has(dateKeyAt(d.getTime()))) d.setDate(d.getDate() - 1);
  while (activity.has(dateKeyAt(d.getTime()))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface Badge {
  id: string;
  earned: boolean;
}

export function computeBadges(
  lifts: Lift[],
  sparring: SparringSession[],
  tendonChecks: number,
  balanceScore: number,
): { badges: Badge[]; streak: number; totalSets: number } {
  const activity = activityByDay(lifts, sparring);
  const streak = currentStreak(activity);
  const totalSets = lifts.reduce((sum, l) => sum + l.sets.length, 0);

  // best ORM tier across all dynamic lifts
  let bestOrm = 0;
  for (const l of lifts) {
    if (l.mode !== 'dynamic') continue;
    const orm = Math.max(...l.sets.map((s) => s.weight), 0);
    if (orm > bestOrm) bestOrm = orm;
  }
  const tier = benchmarkTier(bestOrm);
  const advanced = ['advanced', 'elite', 'pro'].includes(tier.tier);

  const badges: Badge[] = [
    { id: 'firstLift', earned: lifts.length >= 1 },
    { id: 'sets100', earned: totalSets >= 100 },
    { id: 'prAll6', earned: new Set(allPRs(lifts).map((p) => p.vector)).size >= 6 },
    { id: 'streak7', earned: streak >= 7 },
    { id: 'streak30', earned: streak >= 30 },
    { id: 'balance75', earned: balanceScore >= 75 },
    { id: 'tendon30', earned: tendonChecks >= 30 },
    { id: 'spar10', earned: sparring.length >= 10 },
    { id: 'tierAdvanced', earned: advanced },
  ];
  return { badges, streak, totalSets };
}
