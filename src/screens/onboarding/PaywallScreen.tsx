import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '@/stores/onboarding';
import { useProfileSummary } from '@/lib/profileText';

export default function PaywallScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const describeProfile = useProfileSummary();
  const profile = useOnboarding((s) => s.profile);
  const unlock = useOnboarding((s) => s.unlock);
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
      unlock();
      navigate('/onboarding/plan');
    }, 900);
  };

  if (!profile) {
    navigate('/onboarding/quiz');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/30 bg-accent-lo animate-pop">
            <Sparkles size={36} className="text-accent" />
          </div>
        </div>

        <h1 className="mb-2 text-h1">{t('onboarding.paywallTitle')}</h1>
        <p className="mb-6 text-body text-text-dim">
          {t('onboarding.paywallBody')}
        </p>

        <div className="mb-6 rounded-lg border border-border bg-surfaceAlt p-4 text-left">
          <p className="label mb-2">{t('onboarding.yourProfile')}</p>
          <p className="text-body text-text">{describeProfile(profile)}</p>
        </div>

        <div className="mb-8 space-y-2 text-left">
          {[
            t('onboarding.featWorkouts', { count: profile.sessionsPerWeek }),
            t('onboarding.featVectors'),
            t('onboarding.featVolume'),
            profile.tendonStatus !== 'healthy' ? t('onboarding.featCaveat') : t('onboarding.featOverload'),
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2">
              <Check size={16} className="text-ok" />
              <span className="text-body text-text-dim">{feat}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleUnlock} disabled={unlocking} className="btn-primary w-full">
          {unlocking ? (
            <><Lock size={18} className="animate-pulse" /> {t('onboarding.unlocking')}</>
          ) : (
            <><Sparkles size={18} /> {t('onboarding.unlock')} <ChevronRight size={18} /></>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/log')}
          className="mt-4 text-caption text-text-faint transition-colors hover:text-text-dim"
        >
          {t('onboarding.maybeLater')}
        </button>
      </div>
    </div>
  );
}
