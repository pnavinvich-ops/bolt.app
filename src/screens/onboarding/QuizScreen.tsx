import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { OnboardingProfile, Goal, Experience, Vector, TendonStatus } from '@/types/domain';
import {
  GOALS, GOAL_LABEL, GOAL_DESC,
  EXPERIENCES, EXPERIENCE_LABEL, EXPERIENCE_DESC,
  VECTORS, VECTOR_LABEL, VECTOR_HINT,
  TENDON_STATUSES, TENDON_LABEL, TENDON_DESC,
} from '@/types/constants';
import { useOnboarding } from '@/stores/onboarding';
import Stepper from '@/components/Stepper';

const TOTAL_STEPS = 5;

export default function QuizScreen() {
  const navigate = useNavigate();
  const setProfile = useOnboarding((s) => s.setProfile);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [focus, setFocus] = useState<Vector[]>([]);
  const [sessions, setSessions] = useState<2 | 3 | 4 | 5 | null>(null);
  const [tendon, setTendon] = useState<TendonStatus | null>(null);

  const canAdvance = () => {
    if (step === 0) return goal !== null;
    if (step === 1) return experience !== null;
    if (step === 2) return focus.length >= 1 && focus.length <= 4;
    if (step === 3) return sessions !== null;
    if (step === 4) return tendon !== null;
    return false;
  };

  const toggleFocus = (v: Vector) => {
    setFocus((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= 4) return prev;
      return [...prev, v];
    });
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else if (goal && experience && sessions && tendon) {
      const profile: OnboardingProfile = { goal, experience, focus, sessionsPerWeek: sessions, tendonStatus: tendon };
      setProfile(profile);
      navigate('/onboarding/paywall');
    }
  };

  const handleBack = () => {
    if (step === 0) navigate('/onboarding');
    else setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6 safe-t">
        <div className="mb-8 flex items-center justify-between">
          <button type="button" onClick={handleBack} className="flex h-9 w-9 items-center justify-center rounded-md text-text-dim hover:bg-surfaceAlt">
            <ChevronLeft size={20} />
          </button>
          <Stepper current={step} total={TOTAL_STEPS} />
          <span className="w-9 text-right text-caption text-text-faint">{step + 1}/{TOTAL_STEPS}</span>
        </div>

        <div className="flex-1">
          {step === 0 && (
            <div className="animate-slide-up">
              <h2 className="mb-2 text-h1">What's your main goal?</h2>
              <p className="mb-6 text-body text-text-dim">This shapes your primary vectors and rep ranges.</p>
              <div className="space-y-2.5">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all active:scale-[0.98] ${
                      goal === g ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-h3 ${goal === g ? 'text-accent-hi' : ''}`}>{GOAL_LABEL[g]}</p>
                      <p className="text-caption text-text-dim">{GOAL_DESC[g]}</p>
                    </div>
                    {goal === g && <Check size={20} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="mb-2 text-h1">Your experience?</h2>
              <p className="mb-6 text-body text-text-dim">We use this to set volume and intensity.</p>
              <div className="space-y-2.5">
                {EXPERIENCES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setExperience(e)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all active:scale-[0.98] ${
                      experience === e ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-h3 ${experience === e ? 'text-accent-hi' : ''}`}>{EXPERIENCE_LABEL[e]}</p>
                      <p className="text-caption text-text-dim">{EXPERIENCE_DESC[e]}</p>
                    </div>
                    {experience === e && <Check size={20} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h2 className="mb-2 text-h1">Focus vectors?</h2>
              <p className="mb-1 text-body text-text-dim">Pick 1–4 vectors to emphasize in your plan.</p>
              <p className="mb-6 text-caption text-text-faint">{focus.length}/4 selected</p>
              <div className="grid grid-cols-2 gap-2.5">
                {VECTORS.map((v) => {
                  const active = focus.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleFocus(v)}
                      className={`rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
                        active ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                      }`}
                    >
                      <p className={`text-body font-semibold ${active ? 'text-accent-hi' : ''}`}>{VECTOR_LABEL[v]}</p>
                      <p className="mt-0.5 text-micro text-text-faint">{VECTOR_HINT[v]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <h2 className="mb-2 text-h1">Sessions per week?</h2>
              <p className="mb-6 text-body text-text-dim">How many arm-wrestling workouts can you commit to?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSessions(n as 2 | 3 | 4 | 5)}
                    className={`flex flex-col items-center gap-1 rounded-lg border py-6 transition-all active:scale-[0.98] ${
                      sessions === n ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                    }`}
                  >
                    <span className={`text-display ${sessions === n ? 'text-accent-hi' : ''}`}>{n}</span>
                    <span className="text-caption text-text-dim">{n === 2 ? 'Minimum' : n === 5 ? 'Max' : 'Good'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up">
              <h2 className="mb-2 text-h1">Tendon status?</h2>
              <p className="mb-6 text-body text-text-dim">Be honest — this adjusts your volume and adds caveats.</p>
              <div className="space-y-2.5">
                {TENDON_STATUSES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTendon(t)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all active:scale-[0.98] ${
                      tendon === t ? 'border-accent bg-accent-lo' : 'border-border bg-surface hover:bg-surfaceAlt'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-h3 ${tendon === t ? 'text-accent-hi' : ''}`}>{TENDON_LABEL[t]}</p>
                      <p className="text-caption text-text-dim">{TENDON_DESC[t]}</p>
                    </div>
                    {tendon === t && <Check size={20} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className="btn-primary w-full"
          >
            {step === TOTAL_STEPS - 1 ? 'Generate plan' : 'Continue'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
