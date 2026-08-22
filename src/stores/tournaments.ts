import { create } from 'zustand';
import type { Tournament } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid } from '@/types/constants';

const KEY = 'tournaments';

interface TournamentsState {
  tournaments: Tournament[];
  hydrated: boolean;
  hydrate: () => void;
  addTournament: (t: Omit<Tournament, 'id' | 'createdAt'> & { id?: string }) => Tournament;
  updateTournament: (id: string, patch: Partial<Tournament>) => void;
  removeTournament: (id: string) => void;
  nextUpcoming: () => Tournament | null;
  clearAll: () => void;
}

export const useTournaments = create<TournamentsState>((set, get) => ({
  tournaments: [],
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<Tournament[]>(KEY);
    set({
      tournaments: (stored ?? []).sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
      hydrated: true,
    });
  },
  addTournament: (input) => {
    const tournament: Tournament = {
      id: input.id ?? uid('tour'),
      name: input.name.trim(),
      dateKey: input.dateKey,
      weightClass: input.weightClass,
      targetWeightKg: input.targetWeightKg,
      createdAt: Date.now(),
    };
    set((s) => {
      const next = [tournament, ...s.tournaments].sort((a, b) =>
        a.dateKey.localeCompare(b.dateKey),
      );
      writeJSON(KEY, next);
      return { tournaments: next };
    });
    return tournament;
  },
  updateTournament: (id, patch) => {
    set((s) => {
      const next = s.tournaments
        .map((t) => (t.id === id ? { ...t, ...patch } : t))
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      writeJSON(KEY, next);
      return { tournaments: next };
    });
  },
  removeTournament: (id) => {
    set((s) => {
      const next = s.tournaments.filter((t) => t.id !== id);
      writeJSON(KEY, next);
      return { tournaments: next };
    });
  },
  nextUpcoming: () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
    return (
      get().tournaments
        .filter((t) => t.dateKey >= key)
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey))[0] ?? null
    );
  },
  clearAll: () => {
    removeKey(KEY);
    set({ tournaments: [] });
  },
}));
