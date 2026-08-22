import { create } from 'zustand';
import type { Arm, Vector, Handle, Pulley, Mode } from '@/types/domain';
import { readJSON, writeJSON } from '@/storage/storage';
import { uid } from '@/types/constants';

export interface LogPreset {
  id: string;
  arm: Arm;
  vector: Vector;
  handle: Handle;
  pulley: Pulley;
  mode: Mode;
}

const KEY = 'presets';

interface PresetsState {
  presets: LogPreset[];
  hydrated: boolean;
  hydrate: () => void;
  addPreset: (p: Omit<LogPreset, 'id'>) => void;
  removePreset: (id: string) => void;
}

export const usePresets = create<PresetsState>((set, get) => ({
  presets: [],
  hydrated: false,
  hydrate: () => {
    set({ presets: readJSON<LogPreset[]>(KEY) ?? [], hydrated: true });
  },
  addPreset: (input) => {
    const exists = get().presets.some(
      (p) =>
        p.arm === input.arm &&
        p.vector === input.vector &&
        p.handle === input.handle &&
        p.pulley === input.pulley &&
        p.mode === input.mode,
    );
    if (exists) return;
    const preset: LogPreset = { id: uid('preset'), ...input };
    const next = [preset, ...get().presets].slice(0, 12);
    writeJSON(KEY, next);
    set({ presets: next });
  },
  removePreset: (id) => {
    const next = get().presets.filter((p) => p.id !== id);
    writeJSON(KEY, next);
    set({ presets: next });
  },
}));
