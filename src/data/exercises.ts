export type ExerciseIcon =
  | 'roller'
  | 'cable'
  | 'pronate'
  | 'supinate'
  | 'side'
  | 'row'
  | 'hammer'
  | 'spinner'
  | 'hold'
  | 'table';

export interface Exercise {
  key: string;
  icon: ExerciseIcon;
  /** Target vectors */
  vectors: string[];
  equipment?: 'cone' | 'multispinner' | 'thick_bar' | 'strap' | 'other';
}

export const EXERCISES: Exercise[] = [
  { key: 'wristRiserRoller', icon: 'roller', vectors: ['rise'], equipment: 'thick_bar' },
  { key: 'cupHoldCable', icon: 'cable', vectors: ['cup'], equipment: 'cone' },
  { key: 'pronationLiftStrap', icon: 'pronate', vectors: ['pronation'], equipment: 'strap' },
  { key: 'slowSupination', icon: 'supinate', vectors: ['supination'], equipment: 'other' },
  { key: 'sidePressCable', icon: 'side', vectors: ['side'], equipment: 'other' },
  { key: 'heavyRows', icon: 'row', vectors: ['back'], equipment: 'other' },
  { key: 'hammerCurlMass', icon: 'hammer', vectors: ['cup', 'rise'], equipment: 'other' },
  { key: 'multispinnerToproll', icon: 'spinner', vectors: ['pronation', 'cup'], equipment: 'multispinner' },
  { key: 'staticStrapHold', icon: 'hold', vectors: ['rise', 'back'], equipment: 'strap' },
  { key: 'partnerTablePulls', icon: 'table', vectors: ['cup', 'side', 'back'], equipment: 'other' },
];
