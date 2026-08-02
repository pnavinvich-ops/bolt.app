import { create } from 'zustand';
import type { Lift } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid } from '@/types/constants';

const KEY = 'lifts';

interface LiftState {
  lifts: Lift[];
  hydrated: boolean;
  hydrate: () => void;
  addLift: (lift: Omit<Lift, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => Lift;
  updateLift: (id: string, patch: Partial<Lift>) => void;
  removeLift: (id: string) => void;
  getLift: (id: string) => Lift | undefined;
  clearAll: () => void;
}

export const useLifts = create<LiftState>((set, get) => ({
  lifts: [],
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<Lift[]>(KEY);
    set({ lifts: stored ?? [], hydrated: true });
  },
  addLift: (input) => {
    const lift: Lift = {
      id: input.id ?? uid('lift'),
      createdAt: input.createdAt ?? Date.now(),
      arm: input.arm,
      vector: input.vector,
      handle: input.handle,
      pulley: input.pulley,
      mode: input.mode,
      sets: input.sets,
      notes: input.notes,
    };
    set((s) => {
      const next = [lift, ...s.lifts];
      writeJSON(KEY, next);
      return { lifts: next };
    });
    return lift;
  },
  updateLift: (id, patch) => {
    set((s) => {
      const next = s.lifts.map((l) => (l.id === id ? { ...l, ...patch } : l));
      writeJSON(KEY, next);
      return { lifts: next };
    });
  },
  removeLift: (id) => {
    set((s) => {
      const next = s.lifts.filter((l) => l.id !== id);
      writeJSON(KEY, next);
      return { lifts: next };
    });
  },
  getLift: (id) => get().lifts.find((l) => l.id === id),
  clearAll: () => {
    removeKey(KEY);
    set({ lifts: [] });
  },
}));
