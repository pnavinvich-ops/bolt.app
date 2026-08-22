import { create } from 'zustand';
import type { TendonCheck } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid, todayKey } from '@/types/constants';

const KEY = 'tendon';

interface TendonState {
  checks: TendonCheck[];
  hydrated: boolean;
  hydrate: () => void;
  addCheck: (c: Omit<TendonCheck, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => TendonCheck;
  removeCheck: (id: string) => void;
  hasCheckForToday: () => boolean;
  clearAll: () => void;
}

export const useTendon = create<TendonState>((set, get) => ({
  checks: [],
  hydrated: false,
  hydrate: () => {
    const stored = readJSON<TendonCheck[]>(KEY);
    set({ checks: stored ?? [], hydrated: true });
  },
  addCheck: (input) => {
    const check: TendonCheck = {
      id: input.id ?? uid('tendon'),
      createdAt: input.createdAt ?? Date.now(),
      elbow: input.elbow,
      forearm: input.forearm,
      painAreas: input.painAreas,
      notes: input.notes,
    };
    set((s) => {
      const next = [check, ...s.checks];
      writeJSON(KEY, next);
      return { checks: next };
    });
    return check;
  },
  removeCheck: (id) => {
    set((s) => {
      const next = s.checks.filter((c) => c.id !== id);
      writeJSON(KEY, next);
      return { checks: next };
    });
  },
  hasCheckForToday: () => {
    const tk = todayKey();
    return get().checks.some((c) => todayKey(c.createdAt) === tk);
  },
  clearAll: () => {
    removeKey(KEY);
    set({ checks: [] });
  },
}));
