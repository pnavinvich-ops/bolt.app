import type { ExerciseIcon } from '@/data/exercises';

const S = '#9A9AA8';
const A = '#FF5A1F';
const G = '#3DDC97';

/** Minimal equipment/movement diagrams for the exercise library. */
export default function ExerciseGlyph({ icon, size = 96 }: { icon: ExerciseIcon; size?: number }) {
  const common = { stroke: S, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden>
      {icon === 'roller' && (
        <>
          <line {...common} x1="48" y1="14" x2="48" y2="82" />
          <rect {...common} x="36" y="38" width="24" height="20" rx="4" />
          <path d="M30 26 L48 18 L66 26" {...common} stroke={A} />
          <path d="M30 70 L48 78 L66 70" {...common} stroke={G} />
        </>
      )}
      {icon === 'cable' && (
        <>
          <rect {...common} x="16" y="16" width="20" height="64" rx="6" />
          <circle {...common} cx="58" cy="24" r="8" />
          <path d="M58 32 C58 52 44 56 40 68" {...common} />
          <path d="M34 62 C28 54 30 46 38 44 C46 42 50 50 44 58 Z" {...common} stroke={A} />
          <path d="M76 40 L88 40 M82 34 L88 40 L82 46" {...common} stroke={G} />
        </>
      )}
      {icon === 'pronate' && (
        <>
          <rect {...common} x="20" y="42" width="56" height="16" rx="8" transform="rotate(-12 48 50)" />
          <path d="M60 22 A26 26 0 0 1 84 44" {...common} stroke={A} />
          <path d="M84 44 L86 34 M84 44 L74 42" {...common} stroke={A} />
        </>
      )}
      {icon === 'supinate' && (
        <>
          <rect {...common} x="20" y="42" width="56" height="16" rx="8" transform="rotate(12 48 50)" />
          <path d="M60 74 A26 26 0 0 0 84 52" {...common} stroke={A} />
          <path d="M84 52 L86 62 M84 52 L74 54" {...common} stroke={A} />
        </>
      )}
      {icon === 'side' && (
        <>
          <path d="M18 64 L52 44 L74 50" {...common} />
          <circle {...common} cx="78" cy="51" r="7" stroke={A} />
          <path d="M80 30 L92 30 M87 25 L93 31 L87 37" {...common} stroke={G} />
          <line {...common} x1="14" y1="72" x2="82" y2="72" strokeDasharray="5 5" />
        </>
      )}
      {icon === 'row' && (
        <>
          <circle {...common} cx="26" cy="40" r="10" />
          <path d="M34 52 C46 58 56 58 66 54" {...common} />
          <rect {...common} x="64" y="42" width="18" height="10" rx="4" stroke={A} />
          <path d="M50 66 L38 78 M56 66 L48 80" {...common} stroke={S} strokeWidth={3} />
        </>
      )}
      {icon === 'hammer' && (
        <>
          <rect {...common} x="42" y="16" width="12" height="34" rx="4" />
          <rect {...common} x="34" y="14" width="28" height="10" rx="4" />
          <path d="M36 52 C30 62 34 74 48 78 C60 81 68 74 66 64" {...common} stroke={A} />
        </>
      )}
      {icon === 'spinner' && (
        <>
          <rect {...common} x="30" y="42" width="36" height="12" rx="6" />
          <circle {...common} cx="48" cy="48" r="17" opacity={0.35} />
          <path d="M48 24 A24 24 0 0 1 70 40" {...common} stroke={A} />
          <path d="M70 40 L71 30 M70 40 L61 38" {...common} stroke={A} />
        </>
      )}
      {icon === 'hold' && (
        <>
          <path d="M20 70 L48 30 L76 70" {...common} />
          <circle {...common} cx="76" cy="70" r="6" stroke={G} />
          <path d="M48 30 L48 16" {...common} stroke={A} />
          <path d="M43 21 L48 15 L53 21" {...common} stroke={A} />
        </>
      )}
      {icon === 'table' && (
        <>
          <line {...common} x1="12" y1="52" x2="84" y2="52" />
          <rect {...common} x="12" y="44" width="72" height="8" rx="2" />
          <path d="M30 44 C34 30 46 26 52 36" {...common} stroke={A} />
          <path d="M66 44 C62 30 50 26 44 36" {...common} stroke={G} />
          <line {...common} x1="24" y1="52" x2="24" y2="78" />
          <line {...common} x1="72" y1="52" x2="72" y2="78" />
        </>
      )}
    </svg>
  );
}
