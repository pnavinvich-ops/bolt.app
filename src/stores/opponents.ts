import { create } from 'zustand';
import type { Opponent } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid } from '@/types/constants';

const KEY = 'opponents';

interface OpponentsState {
  opponents: Opponent[];
  hydrated: boolean;
  hydrate: () => void;
  addOpponent: (o: Omit<Opponent, 'id'> & { id?: string }) => Opponent;
  updateOpponent: (id: string, patch: Partial<Opponent>) => void;
  removeOpponent: (id: string) => void;
  /** Find by case-insensitive name; optionally create when missing. */
  ensureByName: (name: string) => Opponent | null;
  clearAll: () => void;
}

export const useOpponents = create<OpponentsState>((set, get) => ({
  opponents: [],
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<Opponent[]>(KEY);
    set({ opponents: stored ?? [], hydrated: true });
  },
  addOpponent: (input) => {
    const opponent: Opponent = {
      id: input.id ?? uid('opp'),
      name: input.name.trim(),
      style: input.style ?? '',
      weightClass: input.weightClass,
      handedness: input.handedness,
      notes: input.notes,
    };
    set((s) => {
      const next = [opponent, ...s.opponents];
      writeJSON(KEY, next);
      return { opponents: next };
    });
    return opponent;
  },
  updateOpponent: (id, patch) => {
    set((s) => {
      const next = s.opponents.map((o) => (o.id === id ? { ...o, ...patch } : o));
      writeJSON(KEY, next);
      return { opponents: next };
    });
  },
  removeOpponent: (id) => {
    set((s) => {
      const next = s.opponents.filter((o) => o.id !== id);
      writeJSON(KEY, next);
      return { opponents: next };
    });
  },
  ensureByName: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = get().opponents.find(
      (o) => o.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return existing;
    return get().addOpponent({ name: trimmed, style: '' });
  },
  clearAll: () => {
    removeKey(KEY);
    set({ opponents: [] });
  },
}));
