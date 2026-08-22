import { useTranslation } from 'react-i18next';
import type { OnboardingProfile } from '@/types/domain';

export function useProfileSummary() {
  const { t } = useTranslation();
  return (p: OnboardingProfile): string => {
    const focus = p.focus.map((v) => t(`enum.vector.${v}`)).join(', ') || t('planGen.allVectors');
    const tendonKey =
      p.tendonStatus === 'healthy'
        ? 'planGen.tendonHealthy'
        : p.tendonStatus === 'managing'
          ? 'planGen.tendonManaging'
          : 'planGen.tendonRecovering';
    return t('planGen.profileSummary', {
      goal: t(`enum.goal.${p.goal}`),
      exp: t(`enum.exp.${p.experience}`),
      sessions: p.sessionsPerWeek,
      focus,
      tendon: t(tendonKey),
    });
  };
}
