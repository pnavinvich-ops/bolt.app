import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { listAppKeys, readJSON } from '@/storage/storage';

export async function currentUser(): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id } : null;
}

const LAST_SYNC_KEY = 'lastCloudSync';

/** Snapshot every armlog:* store into the signed-in user's backup row. */
export async function pushBackup(): Promise<number> {
  const user = await currentUser();
  if (!user || !isSupabaseConfigured) throw new Error('auth');
  const keys = listAppKeys();
  const data: Record<string, unknown> = {};
  for (const k of keys) data[k] = readJSON(k);
  const { error } = await supabase.from('user_backups').upsert({
    user_id: user.id,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  localStorage.setItem('armlog:' + LAST_SYNC_KEY, JSON.stringify(Date.now()));
  return keys.length;
}

/** Restore the newest backup into local storage. Returns number of stores restored. */
export async function pullBackup(): Promise<number> {
  const user = await currentUser();
  if (!user || !isSupabaseConfigured) throw new Error('auth');
  const { data: row, error } = await supabase
    .from('user_backups')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!row?.data || typeof row.data !== 'object') throw new Error('empty');
  let count = 0;
  for (const [k, v] of Object.entries(row.data as Record<string, unknown>)) {
    localStorage.setItem('armlog:' + k, JSON.stringify(v));
    count += 1;
  }
  localStorage.setItem('armlog:' + LAST_SYNC_KEY, JSON.stringify(Date.now()));
  return count;
}

export function getLastSync(): number | null {
  try {
    const raw = localStorage.getItem('armlog:' + LAST_SYNC_KEY);
    return raw ? parseInt(raw) : null;
  } catch {
    return null;
  }
}
