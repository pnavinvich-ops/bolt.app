import { create } from 'zustand';
import type { GymLog } from '@/types/domain';
import { readJSON, writeJSON, removeKey } from '@/storage/storage';
import { uid } from '@/types/constants';

const KEY = 'gymLogs';

interface GymState {
  logs: GymLog[];
  hydrated: boolean;
  hydrate: () => void;
  addLog: (l: Omit<GymLog, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => GymLog;
  removeLog: (id: string) => void;
  clearAll: () => void;
}

export const useGym = create<GymState>((set) => ({
  logs: [],
  hydrated: false,
  hydrate: () => {
    set({ logs: readJSON<GymLog[]>(KEY) ?? [], hydrated: true });
  },
  addLog: (input) => {
    const log: GymLog = {
      id: input.id ?? uid('gym'),
      createdAt: input.createdAt ?? Date.now(),
      exerciseKey: input.exerciseKey,
      sets: input.sets,
      notes: input.notes,
    };
    set((s) => {
      const next = [log, ...s.logs];
      writeJSON(KEY, next);
      return { logs: next };
    });
    return log;
  },
  removeLog: (id) => {
    set((s) => {
      const next = s.logs.filter((l) => l.id !== id);
      writeJSON(KEY, next);
      return { logs: next };
    });
  },
  clearAll: () => {
    removeKey(KEY);
    set({ logs: [] });
  },
}));
