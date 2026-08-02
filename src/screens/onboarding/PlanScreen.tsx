import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/stores/onboarding';
import { VECTOR_LABEL, HANDLE_LABEL, PULLEY_LABEL, ARM_LABEL } from '@/types/constants';
import { describeProfile } from '@/services/planGenerator';
import ScreenHeader from '@/components/ScreenHeader';

export default function PlanScreen() {
  const navigate = useNavigate();
  const profile = useOnboarding((s) => s.profile);
  const plan = useOnboarding((s) => s.plan);

  if (!profile || !plan) {
    navigate('/onboarding/quiz');
    return null;
  }

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title="Your Training Plan" subtitle={describeProfile(profile)} backTo="/" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="card flex items-center gap-3">
          <Sparkles size={20} className="text-accent" />
          <div className="flex-1">
            <p className="text-body font-semibold">{plan.summary}</p>
            <p className="text-caption text-text-faint">{plan.weeks} weeks · {plan.sessionsPerWeek} sessions/week</p>
          </div>
        </section>

        {plan.caveat && (
          <section className="card-alt flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-caption text-text-dim">{plan.caveat}</p>
          </section>
        )}

        <div className="space-y-3">
          {plan.days.map((day) => (
            <section key={day.day} className="card">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-lo text-caption font-bold text-accent-hi">
                  {day.day}
                </span>
                <div className="flex-1">
                  <h3 className="text-h3">{day.title}</h3>
                  <p className="text-caption text-text-faint">{day.focus}</p>
                </div>
              </div>
              <div className="space-y-2">
                {day.exercises.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(`/log?arm=right&vector=${ex.vector}&handle=${ex.handle}&pulley=${ex.pulley}`)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-surfaceAlt p-3 text-left transition-all active:scale-[0.98] hover:border-borderStrong"
                  >
                    <Dumbbell size={16} className="shrink-0 text-accent" />
                    <div className="flex-1">
                      <p className="text-body font-semibold">{VECTOR_LABEL[ex.vector]}</p>
                      <p className="text-caption text-text-dim">
                        {ex.sets}×{ex.reps} · {HANDLE_LABEL[ex.handle]} · {PULLEY_LABEL[ex.pulley]}
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-text-faint" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <button type="button" onClick={() => navigate('/log')} className="btn-primary w-full">
          <Calendar size={18} /> Start training
        </button>
      </div>
    </div>
  );
}
