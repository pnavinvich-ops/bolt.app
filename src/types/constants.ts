import type {
  Vector,
  Handle,
  Pulley,
  Goal,
  Experience,
  TendonStatus,
  Outcome,
  Arm,
  Mode,
} from '@/types/domain';

export const VECTORS: Vector[] = [
  'pronation',
  'cup',
  'rise',
  'side',
  'back',
  'supination',
];

export const HANDLES: Handle[] = ['cone', 'multispinner', 'thick_bar', 'strap', 'other'];

export const PULLEYS: Pulley[] = ['low', 'table', 'high'];

export const PULLEY_MULTIPLIER: Record<Pulley, number> = {
  low: 1.0,
  table: 0.85,
  high: 1.15,
};

export const ARMS: Arm[] = ['left', 'right'];

export const MODES: Mode[] = ['dynamic', 'isometric'];

export const GOALS: Goal[] = ['power', 'technique', 'endurance'];

export const EXPERIENCES: Experience[] = ['beginner', 'intermediate', 'advanced'];

export const TENDON_STATUSES: TendonStatus[] = ['healthy', 'managing', 'recovering'];

export const OUTCOMES: Outcome[] = ['win', 'loss', 'draw'];

export const VECTOR_TO_GOAL: Record<Vector, Goal[]> = {
  pronation: ['power', 'technique'],
  cup: ['power', 'technique'],
  rise: ['power', 'endurance'],
  side: ['technique', 'power'],
  back: ['technique', 'endurance'],
  supination: ['technique', 'power'],
};

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') return `${Math.round(kg * 2.20462)} lb`;
  return `${kg} kg`;
}

export function kgToUnit(kg: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? Math.round(kg * 2.20462 * 10) / 10 : kg;
}

export function unitToKg(val: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? Math.round((val / 2.20462) * 10) / 10 : val;
}
