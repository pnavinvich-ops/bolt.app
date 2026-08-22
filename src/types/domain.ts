export type Arm = 'left' | 'right';
export type Mode = 'dynamic' | 'isometric';
export type Vector =
  | 'pronation'
  | 'cup'
  | 'rise'
  | 'side'
  | 'back'
  | 'supination';
export type Handle = 'cone' | 'multispinner' | 'thick_bar' | 'strap' | 'other';
export type Pulley = 'low' | 'table' | 'high';

export type Goal = 'power' | 'technique' | 'endurance';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type TendonStatus = 'healthy' | 'managing' | 'recovering';

export type Outcome = 'win' | 'loss' | 'draw';

export interface SetEntry {
  id: string;
  weight: number;
  reps?: number;
  durationSec?: number;
}

export interface Lift {
  id: string;
  createdAt: number;
  arm: Arm;
  vector: Vector;
  handle: Handle;
  pulley: Pulley;
  mode: Mode;
  sets: SetEntry[];
  notes?: string;
}

export interface SparringSession {
  id: string;
  createdAt: number;
  opponent: string;
  opponentStyle: string;
  myStyles: Vector[];
  outcome: Outcome;
  /** Optional per-vector result tags for match analysis */
  vectorOutcomes?: Partial<Record<Vector, Outcome>>;
  notes?: string;
}

export interface TendonCheck {
  id: string;
  createdAt: number;
  elbow: number;
  forearm: number;
  /** Optional pain-location tags, e.g. 'medial_elbow' */
  painAreas?: PainArea[];
  notes?: string;
}

export type PainArea =
  | 'medial_elbow'
  | 'lateral_elbow'
  | 'forearm_flexor'
  | 'forearm_extensor'
  | 'wrist'
  | 'bicep';

export interface Opponent {
  id: string;
  name: string;
  style: string;
  weightClass?: string;
  handedness?: 'right' | 'left' | 'unknown';
  notes?: string;
}

export interface Tournament {
  id: string;
  name: string;
  /** ISO date key yyyy-mm-dd of the competition day */
  dateKey: string;
  weightClass?: string;
  targetWeightKg?: number;
  createdAt: number;
}

export interface GymSet {
  id: string;
  weight: number;
  reps: number;
}

export interface GymLog {
  id: string;
  createdAt: number;
  exerciseKey: string;
  sets: GymSet[];
  notes?: string;
}

export interface Settings {
  displayName?: string;
  bodyWeight?: number;
  weightClass?: string;
  unit: 'kg' | 'lb';
}

export interface OnboardingProfile {
  goal: Goal;
  experience: Experience;
  focus: Vector[];
  sessionsPerWeek: 2 | 3 | 4 | 5;
  tendonStatus: TendonStatus;
}

export interface WorkoutDay {
  day: number;
  slot: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  vector: Vector;
  handle: Handle;
  pulley: Pulley;
  sets: number;
  reps: string;
  note?: string;
}

export interface TrainingPlan {
  weeks: number;
  sessionsPerWeek: number;
  days: WorkoutDay[];
  caveatKind: 'managing' | 'recovering' | null;
}
