import { useNavigate } from 'react-router-dom';
import { Dumbbell, ChevronRight, RotateCcw } from 'lucide-react';
import { useOnboarding } from '@/stores/onboarding';

export default function IntroScreen() {
  const navigate = useNavigate();
  const completed = useOnboarding((s) => s.onboardingCompleted);
  const unlocked = useOnboarding((s) => s.planUnlocked);
  const reset = useOnboarding((s) => s.reset);

  const start = () => {
    if (completed && unlocked) navigate('/onboarding/plan');
    else if (completed) navigate('/onboarding/paywall');
    else navigate('/onboarding/quiz');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-surface animate-pop">
        <Dumbbell size={48} className="text-accent" strokeWidth={2.4} />
      </div>
      <h1 className="mb-3 text-display">ArmLog</h1>
      <p className="mb-1 max-w-xs text-body text-text-dim">
        Your arm-wrestling training companion. Log lifts, track tendon health, and get a custom AI training plan.
      </p>
      <p className="mb-10 max-w-xs text-caption text-text-faint">
        Built for solo athletes who train hard and track everything.
      </p>

      <button type="button" onClick={start} className="btn-primary w-full max-w-xs">
        {completed ? 'View your plan' : 'Build my plan'} <ChevronRight size={18} />
      </button>

      {completed && (
        <button
          type="button"
          onClick={() => { reset(); navigate('/onboarding/quiz'); }}
          className="mt-4 flex items-center gap-1.5 text-caption text-text-faint transition-colors hover:text-text-dim"
        >
          <RotateCcw size={14} /> Reset onboarding
        </button>
      )}
    </div>
  );
}
