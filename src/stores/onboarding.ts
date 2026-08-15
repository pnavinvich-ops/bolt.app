import { create } from 'zustand';
import type { OnboardingProfile, TrainingPlan } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { generatePlan } from '@/services/planGenerator';

const KEY = 'onboarding';

interface OnboardingState {
  profile: OnboardingProfile | null;
  plan: TrainingPlan | null;
  planUnlocked: boolean;
  onboardingCompleted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setProfile: (p: OnboardingProfile) => void;
  unlock: () => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  profile: null,
  plan: null,
  planUnlocked: false,
  onboardingCompleted: false,
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<{
      profile: OnboardingProfile | null;
      planUnlocked: boolean;
      onboardingCompleted: boolean;
    }>(KEY);
    if (stored) {
      const plan = stored.profile ? generatePlan(stored.profile) : null;
      set({
        profile: stored.profile,
        plan,
        planUnlocked: stored.planUnlocked ?? false,
        onboardingCompleted: stored.onboardingCompleted ?? false,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },
  setProfile: (p) => {
    const plan = generatePlan(p);
    set({ profile: p, plan, onboardingCompleted: true });
    writeJSON(KEY, {
      profile: p,
      planUnlocked: useOnboarding.getState().planUnlocked,
      onboardingCompleted: true,
    });
  },
  unlock: () => {
    set({ planUnlocked: true });
    const s = useOnboarding.getState();
    writeJSON(KEY, {
      profile: s.profile,
      planUnlocked: true,
      onboardingCompleted: s.onboardingCompleted,
    });
  },
  complete: () => {
    set({ onboardingCompleted: true });
    const s = useOnboarding.getState();
    writeJSON(KEY, {
      profile: s.profile,
      planUnlocked: s.planUnlocked,
      onboardingCompleted: true,
    });
  },
  reset: () => {
    removeKey(KEY);
    set({ profile: null, plan: null, planUnlocked: false, onboardingCompleted: false });
  },
}));
