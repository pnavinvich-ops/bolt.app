import type { Lift, Vector } from '@/types/domain';
import { PULLEY_MULTIPLIER } from '@/types/constants';
import { effectiveWeight } from '@/services/diagnostics';

export function oneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight * 10) / 10;
  const epley = weight * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
}

export function effectiveOneRepMax(
  weight: number,
  reps: number,
  pulley: keyof typeof PULLEY_MULTIPLIER,
): number {
  const eff = weight * (PULLEY_MULTIPLIER[pulley] ?? 1);
  return oneRepMax(eff, reps);
}

export function bestOneRepMaxForVector(
  lifts: Lift[],
  vector: Vector,
): { lift: Lift; orm: number } | null {
  let best: { lift: Lift; orm: number } | null = null;
  for (const lift of lifts) {
    if (lift.vector !== vector || lift.mode !== 'dynamic') continue;
    for (const set of lift.sets) {
      if (set.reps == null) continue;
      const orm = oneRepMax(set.weight, set.reps);
      if (!best || orm > best.orm) {
        best = { lift, orm };
      }
    }
  }
  return best;
}

export type TierId = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'pro';

export function benchmarkTier(ormKg: number): { tier: TierId; color: string; next: number | null } {
  const tiers: { name: TierId; min: number; color: string; next: number | null }[] = [
    { name: 'novice', min: 0, color: '#7A7A85', next: 30 },
    { name: 'beginner', min: 30, color: '#FFD166', next: 45 },
    { name: 'intermediate', min: 45, color: '#3DDC97', next: 60 },
    { name: 'advanced', min: 60, color: '#FF7A4A', next: 80 },
    { name: 'elite', min: 80, color: '#FF5A1F', next: 100 },
    { name: 'pro', min: 100, color: '#EF476F', next: null },
  ];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (ormKg >= tiers[i].min) {
      return { tier: tiers[i].name, color: tiers[i].color, next: tiers[i].next };
    }
  }
  return { tier: 'novice', color: '#7A7A85', next: 30 };
}

export function ormForLift(lift: Lift): number {
  let best = 0;
  for (const set of lift.sets) {
    if (set.reps == null) continue;
    const orm = oneRepMax(set.weight, set.reps);
    if (orm > best) best = orm;
  }
  return best;
}

export function topStrengthForVector(lifts: Lift[], vector: Vector): number {
  let top = 0;
  for (const lift of lifts) {
    if (lift.vector !== vector) continue;
    const eff = effectiveWeight(lift);
    if (eff > top) top = eff;
  }
  return top;
}
