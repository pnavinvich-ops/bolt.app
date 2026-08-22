export interface GymExercise {
  key: string;
  muscle: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
}

export const GYM_MUSCLES: GymExercise['muscle'][] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
];

/** 20 most popular gym exercises. */
export const GYM_EXERCISES: GymExercise[] = [
  { key: 'bench_press', muscle: 'chest' },
  { key: 'incline_bench', muscle: 'chest' },
  { key: 'chest_fly', muscle: 'chest' },
  { key: 'dips', muscle: 'chest' },
  { key: 'deadlift', muscle: 'back' },
  { key: 'bent_over_row', muscle: 'back' },
  { key: 'lat_pulldown', muscle: 'back' },
  { key: 'seated_row', muscle: 'back' },
  { key: 'pull_up', muscle: 'back' },
  { key: 'overhead_press', muscle: 'shoulders' },
  { key: 'lateral_raise', muscle: 'shoulders' },
  { key: 'face_pull', muscle: 'shoulders' },
  { key: 'barbell_curl', muscle: 'arms' },
  { key: 'hammer_curl', muscle: 'arms' },
  { key: 'tricep_pushdown', muscle: 'arms' },
  { key: 'skull_crusher', muscle: 'arms' },
  { key: 'squat', muscle: 'legs' },
  { key: 'front_squat', muscle: 'legs' },
  { key: 'leg_press', muscle: 'legs' },
  { key: 'romanian_deadlift', muscle: 'legs' },
];
