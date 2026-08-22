export type AthleteKey =
  | 'larratt'
  | 'cyplenkov'
  | 'saginashvili'
  | 'laletin'
  | 'gasparini'
  | 'todd'
  | 'bagent'
  | 'prudnik'
  | 'backman'
  | 'kvikvinia'
  | 'trubin'
  | 'taynov'
  | 'beziazykov'
  | 'chaffee'
  | 'bresnan'
  | 'handeland'
  | 'jodiLarratt'
  | 'mask'
  | 'barboza';

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

  {
    key: 'kvikvinia',
    name: 'Genadi Kvikvinia',
    nickname: 'The Georgian Hammer',
    country: 'GE — Georgia',
    weightClass: 'SHW (130+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'A modern super heavyweight with freakish pressing power and a cup that swallows wrists whole. Genadi wins by making the match short and ugly: explosive start into inside position, then a press that finishes before opponents organize a defense.',
    signatureLifts: [
      'Explosive cup entries vs resistance',
      'Heavy press holds at pin angle',
      'Thick-bar wrist curls for armor',
      'Sled work for starting power',
      'Short-range bench press lockouts',
    ],
    cues: [
      'First inch decides the fight.',
      'Press early, press once, press hard.',
      'Cup depth beats wrist speed.',
      'Train the finish, not the journey.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Start explosion',
        focus: 'Entry speed & inside power',
        exercises: [
          { name: 'Explosive cup starts vs band', sets: 6, reps: '3 reps', load: 'light-fast' },
          { name: 'Bench lockout presses', sets: 5, reps: '3-5', load: '85%+' },
          { name: 'Thick-bar holds', sets: 4, reps: '15s', load: 'heavy' },
        ],
      },
      {
        day: 'Day B — Press & finish',
        focus: 'Match-ending pressure',
        exercises: [
          { name: 'Pin-angle press holds', sets: 5, reps: '8-10s', load: 'submax' },
          { name: 'Live pulls, first-to-2 format', sets: 6, reps: 'mini matches', load: 'live' },
          { name: 'Sled pushes', sets: 4, reps: '20m', load: 'heavy' },
        ],
      },
    ],
  },

  {
    key: 'trubin',
    name: 'Dmitry Trubin',
    nickname: 'The Tower',
    country: 'RU — Russia',
    weightClass: 'HW (~110-125 kg)',
    dominantArm: 'right',
    pullingStyle:
      'Another giant lever system in the Laletin mold \u2014 towering height, enormous hand, and a top-roller\u2019s patience. Dmitry wins the wrist quietly, climbs knuckle by knuckle, and lets his frame do the talking while opponents exhaust themselves against structure.',
    signatureLifts: [
      'Long-lever toproll strap work',
      'Static riser holds, slow tempo',
      'Single-arm lat pulldowns (grip-wide)',
      'Wrist extension strengthening (often neglected)',
      'Zone-2 cardio for long tournament days',
    ],
    cues: [
      'Height is nothing without hand height.',
      'Patience is a pressure too.',
      'Strengthen what others ignore.',
      'Recover like it is training.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Lever mechanics',
        focus: 'Toproll geometry under fatigue',
        exercises: [
          { name: 'Full-range toproll strap pulls', sets: 5, reps: '6/side', load: '70%' },
          { name: 'Riser statics, tempo descent', sets: 4, reps: '25s', load: 'moderate' },
          { name: 'Wrist extension curls', sets: 4, reps: '12', load: 'light-moderate' },
        ],
      },
      {
        day: 'Day B — Engine building',
        focus: 'Endurance & recovery capacity',
        exercises: [
          { name: 'Wide-grip lat pulldowns', sets: 4, reps: '10', load: 'moderate-heavy' },
          { name: 'Table rounds, 90s continuous', sets: 4, reps: '1 round', load: 'live' },
          { name: 'Zone-2 cardio', sets: 1, reps: '30 min', load: 'easy' },
        ],
      },
    ],
  },

  {
    key: 'taynov',
    name: 'Artem Taynov',
    nickname: 'The Technician',
    country: 'UA — Ukraine',
    weightClass: 'LHW (~95 kg)',
    dominantArm: 'right',
    pullingStyle:
      'World-class light heavyweight whose game is precision timing: a flash pronation that lands before grips settle, immediately chained into back-pressure. Artem proves that in the lighter classes, milliseconds and angles outscore kilograms.',
    signatureLifts: [
      'Reaction-based pronation drills',
      'Back-pressure cable drags, explosive sets',
      'Tempo supination chains',
      'Positional sparring from neutral only',
      'Grip-endurance high-rep blocks',
    ],
    cues: [
      'Beat their brain, not their arm.',
      'One clean transition is worth ten pushes.',
      'Light classes are won on endurance.',
      'Drill the entry until it is reflex.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Speed skills',
        focus: 'Pronation timing & chaining',
        exercises: [
          { name: 'Reaction pronation drills', sets: 6, reps: '5 fast', load: 'light' },
          { name: 'Explosive back-pressure drags', sets: 5, reps: '6', load: 'moderate' },
          { name: 'Neutral-start positional sparring', sets: 8, reps: '12s', load: 'live' },
        ],
      },
      {
        day: 'Day B — Endurance base',
        focus: 'Grip & pull endurance',
        exercises: [
          { name: 'High-rep grip blocks', sets: 4, reps: '20+', load: 'light' },
          { name: 'Supination chains, strict tempo', sets: 4, reps: '10/side', load: 'moderate' },
          { name: 'Face pulls', sets: 4, reps: '20', load: 'light' },
        ],
      },
    ],
  },

  {
    key: 'beziazykov',
    name: 'Alexander Beziazykov',
    nickname: 'The Ukrainian Anvil',
    country: 'UA — Ukraine',
    weightClass: 'SHW (140+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'Colossal even among super heavyweights. Beziazykov pairs mountain-man raw strength with surprisingly refined inside technique; when he cups, the round ends as a formality. His gym numbers belong to strongman, his table patience belongs to a chess player.',
    signatureLifts: [
      'Max-effort thick-bar holds',
      'Heavy partial deadlifts (grip limit)',
      'Massive-volume hammer curl drops',
      'Standing cable cup, peak holds',
      'Strongman carries for structural grit',
    ],
    cues: [
      'Raw strength forgives small mistakes.',
      'Hold the cup; time does the rest.',
      'Carries build champions, not mirrors.',
      'Respect recovery as much as tonnage.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Max strength',
        focus: 'Structural overload',
        exercises: [
          { name: 'Partial deadlifts from blocks', sets: 5, reps: '3-5', load: '90%+' },
          { name: 'Thick-bar max holds', sets: 4, reps: '10s', load: 'max effort' },
          { name: 'Standing cable cup peaks', sets: 4, reps: '10s', load: 'near-max' },
        ],
      },
      {
        day: 'Day B — Volume armor',
        focus: 'Hypertrophy & carry work',
        exercises: [
          { name: 'Hammer curl drop sets', sets: 4, reps: '12+8+6', load: 'descending' },
          { name: 'Farmer/yoke carries', sets: 5, reps: '25m', load: 'very heavy' },
          { name: 'Live inside-game pulls', sets: 6, reps: '1 pull', load: 'submax' },
        ],
      },
    ],
  },

  {
    key: 'chaffee',
    name: 'Dave Chaffee',
    nickname: 'The Tank',
    country: 'US — USA',
    weightClass: 'SHW/HW (~115-125 kg)',
    dominantArm: 'right',
    pullingStyle:
      'American fan favorite famous for wars of pure attrition. Dave\u2019s style is deceptively simple \u2014 get inside, stay inside, keep the pressure coming in waves until the opponent\u2019s will breaks before his arm does. Legendary gas tank, legendary heart.',
    signatureLifts: [
      'High-volume inside hook pulls',
      'Isometric wall sits with table grip',
      'Conditioning circuits (battle ropes, sled)',
      'Heavy supinate-and-hold complexes',
      'Partner-resisted grind rounds',
    ],
    cues: [
      'Make every second miserable for them.',
      'Pressure in waves, never in spikes.',
      'The tank beats the sprinter in round three.',
      'Will is trainable \u2014 train it.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Grind volume',
        focus: 'Inside-position endurance',
        exercises: [
          { name: 'Inside hook pulls, long sets', sets: 5, reps: '45s', load: 'moderate' },
          { name: 'Supinate-and-hold complexes', sets: 4, reps: '20s hold + 10 reps', load: 'moderate' },
          { name: 'Battle rope intervals', sets: 6, reps: '30s on / 30s off', load: 'hard' },
        ],
      },
      {
        day: 'Day B — War games',
        focus: 'Attrition sparring',
        exercises: [
          { name: 'Grind rounds vs fresh partners', sets: 6, reps: '60s each', load: 'live' },
          { name: 'Wall-sit grip holds', sets: 4, reps: '45s', load: 'bodyweight' },
          { name: 'Sled drag finisher', sets: 3, reps: '40m', load: 'heavy' },
        ],
      },
    ],
  },

  {
    key: 'bresnan',
    name: 'Tim Bresnan',
    nickname: 'The Bres',
    country: 'US — USA',
    weightClass: 'HW (~105-120 kg)',
    dominantArm: 'right',
    pullingStyle:
      'Explosive American heavyweight with a wrestler\u2019s athleticism translated to the table. Tim mixes fast outside entries with sudden inside switches \u2014 opponents brace for one plan and receive the other mid-round.',
    signatureLifts: [
      'Contrast training: heavy pulls + explosive jumps',
      'Switch drills (toproll to hook transitions)',
      'Medicine-ball rotational throws',
      'Fat-grip rows for handle versatility',
      'Sprint work for fast-twitch maintenance',
    ],
    cues: [
      'Have two plans; show them one.',
      'Athletes beat lifters at the table.',
      'Switch mid-match, not mid-thought.',
      'Speed is perishable \u2014 maintain it.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Contrast power',
        focus: 'Strength-speed blend',
        exercises: [
          { name: 'Heavy strap pulls', sets: 4, reps: '4', load: '85%' },
          { name: 'Broad jumps', sets: 4, reps: '5', load: 'bodyweight' },
          { name: 'Switch transition drills', sets: 6, reps: '1 cycle', load: 'technical' },
        ],
      },
      {
        day: 'Day B — Athletic table',
        focus: 'Versatility live',
        exercises: [
          { name: 'Rotational med-ball throws', sets: 4, reps: '8/side', load: 'moderate' },
          { name: 'Fat-grip rows', sets: 4, reps: '8', load: 'moderate-heavy' },
          { name: 'Open-format sparring (any style)', sets: 8, reps: '1 pull', load: 'live' },
        ],
      },
    ],
  },

  {
    key: 'handeland',
    name: 'Josh Handeland',
    nickname: 'The Viking',
    country: 'US — USA',
    weightClass: 'MW/LHW (~95-105 kg)',
    dominantArm: 'right',
    pullingStyle:
      'Rising American star with an old-school work ethic and a new-school understanding of vectors. Josh\u2019s rise came from treating armwrestling as a skill sport: deliberate practice logs, video study, and surgical drilling of exactly the positions his upcoming opponents favor.',
    signatureLifts: [
      'Deliberate-practice positional drills (logged daily)',
      'Vector-specific weak-point training',
      'Strap-work ladders',
      'Forearm extensor isolation (injury-proofing)',
      'Mental rehearsal + film sessions',
    ],
    cues: [
      'Practice with purpose or not at all.',
      'Study the opponent; steal their best move.',
      'Extensors save seasons.',
      'Small improvements compound into titles.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Targeted weak points',
        focus: 'Individual vector gaps',
        exercises: [
          { name: 'Weakest-vector focused lifts', sets: 6, reps: '8', load: 'moderate-heavy' },
          { name: 'Extensor isolation', sets: 4, reps: '15', load: 'light' },
          { name: 'Film + visualization session', sets: 1, reps: '20 min', load: '\u2014' },
        ],
      },
      {
        day: 'Day B — Deliberate table work',
        focus: 'Scenario drilling',
        exercises: [
          { name: 'Scripted scenario sparring', sets: 10, reps: '1 rep', load: 'live, submax' },
          { name: 'Strap ladder pulls', sets: 4, reps: 'ascending', load: 'moderate' },
          { name: 'Log review + next-week plan', sets: 1, reps: '15 min', load: '\u2014' },
        ],
      },
    ],
  },

  {
    key: 'jodiLarratt',
    name: 'Jodi Larratt',
    nickname: 'The First Lady of the Table',
    country: 'CA — Canada',
    weightClass: 'FE (women\u2019s divisions)',
    dominantArm: 'right',
    pullingStyle:
      'Elite competitor in her own right and half of armwrestling\u2019s most famous household. Jodi brings championship pedigree, deep technical literacy across every vector, and the kind of table composure that only thousands of matches build.',
    signatureLifts: [
      'Full-vector technique circuits',
      'Wrist and cup strength supersets',
      'High-frequency moderate-load pulls',
      'Referee-command reaction training',
      'Core anti-rotation work (table posture)',
    ],
    cues: [
      'Composure is a technique.',
      'Know all six vectors, fear none.',
      'Frequency builds feel.',
      'Posture starts in the core.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Vector circuits',
        focus: 'All-angle fluency',
        exercises: [
          { name: 'Six-vector technique circuit', sets: 6, reps: '8/vector', load: 'light-moderate' },
          { name: 'Cup + wrist superset', sets: 4, reps: '12+12', load: 'moderate' },
          { name: 'Anti-rotation core work', sets: 4, reps: '12/side', load: 'controlled' },
        ],
      },
      {
        day: 'Day B — High-frequency pulls',
        focus: 'Volume with clean form',
        exercises: [
          { name: 'Moderate-load table pulls', sets: 8, reps: '1 pull', load: 'submax' },
          { name: 'Command-reaction starts', sets: 10, reps: '1 rep', load: 'live, light' },
          { name: 'Forearm pump finisher', sets: 3, reps: '20+', load: 'light' },
        ],
      },
    ],
  },

  {
    key: 'mask',
    name: 'Matt Mask',
    nickname: 'The Canadian Giant',
    country: 'CA — Canada',
    weightClass: 'SHW (140+ kg)',
    dominantArm: 'right',
    pullingStyle:
      'One of the tallest athletes ever to compete, Matt turns reach into a cage: opponents must travel forever to reach striking distance while he sets a perfect top-roller\u2019s trap. His game rewards the patient big man who refuses to panic.',
    signatureLifts: [
      'Trap-bar deadlifts (frame strength)',
      'Reach-focused setup drills',
      'Slow-eccentric pronation',
      'Grip crush ladders',
      'Posterior-chain hypertrophy blocks',
    ],
    cues: [
      'Make them reach; make them pay.',
      'Big frames need big bases.',
      'Eccentrics build joint-proof tendons.',
      'No panic in the first five seconds.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Frame strength',
        focus: 'Posterior chain & grip',
        exercises: [
          { name: 'Trap-bar deadlifts', sets: 5, reps: '5', load: 'heavy' },
          { name: 'Crush ladders', sets: 5, reps: 'ascending', load: 'hard grippers' },
          { name: 'Slow-eccentric pronation', sets: 4, reps: '8', load: 'moderate' },
        ],
      },
      {
        day: 'Day B — Reach traps',
        focus: 'Setup mastery',
        exercises: [
          { name: 'Reach-denial setup drills', sets: 8, reps: '1 rep', load: 'live, submax' },
          { name: 'Hypertrophy row block', sets: 4, reps: '10', load: 'moderate-heavy' },
          { name: 'Mobility for shoulders/hips', sets: 1, reps: '15 min', load: '\u2014' },
        ],
      },
    ],
  },

  {
    key: 'barboza',
    name: 'Marcio Barboza',
    nickname: 'The Brazilian Legend',
    country: 'BR — Brazil',
    weightClass: 'MW/LHW (~90-100 kg)',
    dominantArm: 'right',
    pullingStyle:
      'South America\u2019s most decorated puller and a hook artist of the highest order. Marcio\u2019s inside game combines ferocious bicep strength with a veteran\u2019s calm \u2014 decades of matches distilled into an entry that feels inevitable.',
    signatureLifts: [
      'Heavy supination holds at 45°',
      'Hook-entry resistance drills',
      'Thick-grip bicep mass work',
      'Isometric side pressure blocks',
      'Long-career mobility maintenance',
    ],
    cues: [
      'Experience speaks softly and wins loudly.',
      'Bicep strength is hook currency.',
      'Protect the joints; lengthen the career.',
      'Stay calm \u2014 the hook always comes.',
    ],
    weeklySplit: [
      {
        day: 'Day A — Hook currency',
        focus: 'Supination & bicep strength',
        exercises: [
          { name: 'Supination holds at 45°', sets: 5, reps: '15s', load: 'heavy' },
          { name: 'Thick-grip curls', sets: 4, reps: '8-10', load: 'heavy' },
          { name: 'Hook-entry resistance drill', sets: 6, reps: '1 rep', load: 'partner' },
        ],
      },
      {
        day: 'Day B — Career care',
        focus: 'Joint health & side pressure',
        exercises: [
          { name: 'Isometric side-pressure blocks', sets: 4, reps: '12s', load: 'submax' },
          { name: 'Mobility & tendon care routine', sets: 1, reps: '20 min', load: '\u2014' },
          { name: 'Light technical pulls', sets: 8, reps: '1 pull', load: 'very light, crisp' },
        ],
      },
    ],
  },
];

export const ATHLETE_BY_KEY = Object.fromEntries(ATHLETES.map((a) => [a.key, a])) as Record<AthleteKey, AthleteProfile>;
