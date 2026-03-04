"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from "@/lib/notifications/push-subscription";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications/preferences";
import type { NotificationPreference } from "@/lib/db";

export function useNotifications() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [preferences, setPreferences] =
    useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setPermission(getNotificationPermission());
      const [sub, prefs] = await Promise.all([
        getCurrentSubscription(),
        getNotificationPreferences(),
      ]);
      setSubscription(sub);
      setPreferences(prefs);
      setLoading(false);
    }
    init();
  }, []);

  const enable = useCallback(async () => {
    const sub = await subscribeToPush();
    if (sub) {
      setSubscription(sub);
      setPermission("granted");
      await updateNotificationPreferences({ pushEnabled: true });
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    }
    return !!sub;
  }, []);

  const disable = useCallback(async () => {
    await unsubscribeFromPush();
    setSubscription(null);
    await updateNotificationPreferences({ pushEnabled: false });
    const prefs = await getNotificationPreferences();
    setPreferences(prefs);
  }, []);

  const updatePrefs = useCallback(
    async (updates: Partial<NotificationPreference>) => {
      await updateNotificationPreferences(updates);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    },
    []
  );

  const isInQuietHours = useCallback(() => {
    if (!preferences) return false;
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const current = `${hh}:${mm}`;
    const { quietStart, quietEnd } = preferences;
    if (quietStart <= quietEnd) {
      return current >= quietStart && current < quietEnd;
    }
    // Spans midnight (e.g., 22:00 - 07:00)
    return current >= quietStart || current < quietEnd;
  }, [preferences]);

  return {
    supported: isPushSupported(),
    permission,
    subscription,
    preferences,
    loading,
    enable,
    disable,
    updatePrefs,
    isInQuietHours,
  };
}
