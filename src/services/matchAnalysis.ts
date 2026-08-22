import type { SparringSession, Vector } from '@/types/domain';
import { VECTORS } from '@/types/constants';

export interface VectorTally {
  win: number;
  loss: number;
  draw: number;
  total: number;
}

export type OutcomeTallies = Record<Vector, VectorTally>;

function emptyTally(): VectorTally {
  return { win: 0, loss: 0, draw: 0, total: 0 };
}

/**
 * Aggregates per-vector outcomes across tagged sparring sessions.
 * Sessions without vectorOutcomes contribute nothing.
 */
export function vectorOutcomeTallies(sessions: SparringSession[]): OutcomeTallies {
  const out = {} as OutcomeTallies;
  for (const v of VECTORS) out[v] = emptyTally();
  for (const s of sessions) {
    if (!s.vectorOutcomes) continue;
    for (const [vecRaw, outcome] of Object.entries(s.vectorOutcomes)) {
      const v = vecRaw as Vector;
      if (!out[v] || !outcome) continue;
      out[v][outcome] += 1;
      out[v].total += 1;
    }
  }
  return out;
}

/** Vectors sorted by loss ratio among those with at least one tagged match. */
export function weakestTaggedVectors(tallies: OutcomeTallies): { vector: Vector; tally: VectorTally }[] {
  return VECTORS.filter((v) => tallies[v].total > 0)
    .map((vector) => ({ vector, tally: tallies[vector] }))
    .sort((a, b) => b.tally.loss / b.tally.total - a.tally.loss / a.tally.total);
}
