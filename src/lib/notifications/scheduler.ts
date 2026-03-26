import { checkStreakRisk } from "./streak-risk";
import { checkPRProximity } from "./pr-proximity";
import { getNotificationPreferences } from "./preferences";
import db from "@/lib/db";

// ============================================================
// Types
// ============================================================

export type NotificationType =
  | "streak_warning"
  | "pr_alert"
  | "weekly_digest"
  | "training_reminder";

export interface QueuedNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
  url?: string;
  data?: Record<string, unknown>;
}

// ============================================================
// Constants
// ============================================================

const NOTIFICATION_STORAGE_KEY = "setflow-notifications";
const MAX_NOTIFICATIONS = 50;

// ============================================================
// Quiet Hours
// ============================================================

/**
 * Check if current time falls within quiet hours.
 * Quiet hours span across midnight (e.g., 22:00 - 07:00).
 */
export function isQuietHours(
  quietStart: string,
  quietEnd: string,
  now: Date = new Date()
): boolean {
  const [startH, startM] = quietStart.split(":").map(Number);
  const [endH, endM] = quietEnd.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Spans midnight: e.g., 22:00 - 07:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  // Same day range: e.g., 13:00 - 14:00
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// ============================================================
// Notification Storage (IndexedDB-backed via localStorage fallback)
// ============================================================

const VALID_TYPES: NotificationType[] = ['streak_warning', 'pr_alert', 'weekly_digest', 'training_reminder'];

function getStoredNotifications(): QueuedNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n: Record<string, unknown>) => {
      if (!n || typeof n.type !== 'string' || typeof n.title !== 'string' || typeof n.id !== 'string') return false;
      if (!VALID_TYPES.includes(n.type as NotificationType)) return false;
      if (n.url && (typeof n.url !== 'string' || n.url.startsWith('javascript:') || n.url.startsWith('data:'))) return false;
      return true;
    });
  } catch {
    return [];
  }
}

function saveNotifications(notifications: QueuedNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only the most recent notifications
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

// ============================================================
// Queue Operations
// ============================================================

export function queueNotification(
  notification: Omit<QueuedNotification, "id" | "createdAt" | "read" | "dismissed">
): QueuedNotification {
  const stored = getStoredNotifications();

  const newNotification: QueuedNotification = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
    dismissed: false,
  };

  // Prepend new notification (newest first)
  stored.unshift(newNotification);
  saveNotifications(stored);

  return newNotification;
}

export function getNotifications(): QueuedNotification[] {
  return getStoredNotifications().filter((n) => !n.dismissed);
}

export function getUnreadCount(): number {
  return getStoredNotifications().filter((n) => !n.read && !n.dismissed).length;
}

export function markAsRead(notificationId: string): void {
  const stored = getStoredNotifications();
  const idx = stored.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    stored[idx].read = true;
    saveNotifications(stored);
  }
}

export function markAllAsRead(): void {
  const stored = getStoredNotifications();
  for (const n of stored) {
    n.read = true;
  }
  saveNotifications(stored);
}

export function dismissNotification(notificationId: string): void {
  const stored = getStoredNotifications();
  const idx = stored.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    stored[idx].dismissed = true;
    saveNotifications(stored);
  }
}

export function dismissAll(): void {
  const stored = getStoredNotifications();
  for (const n of stored) {
    n.dismissed = true;
  }
  saveNotifications(stored);
}

// ============================================================
// Scheduler: Streak Risk Check
// ============================================================

/**
 * Check if the user's streak is at risk and queue a warning notification.
 * Should be called once per day (e.g., on app open or via interval).
 */
