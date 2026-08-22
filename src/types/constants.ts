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
  PainArea,
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

export const PAIN_AREAS: PainArea[] = [
  'medial_elbow',
  'lateral_elbow',
  'forearm_flexor',
  'forearm_extensor',
  'wrist',
  'bicep',
];

export const CHAT_CHANNELS: { id: string; key: string }[] = [
  { id: 'global', key: 'chat.chGlobal' },
  { id: 'technique', key: 'chat.chTechnique' },
  { id: 'tournaments', key: 'chat.chTournaments' },
  { id: 'gear', key: 'chat.chGear' },
  { id: 'offtopic', key: 'chat.chOfftopic' },
];

/** Official men's weight-class limits in kg (WAF-style). SHW has no limit. */
export const WEIGHT_CLASS_LIMITS: Record<string, number | null> = {
  LW55: 55,
  LW60: 60,
  LW65: 65,
  LW70: 70,
  LW75: 75,
  LW80: 80,
  LW85: 85,
  LW90: 90,
  HW100: 100,
  HW110: 110,
  SHW: null,
};

export function classLimitKg(weightClass?: string): number | null {
  if (!weightClass) return null;
  return WEIGHT_CLASS_LIMITS[weightClass] ?? null;
}

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
