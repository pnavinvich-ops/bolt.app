import type { TendonCheck } from '@/types/domain';
import { todayKey } from '@/types/constants';

const MS_PER_DAY = 86_400_000;

export function recentChecks(checks: TendonCheck[], days = 7): TendonCheck[] {
  const cutoff = Date.now() - days * MS_PER_DAY;
  return checks
    .filter((c) => c.createdAt >= cutoff)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export interface TendonIndex {
  score: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  elbowAvg: number;
  forearmAvg: number;
  daysLogged: number;
  label: string;
}

export function currentTendonIndex(checks: TendonCheck[], days = 7): TendonIndex {
  const recent = recentChecks(checks, days);
  if (recent.length === 0) {
    return {
      score: 0,
      trend: 'unknown',
      elbowAvg: 0,
      forearmAvg: 0,
      daysLogged: 0,
      label: 'No data',
    };
  }

  const elbowAvg = avg(recent.map((c) => c.elbow));
  const forearmAvg = avg(recent.map((c) => c.forearm));
  const raw = (elbowAvg + forearmAvg) / 2;
  const score = Math.round(raw * 10);

  const half = Math.floor(recent.length / 2);
  let trend: TendonIndex['trend'] = 'stable';
  if (recent.length >= 4) {
    const firstHalf = recent.slice(0, half);
    const secondHalf = recent.slice(half);
    const firstAvg = avg([...firstHalf.map((c) => c.elbow), ...firstHalf.map((c) => c.forearm)]);
    const secondAvg = avg([...secondHalf.map((c) => c.elbow), ...secondHalf.map((c) => c.forearm)]);
    if (secondAvg - firstAvg > 0.5) trend = 'improving';
    else if (firstAvg - secondAvg > 0.5) trend = 'declining';
  }

  return {
    score,
    trend,
    elbowAvg: round1(elbowAvg),
    forearmAvg: round1(forearmAvg),
    daysLogged: new Set(recent.map((c) => todayKey(c.createdAt))).size,
    label: tendonLabel(score),
  };
}

function tendonLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Monitor';
  if (score >= 20) return 'Strained';
  return 'Critical';
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
