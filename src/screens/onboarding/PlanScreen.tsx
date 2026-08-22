import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, ArrowRight, AlertCircle, Sparkles, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '@/stores/onboarding';
import { useTendon } from '@/stores/tendon';
import { deloadStatus, deloadVolumeFactor } from '@/services/deload';
import { useProfileSummary } from '@/lib/profileText';
import ScreenHeader from '@/components/ScreenHeader';

export default function PlanScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const describeProfile = useProfileSummary();
  const profile = useOnboarding((s) => s.profile);
  const plan = useOnboarding((s) => s.plan);
  const checks = useTendon((s) => s.checks);
  const deload = deloadStatus(checks);
  const volumeFactor = deloadVolumeFactor(deload.level);

  if (!profile || !plan) {
    navigate('/onboarding/quiz');
    return null;
  }

  const reducedSets = (sets: number) => Math.max(1, Math.round(sets * volumeFactor));

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('plan.title')} subtitle={describeProfile(profile)} backTo="/" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="card flex items-center gap-3">
          <Sparkles size={20} className="text-accent" />
          <div className="flex-1">
            <p className="text-body font-semibold">
              {t('planGen.summary', {
                sessions: plan.sessionsPerWeek,
                sets: plan.days[0]?.exercises[0]?.sets ?? '',
                reps: plan.days[0]?.exercises[0]?.reps ?? '',
                focus:
                  profile.focus.map((v) => t(`enum.vector.${v}`)).join(', ') ||
                  t('planGen.balanced'),
                weeks: plan.weeks,
              })}
            </p>
            <p className="text-caption text-text-faint">
              {t('plan.weeksSessions', { weeks: plan.weeks, sessions: plan.sessionsPerWeek })}
            </p>
          </div>
        </section>

        {plan.caveatKind && (
          <section className="card-alt flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-caption text-text-dim">{t(`planGen.caveat${plan.caveatKind === 'managing' ? 'Managing' : 'Recovering'}`)}</p>
          </section>
        )}

        {deload.level !== 'none' && (
          <section className={`flex items-start gap-3 rounded-lg border p-3 ${deload.level === 'deload' ? 'border-bad/40 bg-bad/5' : 'border-warn/30 bg-warn/5'}`}>
            <TrendingDown size={18} className={`mt-0.5 shrink-0 ${deload.level === 'deload' ? 'text-bad' : 'text-warn'}`} />
            <div>
              <p className={`text-body font-bold ${deload.level === 'deload' ? 'text-bad' : 'text-warn'}`}>
                {t(`rehab.status_${deload.level}`)}
              </p>
              <p className="text-caption text-text-dim">{t('rehab.planAdjusted', { pct: Math.round((1 - volumeFactor) * 100) })}</p>
            </div>
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
                  <h3 className="text-h3">{t(`planGen.day${day.slot}`)}</h3>
                  <p className="text-caption text-text-faint">{t(`planGen.focus${day.slot}`)}</p>
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
                      <p className="text-body font-semibold">{t(`enum.vector.${ex.vector}`)}</p>
                      <p className="text-caption text-text-dim">
                        {reducedSets(ex.sets)}×{ex.reps}
                        {volumeFactor < 1 && (
                          <span className="ml-1 text-micro text-text-faint line-through">{ex.sets}</span>
                        )}
                        {' · '}
                        {t(`enum.handle.${ex.handle}`)} · {t(`enum.pulley.${ex.pulley}`)}
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
          <Calendar size={18} /> {t('plan.startTraining')}
        </button>
      </div>
    </div>
  );
}
