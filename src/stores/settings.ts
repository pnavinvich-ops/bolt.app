import { create } from 'zustand';
import type { Settings } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';

const KEY = 'settings';

const DEFAULT: Settings = {
  unit: 'kg',
};

interface SettingsState {
  settings: Settings;
  hydrated: boolean;
  hydrate: () => void;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>((set) => ({
  settings: DEFAULT,
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<Settings>(KEY);
    set({ settings: { ...DEFAULT, ...stored }, hydrated: true });
  },
  update: (patch) => {
    set((s) => {
      const next = { ...s.settings, ...patch };
      writeJSON(KEY, next);
      return { settings: next };
    });
  },
  reset: () => {
    removeKey(KEY);
    set({ settings: DEFAULT });
  },
}));
