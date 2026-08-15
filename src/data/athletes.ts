export type AthleteKey = 'larratt' | 'cyplenkov' | 'saginashvili';

export interface AthleteExercise {
  name: string;
  sets: number;
  reps: string;
  load: string;
  note?: string;
}

export interface AthleteRoutineDay {
  day: string;
  focus: string;
  exercises: AthleteExercise[];
}

export interface AthleteProfile {
  key: AthleteKey;
  name: string;
  nickname: string;
  country: string;
  weightClass: string;
  dominantArm: 'right' | 'left';
  pullingStyle: string;
  signatureLifts: string[];
  cues: string[];
  weeklySplit: AthleteRoutineDay[];
}

export const ATHLETES: AthleteProfile[] = [
  {
    key: 'larratt',
    name: 'Devon Larratt',
    nickname: 'The Hammer',
    country: 'CA — Canada',
    weightClass: 'HW (105 kg)',
    dominantArm: 'right',
    pullingStyle:
      'High-frequency, table-density training built on a foundation of static strap work. Devon\'s game is built on a crushing pronation-to-toproll pipeline: he cracks the wrist, climbs the knuckles, and then drives the toproll with shoulder and back pressure. He treats the table like a skill sport and trains angles, not just loads.',
    signatureLifts: [
      'Static strap pronation holds (heavy singles)',
      'Toproll setup on a fixed table partner',
      'Hammer rotations to neutral',
      'Table-specific angle work (3 positions)',
      'High-rep wrist roller (riser + cup complex)',
    ],
    cues: [
      'Knuckles high, then turn.',
      'Pressure goes through the bones, not the joints.',
      'Train the table, not the mirror.',
      'High frequency beats high load for table IQ.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Heavy pronation + top pressure',
        focus: 'Table IQ + maximal pronation',
        exercises: [
          { name: 'Pronation lift, strap (heavy single)', sets: 5, reps: '1', load: '90% 1RM', note: 'Reset 60s between reps' },
          { name: 'Static strap hold at top of pull', sets: 3, reps: '15s', load: '70%' },
          { name: 'Hammer pronation rotations', sets: 4, reps: '8/side', load: 'light–moderate' },
        ],
      },
      {
        day: 'Day B — Riser + cup complex',
        focus: 'Inside position & knuckle height',
        exercises: [
          { name: 'Riser holds, thick bar', sets: 4, reps: '20s', load: '40%' },
          { name: 'Cup holds, cable column', sets: 4, reps: '15s', load: '60% 1RM' },
          { name: 'Wrist roller (riser → cup → back)', sets: 3, reps: '1 full cycle', load: 'moderate' },
        ],
      },
      {
        day: 'Day C — Table density',
        focus: 'Live pulls, multiple positions',
        exercises: [
          { name: 'Pulls vs. partner — toproll focus', sets: 8, reps: '1 pull', load: 'submaximal' },
          { name: 'Pulls vs. partner — hook entry', sets: 6, reps: '1 pull', load: 'submaximal' },
          { name: 'Angle-specific strap work', sets: 4, reps: '10/side', load: 'light' },
        ],
      },
    ],
  },

  {
    key: 'cyplenkov',
    name: 'Denis Cyplenkov',
    nickname: 'The Russian Tank',
    country: 'RU — Russia',
    weightClass: 'SHW (130+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'Brute-force structural strength and an inside hook that no one has matched for raw power. Denis builds the cup and the bicep so thick that opponents feel like they\'re losing before the match starts. His training is low-frequency, very heavy, and biased toward the inside game: cup, bicep containment, thick-bar work, and side pressure.',
    signatureLifts: [
      'Heavy wrist curls, thick bar',
      'Bicep curls with strict elbow pinning (containment)',
      'Inside hook strap pulls, submaximal',
      'Side-press holds, cable stack',
      'Hammer curls, very heavy',
    ],
    cues: [
      'The cup is a wall. Build it thick.',
      'Bicep stays glued to the side.',
      'Heavy, slow, painful. That\'s the work.',
      'Inside position, every pull.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Wrist + bicep volume',
        focus: 'Base strength for inside game',
        exercises: [
          { name: 'Wrist curls, thick bar', sets: 5, reps: '6-8', load: '85% 1RM' },
          { name: 'Hammer curls, strict', sets: 5, reps: '6-8', load: '85% 1RM' },
          { name: 'Reverse wrist curls', sets: 3, reps: '10-12', load: 'light' },
        ],
      },
      {
        day: 'Day B — Inside hook + side pressure',
        focus: 'Table power',
        exercises: [
          { name: 'Inside hook strap pulls', sets: 5, reps: '3-5', load: '80%' },
          { name: 'Side-press holds, cable', sets: 4, reps: '12-15s', load: '70%' },
          { name: 'Cup holds, partner-resisted', sets: 3, reps: '20s', load: 'submaximal' },
        ],
      },
    ],
  },

  {
    key: 'saginashvili',
    name: 'Levan Saginashvili',
    nickname: 'The Hulk',
    country: 'GE — Georgia',
    weightClass: 'SHW (130+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'Structural, dominant, and press-heavy. Levan\'s cup is so deep and his pronation so forceful that he dictates every match from the first quarter-turn. His training is built around maximum-load carries, cupping and pronation holds at near-maximal weights, cable pulley work, and a press that ends matches on its own.',
    signatureLifts: [
      'Heavy farmer carries (grip + cup transfer)',
      'Cable pulley cupping + pronation (standing)',
      'Ultra-heavy cup holds, strap',
      'Press work, table-specific',
      'Toproll power pulls, fixed strap',
    ],
    cues: [
      'Cup first, then everything else.',
      'Pronate like you\'re turning a key.',
      'Press with the shoulder, not the arm.',
      'If you\'re not first, you\'re losing.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Cup + pronation maximal',
        focus: 'Structural power',
        exercises: [
          { name: 'Cup holds, strap (near-maximal)', sets: 5, reps: '8-12s', load: '90%' },
          { name: 'Pronator curl, seated', sets: 4, reps: '5-6', load: '85% 1RM' },
          { name: 'Cable pulley cup+pronation', sets: 4, reps: '8/side', load: '70%' },
        ],
      },
      {
        day: 'Day B — Press + toproll power',
        focus: 'Finishing power',
        exercises: [
          { name: 'Toproll power pulls, strap', sets: 5, reps: '3-5', load: '85%' },
          { name: 'Press holds, table angle', sets: 4, reps: '10s', load: 'submaximal' },
          { name: 'Farmer carries', sets: 4, reps: '30m', load: 'bodyweight / hand' },
        ],
      },
    ],
  },
];

export const ATHLETE_BY_KEY = Object.fromEntries(ATHLETES.map((a) => [a.key, a])) as Record<AthleteKey, AthleteProfile>;
