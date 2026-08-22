export type AthleteKey =
  | 'larratt'
  | 'cyplenkov'
  | 'saginashvili'
  | 'laletin'
  | 'gasparini'
  | 'todd'
  | 'bagent'
  | 'prudnik'
  | 'backman';

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

  {
    key: 'laletin',
    name: 'Vitaly Laletin',
    nickname: 'The Siberian Bear',
    country: 'RU — Russia',
    weightClass: 'LHW/HW (105+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'A 198 cm lever machine built on a crushing top-roller\u2019s wrist and enormous back pressure. Vitaly sets a high hand, climbs the knuckles, then drags opponents through with relentless lat drive. His size lets him win angles slowly \u2014 opponents run out of road before they run out of match.',
    signatureLifts: [
      'Heavy single-arm rows (lat-focused)',
      'Toproll strap pulls at full extension',
      'Riser holds, thick bar (long levers demand it)',
      'Pronation lifts, heavy singles',
      'Back-pressure band drags for endurance',
    ],
    cues: [
      'Long arms are a weapon only with a high hand.',
      'Win the wrist, then let the back finish.',
      'Slow pressure breaks faster opponents.',
      'Never trade speed \u2014 trade structure.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Back pressure + toproll',
        focus: 'Lat drive & knuckle height',
        exercises: [
          { name: 'Single-arm dumbbell rows', sets: 5, reps: '6-8', load: 'heavy' },
          { name: 'Strap toproll pulls, full range', sets: 4, reps: '5/side', load: '80%' },
          { name: 'Riser holds, thick bar', sets: 3, reps: '20s', load: 'moderate' },
        ],
      },
      {
        day: 'Day B — Pronation + table time',
        focus: 'Wrist strength & live pulls',
        exercises: [
          { name: 'Pronation lifts, strap (heavy single)', sets: 5, reps: '1-3', load: '85%+' },
          { name: 'Live pulls vs partner — toproll entry', sets: 8, reps: '1 pull', load: 'submax' },
          { name: 'Wrist curls, thick bar', sets: 4, reps: '10-12', load: 'moderate' },
        ],
      },
    ],
  },

  {
    key: 'gasparini',
    name: 'Ermes Gasparini',
    nickname: 'The Italian Wall',
    country: 'IT — Italy',
    weightClass: 'SHW (130+ kg)',
    dominantArm: 'left',
    pullingStyle:
      'One of the strongest left hands on the planet. Ermes pairs an immovable cup with a short-range press that turns matches into static wars he always wins. His training favors brutal isometrics and thick-handled volume over speed work \u2014 he simply outlasts the opponent\u2019s structure.',
    signatureLifts: [
      'Cup holds, thick handles (near-maximal)',
      'Isometric press holds at 90°',
      'Heavy hammer curls, strict',
      'Side-pressure cable holds, long durations',
      'Farmer carries for grip endurance',
    ],
    cues: [
      'Make it static. Static favors the stronger hand.',
      'The cup does not open \u2014 ever.',
      'Press through their knuckles, not the pad.',
      'Endurance is a weapon at super heavyweight.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Cup & wrist armor',
        focus: 'Inside position strength',
        exercises: [
          { name: 'Cup holds, thick handle', sets: 5, reps: '15-20s', load: '90% 1RM' },
          { name: 'Hammer curls, strict', sets: 4, reps: '8-10', load: 'heavy' },
          { name: 'Wrist roller, thick bar', sets: 3, reps: '2 laps', load: 'moderate' },
        ],
      },
      {
        day: 'Day B — Press endurance',
        focus: 'Static pressing power',
        exercises: [
          { name: 'Isometric press holds at 90°', sets: 5, reps: '10-12s', load: 'submax' },
          { name: 'Cable side-press holds', sets: 4, reps: '15s/side', load: '70%' },
          { name: 'Farmer carries', sets: 4, reps: '30m', load: 'bodyweight/hand' },
        ],
      },
    ],
  },

  {
    key: 'todd',
    name: 'Michael Todd',
    nickname: 'MT / The King\u2019s Move Architect',
    country: 'US — USA',
    weightClass: 'SHW (110+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'The most famous defensive armwrestler alive. Michael turned the king\u2019s move \u2014 trapping the opponent\u2019s hand behind his own head and shoulder \u2014 into a career-long masterclass in endurance and mental warfare. Opponents burn everything against a wall that simply does not move, then lose to a single counter-press.',
    signatureLifts: [
      'Neck and trap isolation (king\u2019s move armor)',
      'Long-duration isometric holds behind the head',
      'High-rep band pull-aparts and rear delt work',
      'Conditioning circuits (rower, sled) for match cardio',
      'Defensive table drills vs aggressive starters',
    ],
    cues: [
      'Let them spend. Then take what\u2019s left.',
      'Your head is the fourth limb of the match.',
      'Defense wins rounds; one press wins the match.',
      'Cardio is a strength skill at the top level.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Defensive structure',
        focus: 'King\u2019s move frame & isometrics',
        exercises: [
          { name: 'Behind-head static holds', sets: 5, reps: '30-45s', load: 'partner pressure' },
          { name: 'Shrugs & neck extensions', sets: 4, reps: '12-15', load: 'moderate-heavy' },
          { name: 'Band pull-aparts, high volume', sets: 4, reps: '25+', load: 'light' },
        ],
      },
      {
        day: 'Day B — Conditioning + counters',
        focus: 'Match cardio & press timing',
        exercises: [
          { name: 'Rowing intervals', sets: 6, reps: '250m', load: 'hard pace' },
          { name: 'Counter-press drills vs fast starts', sets: 8, reps: '1 rep', load: 'live' },
          { name: 'Sled push/pull', sets: 4, reps: '20m', load: 'heavy' },
        ],
      },
    ],
  },

  {
    key: 'bagent',
    name: 'Travis Bagent',
    nickname: 'The Hook Machine',
    country: 'US — USA',
    weightClass: 'MW/HW (~100 kg)',
    dominantArm: 'right',
    pullingStyle:
      'The most decorated hook puller in history, with decades of national titles built on a violent inside game. Travis hits a supinated hook entry before opponents finish their first thought, then closes the door with a bicep-and-brachialis lock that has beaten generations of toprollers.',
    signatureLifts: [
      'Heavy supination curls, partials at the strong range',
      'Inside hook strap pulls, explosive doubles',
      'Reverse curls for brachialis mass',
      'Grippers and thick-bar holds for crush grip',
      'Fast-start reaction drills off a whistle',
    ],
    cues: [
      'Speed kills at the start \u2014 own the first inch.',
      'Hook is a punch, not a squeeze.',
      'Supinate until their wrist is furniture.',
      'Experience beats youth when the entry is instant.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Inside game power',
        focus: 'Hook entry & supination',
        exercises: [
          { name: 'Supination curls, strong-range partials', sets: 5, reps: '6-8', load: '90% 1RM' },
          { name: 'Hook strap pulls, explosive', sets: 5, reps: '2-3', load: '80%' },
          { name: 'Reverse curls', sets: 4, reps: '10', load: 'moderate' },
        ],
      },
      {
        day: 'Day B — Grip & speed',
        focus: 'Crush strength & start timing',
        exercises: [
          { name: 'Gripper work', sets: 5, reps: '5/close', load: 'hard setting' },
          { name: 'Thick-bar holds', sets: 4, reps: '20s', load: 'heavy' },
          { name: 'Whistle-reaction table starts', sets: 10, reps: '1 pull', load: 'live, submax' },
        ],
      },
    ],
  },

  {
    key: 'prudnik',
    name: 'Evgeny Prudnik',
    nickname: 'The Professor',
    country: 'UA — Ukraine',
    weightClass: 'LW/LHW (~80-95 kg)',
    dominantArm: 'right',
    pullingStyle:
      'A multi-time world champion who proves every season that technique compounds. Evgeny\u2019s toproll is textbook-perfect at full speed: seamless cup-to-rise transition, surgical pronation, and back pressure timed to the millisecond. He studies opponents like exams and passes them all.',
    signatureLifts: [
      'Technical toproll drills at varying speeds',
      'Light-weight, perfect-form supination chains',
      'Band-resisted pronation for speed-strength',
      'Table study sessions (film + positional sparring)',
      'Volume wrist flexion with strict tempo',
    ],
    cues: [
      'Perfect reps beat heavy sloppy ones.',
      'Know their plan before the grip goes up.',
      'Transitions win \u2014 not positions.',
      'Train the speed of the skill, not just the skill.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Skill speed',
        focus: 'Vector transitions under tempo',
        exercises: [
          { name: 'Tempo toproll chain drills (cup→rise→pronation)', sets: 6, reps: '8 cycles', load: 'light-moderate' },
          { name: 'Band-resisted pronation', sets: 4, reps: '12/side', load: 'light' },
          { name: 'Positional sparring from cup', sets: 8, reps: '15s', load: 'live, submax' },
        ],
      },
      {
        day: 'Day B — Strength maintenance',
        focus: 'Joint-friendly heavy work',
        exercises: [
          { name: 'Strict wrist flexion, slow tempo', sets: 4, reps: '10', load: 'moderate' },
          { name: 'Rows, chest-supported', sets: 4, reps: '8', load: 'heavy-ish' },
          { name: 'Hammer curls, controlled negatives', sets: 3, reps: '8', load: 'moderate' },
        ],
      },
    ],
  },

  {
    key: 'backman',
    name: 'Sarah Bäckman',
    nickname: 'The Eight-Time World Champion',
    country: 'SE — Sweden',
    weightClass: 'FE (women\u2019s divisions)',
    dominantArm: 'right',
    pullingStyle:
      'An eight-time world champion who crossed over from pro armwrestling to WWE without losing an ounce of table IQ. Sarah\u2019s game is a razor-sharp toproll with elite wrist strength \u2014 her wrist-curl numbers rival open-class men. She wins with clean geometry set up before the referee finishes speaking.',
    signatureLifts: [
      'Heavy wrist curls (her signature weapon)',
      'Toproll setup reps on a fixed table',
      'Grip crush work, high frequency',
      'Shoulder press variations for press finishing',
      'Reaction-start drills with variable commands',
    ],
    cues: [
      'Wrist strength decides women\u2019s classes \u2014 build it first.',
      'Set your grip plan before "Ready" is called.',
      'Clean angles beat raw force every round.',
      'Frequency beats intensity for technique sports.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Wrist dominance',
        focus: 'Flexor & extensor max strength',
        exercises: [
          { name: 'Heavy wrist curls', sets: 5, reps: '8-10', load: 'progressive overload' },
          { name: 'Reverse wrist curls, strict', sets: 4, reps: '12', load: 'moderate' },
          { name: 'Toproll setups on fixed table', sets: 6, reps: '1 rep', load: 'technical' },
        ],
      },
      {
        day: 'Day B — Full-body power',
        focus: 'Press strength & conditioning',
        exercises: [
          { name: 'Overhead press', sets: 4, reps: '6-8', load: 'heavy' },
          { name: 'Pull-ups or assisted variation', sets: 4, reps: 'AMRAP-1', load: 'bodyweight' },
          { name: 'Variable-command start drills', sets: 10, reps: '1 pull', load: 'live, light' },
        ],
      },
    ],
  },
];

export const ATHLETE_BY_KEY = Object.fromEntries(ATHLETES.map((a) => [a.key, a])) as Record<AthleteKey, AthleteProfile>;
