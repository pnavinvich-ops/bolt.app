import type { TendonCheck } from '@/types/domain';
import { currentTendonIndex, recentChecks } from '@/services/tendonHealth';

export type DeloadLevel = 'none' | 'warn' | 'deload';

export interface DeloadStatus {
  level: DeloadLevel;
  /** Consecutive most-recent days with a falling daily average (0 = none) */
  decliningDays: number;
}

/**
 * Auto-deload heuristic:
 * - 'deload' when the 7-day tendon score dropped below 40 or declined for 3+ consecutive check days
 * - 'warn' when the trend is declining (score still >= 40)
 */
export function deloadStatus(allChecks: TendonCheck[]): DeloadStatus {
  const index = currentTendonIndex(allChecks);
  if (recentChecks(allChecks).length < 2) return { level: 'none', decliningDays: 0 };

  // Build a per-day average series over the last 10 days
  const byDay = new Map<string, { sum: number; n: number; ts: number }>();
  const sorted = [...allChecks].sort((a, b) => a.createdAt - b.createdAt);
  for (const c of sorted) {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const cur = byDay.get(key) ?? { sum: 0, n: 0, ts: c.createdAt };
    cur.sum += (c.elbow + c.forearm) / 2;
    cur.n += 1;
    cur.ts = Math.max(cur.ts, c.createdAt);
    byDay.set(key, cur);
  }
  const series = Array.from(byDay.values())
    .map((v) => ({ ts: v.ts, avg: v.sum / v.n }))
    .slice(-7);

  let decliningDays = 0;
  for (let i = series.length - 1; i > 0; i--) {
    if (series[i].avg < series[i - 1].avg) decliningDays += 1;
    else break;
  }

  if (index.score < 40 || decliningDays >= 3) return { level: 'deload', decliningDays };
  if (index.trend === 'declining') return { level: 'warn', decliningDays };
  return { level: 'none', decliningDays };
}

/** Volume multiplier to apply to plan sets when a deload is advised. */
export function deloadVolumeFactor(level: DeloadLevel): number {
  if (level === 'deload') return 0.6;
  if (level === 'warn') return 0.8;
  return 1;
}
