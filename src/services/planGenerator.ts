import type {
  OnboardingProfile,
  TrainingPlan,
  WorkoutDay,
  WorkoutExercise,
  Vector,
  Goal,
  Experience,
  TendonStatus,
} from '@/types/domain';
import { VECTORS, VECTOR_LABEL, VECTOR_TO_GOAL } from '@/types/constants';

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

const TENDON_CAVEAT: Record<TendonStatus, string | null> = {
  healthy: null,
  managing: 'Tendon sensitivity noted — keep intensity moderate, add 2 min rest between sets.',
  recovering: 'Active recovery mode — reduce volume 40%, no max-effort sets this week.',
};

const SESSION_DISTRIBUTION: Record<number, number[]> = {
  2: [0, 1],
  3: [0, 1, 2],
  4: [0, 1, 2, 3],
  5: [0, 1, 2, 3, 4],
};

const DAY_TITLES = ['Chest & Back Day', 'Arms & Grip Day', 'Shoulders & Core Day', 'Pull & Hold Day', 'Mix & Peak Day'];
const DAY_FOCI = [
  'Heavy pulls and back pressure',
  'Grip, cup, and pronation focus',
  'Side pressure and rise control',
  'Isometric holds and endurance',
  'Full vector integration',
];

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
    title: DAY_TITLES[idx % DAY_TITLES.length],
    focus: DAY_FOCI[idx % DAY_FOCI.length],
    exercises: rotateExercises(baseExercises, idx),
  }));

  const caveat = TENDON_CAVEAT[profile.tendonStatus];

  const focusNames = profile.focus.map((v) => VECTOR_LABEL[v]).join(', ');
  const summary = `${sessionCount} sessions/week · ${vol.sets}×${vol.reps} · ${focusNames || 'balanced vectors'} · ${vol.weeks} weeks`;

  return {
    weeks: vol.weeks,
    sessionsPerWeek: sessionCount,
    days,
    caveat,
    summary,
  };
}

function rotateExercises(exercises: WorkoutExercise[], offset: number): WorkoutExercise[] {
  if (exercises.length === 0) return [];
  const n = exercises.length;
  return exercises.map((_, i) => exercises[(i + offset) % n]);
}

export function describeProfile(p: OnboardingProfile): string {
  const goalMap: Record<Goal, string> = {
    power: 'Power',
    technique: 'Technique',
    endurance: 'Endurance',
  };
  const expMap: Record<Experience, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  const tendonMap: Record<TendonStatus, string> = {
    healthy: 'healthy tendons',
    managing: 'managing mild pain',
    recovering: 'recovering from injury',
  };
  const focus = p.focus.map((v) => VECTOR_LABEL[v]).join(', ') || 'all vectors';
  return `${goalMap[p.goal]} · ${expMap[p.experience]} · ${p.sessionsPerWeek}/week · ${focus} · ${tendonMap[p.tendonStatus]}`;
}
