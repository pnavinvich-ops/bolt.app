import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';
import { readJSON, writeJSON } from '@/storage/storage';

export interface ReminderConfig {
  tendonOn: boolean;
  tendonTime: string; // 'HH:MM'
  workoutsOn: boolean;
  workoutTime: string; // 'HH:MM'
  /** ISO weekdays, 1 = Monday … 7 = Sunday */
  days: number[];
}

export const DEFAULT_REMINDERS: ReminderConfig = {
  tendonOn: false,
  tendonTime: '20:00',
  workoutsOn: false,
  workoutTime: '18:00',
  days: [1, 3, 5],
};

const KEY = 'reminders';

export function loadReminders(): ReminderConfig {
  return { ...DEFAULT_REMINDERS, ...(readJSON<Partial<ReminderConfig>>(KEY) ?? {}) };
}

function save(cfg: ReminderConfig) {
  writeJSON(KEY, cfg);
}

const TENDON_ID = 1001;
const WORKOUT_ID_BASE = 2000;

/** Capacitor weekday numbers follow java.util.Calendar: Sunday = 1 … Saturday = 7. */
function toCalendarWeekday(isoMon1: number): number {
  return isoMon1 === 7 ? 1 : isoMon1 + 1;
}

function atTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x));
  return { hour: h || 20, minute: m || 0 };
}

export type ReminderResult = 'ok' | 'denied' | 'unsupported';

export async function applyReminders(
  cfg: ReminderConfig,
  texts: { tendonTitle: string; tendonBody: string; workoutTitle: string; workoutBody: string },
): Promise<ReminderResult> {
  save(cfg);
  if (!Capacitor.isNativePlatform()) return 'unsupported';

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') {
    const req = await LocalNotifications.requestPermissions();
    if (req.display !== 'granted') return 'denied';
  }

  // Cancel our previous schedules
  const pending = await LocalNotifications.getPending();
  const ours = pending.notifications.filter(
    (n) => n.id === TENDON_ID || (n.id >= WORKOUT_ID_BASE && n.id < WORKOUT_ID_BASE + 10),
  );
  if (ours.length > 0) {
    await LocalNotifications.cancel({
      notifications: ours.map((n) => ({ id: n.id })),
    });
  }

  const notifications: LocalNotificationSchema[] = [];
  if (cfg.tendonOn) {
    const t = atTime(cfg.tendonTime);
    notifications.push({
      id: TENDON_ID,
      title: texts.tendonTitle,
      body: texts.tendonBody,
      schedule: { on: { ...t }, repeats: true, allowWhileIdle: true },
    } as never);
  }
  if (cfg.workoutsOn && cfg.days.length > 0) {
    const t = atTime(cfg.workoutTime);
    for (const day of cfg.days) {
      notifications.push({
        id: WORKOUT_ID_BASE + day,
        title: texts.workoutTitle,
        body: texts.workoutBody,
        schedule: { on: { ...t, weekday: toCalendarWeekday(day) }, repeats: true, allowWhileIdle: true },
      } as never);
    }
  }
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
  return 'ok';
}