export async function checkAndQueueStreakWarning(): Promise<QueuedNotification | null> {
  const prefs = await getNotificationPreferences();
  if (!prefs.streakProtection) return null;

  // Respect quiet hours
  if (isQuietHours(prefs.quietStart, prefs.quietEnd)) return null;

  const streakResult = await checkStreakRisk();
  if (!streakResult.atRisk || streakResult.currentStreak === 0) return null;

  // Avoid duplicate streak warnings on the same day
  const existing = getStoredNotifications();
  const today = new Date().toISOString().split("T")[0];
  const alreadySent = existing.some(
    (n) =>
      n.type === "streak_warning" &&
      n.createdAt.startsWith(today) &&
      !n.dismissed
  );
  if (alreadySent) return null;

  const hoursLeft = streakResult.hoursUntilBreak;
  const streakDays = streakResult.currentStreak;

  return queueNotification({
    type: "streak_warning",
    title: `${streakDays}-day streak at risk!`,
    body:
      hoursLeft <= 6
        ? `Only ${hoursLeft.toFixed(0)}h left. Train now to keep your streak alive.`
        : `Train today to protect your ${streakDays}-day streak.`,
    url: "/",
    data: {
      currentStreak: streakDays,
      hoursUntilBreak: hoursLeft,
    },
  });
}

// ============================================================
// Scheduler: PR Proximity Check
// ============================================================

/**
 * Check recent exercises for PR proximity and queue alerts.
 * Should be called after a workout is completed.
 */
export async function checkAndQueuePRAlerts(): Promise<QueuedNotification[]> {
  const prefs = await getNotificationPreferences();
  if (!prefs.prAlerts) return [];

  // Respect quiet hours
  if (isQuietHours(prefs.quietStart, prefs.quietEnd)) return [];

  // Get recent workout logs to check exercises
  const recentLogs = await db.workoutLogs
    .orderBy("date")
    .reverse()
    .limit(1)
    .toArray();

  if (recentLogs.length === 0) return [];

  const lastWorkout = recentLogs[0];
  if (!lastWorkout.isComplete) return [];

  const queued: QueuedNotification[] = [];
  const checkedExercises = new Set<string>();

  for (const set of lastWorkout.sets) {
    if (checkedExercises.has(set.exerciseId)) continue;
    checkedExercises.add(set.exerciseId);

    if (!set.isComplete || set.weight === 0) continue;

    const result = await checkPRProximity(
      set.exerciseId,
      set.weight,
      set.actualReps
    );

    if (result.isClose && result.percentAway > 0) {
      const gapKg = ((result.percentAway / 100) * result.prWeight).toFixed(1);
      const notification = queueNotification({
        type: "pr_alert",
        title: `PR within reach!`,
        body: `${set.exerciseName} - ${gapKg}kg away from your ${result.prWeight}kg PR. Go for it next session!`,
        url: "/",
        data: {
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName,
          currentWeight: set.weight,
          prWeight: result.prWeight,
          percentAway: result.percentAway,
        },
      });
      queued.push(notification);
    }
  }

  return queued;
}

// ============================================================
// Scheduler: Training Reminder Check
// ============================================================

/**
 * Check if today is a training day and queue a reminder.
 * Should be called once per day (e.g., on app open).
 */
export async function checkAndQueueTrainingReminder(): Promise<QueuedNotification | null> {
  const prefs = await getNotificationPreferences();
  if (!prefs.trainingReminders) return null;

  // Respect quiet hours
  if (isQuietHours(prefs.quietStart, prefs.quietEnd)) return null;

  const now = new Date();
  const today = now.getDay(); // 0=Sun, 1=Mon...

  if (!prefs.trainingDays.includes(today)) return null;

  // Avoid duplicate training reminders on the same day
  const existing = getStoredNotifications();
  const todayStr = now.toISOString().split("T")[0];
  const alreadySent = existing.some(
    (n) =>
      n.type === "training_reminder" &&
      n.createdAt.startsWith(todayStr) &&
      !n.dismissed
  );
  if (alreadySent) return null;

  // Check if user already worked out today
  const todayLogs = await db.workoutLogs
    .where("date")
    .equals(todayStr)
    .toArray();
  const alreadyWorkedOut = todayLogs.some((l) => l.isComplete);
  if (alreadyWorkedOut) return null;

  return queueNotification({
    type: "training_reminder",
    title: "Time to train",
    body: "Today is a training day. Let's get after it!",
    url: "/",
  });
}

// ============================================================
// Run All Checks
// ============================================================

/**
 * Run all scheduled notification checks.
 * Call on app open or at a regular interval.
 */
export async function runScheduledChecks(): Promise<void> {
  await Promise.allSettled([
    checkAndQueueStreakWarning(),
    checkAndQueueTrainingReminder(),
  ]);
}
