import { create } from 'zustand';
import type { SparringSession } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid } from '@/types/constants';

const KEY = 'sparring';

interface SparringState {
  sessions: SparringSession[];
  hydrated: boolean;
  hydrate: () => void;
  addSession: (s: Omit<SparringSession, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => SparringSession;
  removeSession: (id: string) => void;
  clearAll: () => void;
}

export const useSparring = create<SparringState>((set) => ({
  sessions: [],
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<SparringSession[]>(KEY);
    set({ sessions: stored ?? [], hydrated: true });
  },
  addSession: (input) => {
    const session: SparringSession = {
      id: input.id ?? uid('spar'),
      createdAt: input.createdAt ?? Date.now(),
      opponent: input.opponent,
      opponentStyle: input.opponentStyle,
      myStyles: input.myStyles,
      outcome: input.outcome,
      notes: input.notes,
    };
    set((s) => {
      const next = [session, ...s.sessions];
      writeJSON(KEY, next);
      return { sessions: next };
    });
    return session;
  },
  removeSession: (id) => {
    set((s) => {
      const next = s.sessions.filter((x) => x.id !== id);
      writeJSON(KEY, next);
      return { sessions: next };
    });
  },
  clearAll: () => {
    removeKey(KEY);
    set({ sessions: [] });
  },
}));
