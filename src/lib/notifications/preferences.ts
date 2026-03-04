import db, { type NotificationPreference } from "@/lib/db";

const DEFAULT_PREFERENCES: NotificationPreference = {
  id: "notification-prefs",
  trainingReminders: true,
  trainingDays: [1, 3, 5], // Mon, Wed, Fri
  reminderTime: "07:30",
  streakProtection: true,
  prAlerts: true,
  streakCelebrations: true,
  weeklyDigestPush: true,
  quietStart: "22:00",
  quietEnd: "07:00",
  pushEnabled: false,
  updatedAt: new Date().toISOString(),
};

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  const prefs = await db.notificationPreferences.get("notification-prefs");
  return prefs || DEFAULT_PREFERENCES;
}

export async function updateNotificationPreferences(
  updates: Partial<NotificationPreference>
): Promise<void> {
  const current = await getNotificationPreferences();
  await db.notificationPreferences.put({
    ...current,
    ...updates,
    id: "notification-prefs",
    updatedAt: new Date().toISOString(),
  });
}
