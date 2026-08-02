import type { Lift, Vector, SparringSession } from '@/types/domain';
import { VECTORS, VECTOR_LABEL, PULLEY_MULTIPLIER } from '@/types/constants';

export interface VectorMax {
  vector: Vector;
  max: number;
}

export interface VectorVolume {
  vector: Vector;
  volume: number;
}

export interface DiagnosticResult {
  leftMaxes: VectorMax[];
  rightMaxes: VectorMax[];
  leftVolumes: VectorVolume[];
  rightVolumes: VectorVolume[];
  weakVectors: WeakVector[];
  balanceScore: number;
  balanceLabel: string;
}

export interface WeakVector {
  vector: Vector;
  arm: 'left' | 'right' | 'both';
  gap: number;
  suggestion: string;
}

export function effectiveWeight(lift: Lift): number {
  return lift.sets.reduce((max, set) => {
    const eff = set.weight * (PULLEY_MULTIPLIER[lift.pulley] ?? 1);
    return Math.max(max, eff);
  }, 0);
}

export function totalVolume(lift: Lift): number {
  return lift.sets.reduce((sum, set) => {
    const eff = set.weight * (PULLEY_MULTIPLIER[lift.pulley] ?? 1);
    const work = set.reps ?? set.durationSec ?? 1;
    return sum + eff * work;
  }, 0);
}

export function maxPerVector(lifts: Lift[], arm: 'left' | 'right'): VectorMax[] {
  const map = new Map<Vector, number>();
  for (const lift of lifts) {
    if (lift.arm !== arm) continue;
    const eff = effectiveWeight(lift);
    const cur = map.get(lift.vector) ?? 0;
    if (eff > cur) map.set(lift.vector, eff);
  }
  return VECTORS.map((vector) => ({
    vector,
    max: map.get(vector) ?? 0,
  }));
}

export function volumePerVector(lifts: Lift[], arm: 'left' | 'right'): VectorVolume[] {
  const map = new Map<Vector, number>();
  for (const lift of lifts) {
    if (lift.arm !== arm) continue;
    const vol = totalVolume(lift);
    map.set(lift.vector, (map.get(lift.vector) ?? 0) + vol);
  }
  return VECTORS.map((vector) => ({
    vector,
    volume: map.get(vector) ?? 0,
  }));
}

export function balanceScore(
  leftMap: VectorMax[],
  rightMap: VectorMax[],
): number {
  const leftVals = leftMap.map((v) => v.max);
  const rightVals = rightMap.map((v) => v.max);
  const totalLeft = leftVals.reduce((a, b) => a + b, 0);
  const totalRight = rightVals.reduce((a, b) => a + b, 0);
  if (totalLeft === 0 && totalRight === 0) return 100;
  if (totalLeft === 0 || totalRight === 0) return 0;
  const ratio = Math.min(totalLeft, totalRight) / Math.max(totalLeft, totalRight);
  return Math.round(ratio * 100);
}

export function balanceLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Imbalanced';
  return 'Critical';
}

export function diagnoseWeaknesses(
  sparring: SparringSession[],
  lifts: Lift[],
): WeakVector[] {
  const leftMaxes = maxPerVector(lifts, 'left');
  const rightMaxes = maxPerVector(lifts, 'right');
  const maxLeft = Math.max(...leftMaxes.map((v) => v.max), 1);
  const maxRight = Math.max(...rightMaxes.map((v) => v.max), 1);

  const lossVectors = new Map<Vector, number>();
  for (const s of sparring) {
    if (s.outcome === 'loss') {
      for (const v of s.myStyles) {
        lossVectors.set(v, (lossVectors.get(v) ?? 0) + 1);
      }
    }
  }

  const weak: WeakVector[] = [];
  for (const vector of VECTORS) {
    const left = leftMaxes.find((v) => v.vector === vector)?.max ?? 0;
    const right = rightMaxes.find((v) => v.vector === vector)?.max ?? 0;
    const leftRatio = left / maxLeft;
    const rightRatio = right / maxRight;
    const losses = lossVectors.get(vector) ?? 0;

    const threshold = 0.7;
    const leftWeak = left > 0 && leftRatio < threshold;
    const rightWeak = right > 0 && rightRatio < threshold;
    const bothWeak = (left === 0 && right === 0) || (leftWeak && rightWeak);

    if (bothWeak) {
      weak.push({
        vector,
        arm: 'both',
        gap: Math.round((1 - Math.min(leftRatio, rightRatio)) * 100),
        suggestion: `${VECTOR_LABEL[vector]} is lagging on both arms — add dedicated sets this week.`,
      });
    } else if (leftWeak) {
      weak.push({
        vector,
        arm: 'left',
        gap: Math.round((1 - leftRatio) * 100),
        suggestion: `Left ${VECTOR_LABEL[vector].toLowerCase()} trails right by ${Math.round((1 - leftRatio) * 100)}% — add 2 extra sets left.`,
      });
    } else if (rightWeak) {
      weak.push({
        vector,
        arm: 'right',
        gap: Math.round((1 - rightRatio) * 100),
        suggestion: `Right ${VECTOR_LABEL[vector].toLowerCase()} trails left by ${Math.round((1 - rightRatio) * 100)}% — add 2 extra sets right.`,
      });
    } else if (losses >= 2) {
      weak.push({
        vector,
        arm: 'both',
        gap: losses,
        suggestion: `${losses} recent losses involving ${VECTOR_LABEL[vector]} — drill this vector against varied styles.`,
      });
    }
  }
  return weak;
}

export function runDiagnostics(
  sparring: SparringSession[],
  lifts: Lift[],
): DiagnosticResult {
  const leftMaxes = maxPerVector(lifts, 'left');
  const rightMaxes = maxPerVector(lifts, 'right');
  const leftVolumes = volumePerVector(lifts, 'left');
  const rightVolumes = volumePerVector(lifts, 'right');
  const weakVectors = diagnoseWeaknesses(sparring, lifts);
  const score = balanceScore(leftMaxes, rightMaxes);
  return {
    leftMaxes,
    rightMaxes,
    leftVolumes,
    rightVolumes,
    weakVectors,
    balanceScore: score,
    balanceLabel: balanceLabel(score),
  };
}
