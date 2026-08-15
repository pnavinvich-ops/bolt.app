import type { Vector } from '@/types/domain';

export interface VectorGuideEntry {
  key: Vector;
  what: string;
  why: string;
  how: string;
  mistakes: string;
  cue: string;
}

export const VECTOR_GUIDE: VectorGuideEntry[] = [
  {
    key: 'rise',
    what: 'Radial deviation of the wrist — bending the hand toward the thumb so the knuckles stay the highest point of the contact.',
    why: 'A high knuckle line dictates the geometry of the match. Whoever controls knuckle height dictates the angle everyone else has to fight from.',
    how: 'Train with a thick-bar wrist roller, static strap riser holds (3 × 20–30 s), and hammer-curl-to-radial-deviation supersets twice a week. Keep elbow stacked under the shoulder; let the wrist do the work, not the bicep.',
    mistakes: 'Recruiting the bicep to "lift" the wrist (it rotates, it doesn\'t rise), letting the elbow drift out, and training with the palm flat on the table (this trains nothing).',
    cue: 'Knuckles up. Elbow in. Wrist does the work.',
  },
  {
    key: 'cup',
    what: 'Wrist flexion — closing the hand into a deep C-shape so your palm wraps over the back of your own thumb and covers the opponent\'s fingers.',
    why: 'The cup is inside position. It controls depth, denies the opponent knuckle access, and sets up every finish: toproll, hook, or press.',
    how: 'Cup holds on a cable column with 60–80% 1RM (4 × 15 s), wrist-curl machines with full range, and heavy hammer curls to thicken the flexor mass. Pull against a strap fixed to a table for table-specific timing.',
    mistakes: 'Shallow cup (fingers straight = no depth), cupping with the fingers only instead of the whole palm, and forgetting to drive the cup with shoulder pressure — a cup without pressure is just a hand shape.',
    cue: 'Deep palm, fingers over their thumb. Drive it with your shoulder.',
  },
  {
    key: 'pronation',
    what: 'Rotating the forearm so the palm turns face-down at the contact — the "crack."',
    why: 'Pronation nullifies an opponent\'s cup, exposes their wrist, and converts your structure into a descending force they have to absorb with bone, not muscle.',
    how: 'Pronator curls (seated, elbow on knee) 4 × 8–12, reverse wrist curls with a light bar, and table-specific pronation holds on a fixed strap. Heavy single-rep pronation lifts with a partner beat the central nervous system into the pattern.',
    mistakes: 'Pronating with the wrist instead of the forearm (loses power), pronating before you have inside position (sliding on top of their cup), and training it without a strap — air-pronation builds nothing.',
    cue: 'Turn the key, don\'t twist the doorknob. Forearm rotates, palm goes down.',
  },
  {
    key: 'supination',
    what: 'Rotating the forearm palm-up — the entry to the hook and the recovery after a lost toproll.',
    why: 'Supination is the transition. It\'s what lets you shift from a toproll that\'s stalled into a hook that\'s pulling. Without it you only have one gear.',
    how: 'Hammer curls with thick handles, reverse-grip cable rows, and slow supination reps with a light dumbbell (3 × 12 each side). Practice the supination-to-curl chain on a strap twice a week.',
    mistakes: 'Using supination to "escape" a strong toproll (you\'re moving backward, not transitioning), and dropping the elbow when you supinate — the elbow must stay pinned or the hook has no root.',
    cue: 'Palm up, elbow in, shoulder pulls. That\'s the hook.',
  },
  {
    key: 'side',
    what: 'Lateral force applied to the opponent\'s hand and wrist toward their pinky side, combined with elbow placement that drives your shoulder into the contact line.',
    why: 'Side pressure bends the opponent\'s structure sideways, separates their shoulder from their hand, and creates the angle for a clean pin or a transition to a press.',
    how: 'Side-press holds on a cable stack with 70% load (4 × 12 s), landmine press rotations, and table-specific side-pressure drills where a partner resists your lateral push.',
    mistakes: 'Pushing with the arm instead of driving from the hip/shoulder, elbow flaring out to 90° (it should stay under the shoulder), and forgetting to pronate as you push side — side without pronation slides off.',
    cue: 'Drive from the hip, elbow under shoulder, pronate as you push.',
  },
  {
    key: 'back',
    what: 'Posterior chain force — pulling with the lats, teres, and rear delt to drag the opponent\'s arm across your body toward your chest.',
    why: 'Back pressure is the engine of the pull. No amount of wrist technique moves a heavy arm without it. It\'s also the most tendon-friendly force vector because the load travels through bone, not joint capsule.',
    how: 'Heavy rows (Pendlay, barbell, or single-arm dumbbell) 4 × 5–8, face pulls with high reps, and deadlifts to build the posterior chain. On the table, practice the "shoulder to pocket" cue — drag the strap toward your chest pocket.',
    mistakes: 'Pulling with the biceps (they\'re not built for it, your tendons will tell you), losing elbow position when you pull, and forgetting to engage the lat before the arm fires.',
    cue: 'Shoulder to pocket. Lat first, hand second.',
  },
];
