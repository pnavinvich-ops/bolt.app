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

export const VECTOR_LABEL: Record<Vector, string> = {
  pronation: 'Pronation',
  cup: 'Cup',
  rise: 'Rise',
  side: 'Side',
  back: 'Back',
  supination: 'Supination',
};

export const VECTOR_SHORT: Record<Vector, string> = {
  pronation: 'PRON',
  cup: 'CUP',
  rise: 'RISE',
  side: 'SIDE',
  back: 'BACK',
  supination: 'SUP',
};

export const VECTOR_HINT: Record<Vector, string> = {
  pronation: 'Forearm rolls inward — wrist control',
  cup: 'Hand folds closed — locking grip',
  rise: 'Wrist flexes up — rising pressure',
  side: 'Hand moves sideways — lateral drive',
  back: 'Pull toward your body — inside pressure',
  supination: 'Forearm rolls outward — opening force',
};

export const HANDLES: Handle[] = ['cone', 'multispinner', 'thick_bar', 'strap', 'other'];

export const HANDLE_LABEL: Record<Handle, string> = {
  cone: 'Cone',
  multispinner: 'Multi-spinner',
  thick_bar: 'Thick bar',
  strap: 'Strap',
  other: 'Other',
};

export const PULLEYS: Pulley[] = ['low', 'table', 'high'];

export const PULLEY_LABEL: Record<Pulley, string> = {
  low: 'Low pulley',
  table: 'Table',
  high: 'High pulley',
};

export const PULLEY_MULTIPLIER: Record<Pulley, number> = {
  low: 1.0,
  table: 0.85,
  high: 1.15,
};

export const ARMS: Arm[] = ['left', 'right'];
export const ARM_LABEL: Record<Arm, string> = { left: 'Left', right: 'Right' };

export const MODES: Mode[] = ['dynamic', 'isometric'];
export const MODE_LABEL: Record<Mode, string> = {
  dynamic: 'Dynamic',
  isometric: 'Isometric',
};

export const GOALS: Goal[] = ['power', 'technique', 'endurance'];
export const GOAL_LABEL: Record<Goal, string> = {
  power: 'Power',
  technique: 'Technique',
  endurance: 'Endurance',
};
export const GOAL_DESC: Record<Goal, string> = {
  power: 'Maximal force and explosive strength',
  technique: 'Skill, control, and vector mastery',
  endurance: 'Sustained output and fatigue resistance',
};

export const EXPERIENCES: Experience[] = ['beginner', 'intermediate', 'advanced'];
export const EXPERIENCE_LABEL: Record<Experience, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
export const EXPERIENCE_DESC: Record<Experience, string> = {
  beginner: 'New to arm wrestling training',
  intermediate: 'Consistent training for 6+ months',
  advanced: 'Years of structured training',
};

export const TENDON_STATUSES: TendonStatus[] = ['healthy', 'managing', 'recovering'];
export const TENDON_LABEL: Record<TendonStatus, string> = {
  healthy: 'Healthy',
  managing: 'Managing mild pain',
  recovering: 'Recovering from injury',
};
export const TENDON_DESC: Record<TendonStatus, string> = {
  healthy: 'No pain or discomfort',
  managing: 'Some soreness, training through it',
  recovering: 'Active rehab, easing back in',
};

export const OUTCOMES: Outcome[] = ['win', 'loss', 'draw'];
export const OUTCOME_LABEL: Record<Outcome, string> = {
  win: 'Win',
  loss: 'Loss',
  draw: 'Draw',
};

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
