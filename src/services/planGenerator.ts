import type {
  OnboardingProfile,
  TrainingPlan,
  WorkoutDay,
  WorkoutExercise,
  Vector,
  Goal,
  Experience,
} from '@/types/domain';
import { VECTORS } from '@/types/constants';

const GOAL_PRIMARY_VECTORS: Record<Goal, Vector[]> = {
  power: ['pronation', 'cup', 'rise'],
  technique: ['cup', 'side', 'back', 'supination'],
  endurance: ['rise', 'back', 'side'],
};

const EXPERIENCE_VOLUME: Record<Experience, { sets: number; reps: string; weeks: number }> = {
  beginner: { sets: 3, reps: '10–12', weeks: 4 },
  intermediate: { sets: 4, reps: '8–10', weeks: 6 },
  advanced: { sets: 5, reps: '5–8', weeks: 8 },
};

export const TENDON_CAVEAT_KIND: Record<string, 'managing' | 'recovering' | null> = {
  healthy: null,
  managing: 'managing',
  recovering: 'recovering',
};

const SESSION_DISTRIBUTION: Record<number, number[]> = {
  2: [0, 1],
  3: [0, 1, 2],
  4: [0, 1, 2, 3],
  5: [0, 1, 2, 3, 4],
};

function buildExercises(
  focus: Vector[],
  goal: Goal,
  exp: Experience,
): WorkoutExercise[] {
  const vol = EXPERIENCE_VOLUME[exp];
  const primary = GOAL_PRIMARY_VECTORS[goal];

  const ordered = dedupe([...primary, ...focus, ...VECTORS]);

  return ordered.slice(0, 4).map((vector) => ({
    vector,
    handle: vectorHandle(vector),
    pulley: vectorPulley(vector),
    sets: vol.sets,
    reps: vol.reps,
  }));
}

function dedupe<T>(arr: T[]): T[] {
  return arr.filter((v, i) => arr.indexOf(v) === i);
}

function vectorHandle(vector: Vector): WorkoutExercise['handle'] {
  if (vector === 'cup' || vector === 'pronation') return 'cone';
  if (vector === 'rise' || vector === 'supination') return 'multispinner';
  if (vector === 'back') return 'strap';
  return 'thick_bar';
}

function vectorPulley(vector: Vector): WorkoutExercise['pulley'] {
  if (vector === 'rise' || vector === 'supination') return 'high';
  if (vector === 'back' || vector === 'side') return 'table';
  return 'low';
}

export function generatePlan(profile: OnboardingProfile): TrainingPlan {
  const vol = EXPERIENCE_VOLUME[profile.experience];
  const sessionCount = profile.sessionsPerWeek;
  const distribution = SESSION_DISTRIBUTION[sessionCount];

  const baseExercises = buildExercises(profile.focus, profile.goal, profile.experience);

  const days: WorkoutDay[] = distribution.map((slot, idx) => ({
    day: idx + 1,
    slot,
    exercises: rotateExercises(baseExercises, idx),
  }));

  return {
    weeks: vol.weeks,
    sessionsPerWeek: sessionCount,
    days,
    caveatKind: TENDON_CAVEAT_KIND[profile.tendonStatus] ?? null,
  };
}

function rotateExercises(exercises: WorkoutExercise[], offset: number): WorkoutExercise[] {
  if (exercises.length === 0) return [];
  const n = exercises.length;
  return exercises.map((_, i) => exercises[(i + offset) % n]);
}
