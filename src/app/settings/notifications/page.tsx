"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreference } from "@/lib/db";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications/preferences";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/notifications/push-subscription";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  const load = useCallback(async () => {
    const p = await getNotificationPreferences();
    setPrefs(p);
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (updates: Partial<NotificationPreference>) => {
    await updateNotificationPreferences(updates);
    setPrefs((p) => (p ? { ...p, ...updates } : p));
  };

  const handleEnablePush = async () => {
    const sub = await subscribeToPush();
    if (sub) {
      await update({ pushEnabled: true });
      setPermission("granted");
    }
  };

  const handleDisablePush = async () => {
    await unsubscribeFromPush();
    await update({ pushEnabled: false });
  };

  const toggleDay = (day: number) => {
    if (!prefs) return;
    const days = prefs.trainingDays.includes(day)
      ? prefs.trainingDays.filter((d) => d !== day)
      : [...prefs.trainingDays, day].sort();
    update({ trainingDays: days });
  };

  if (!prefs) return null;

  const supported = isPushSupported();

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pb-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white">Notifications</h1>
      </header>

      <div className="px-4 space-y-6">
        {/* Push Status */}
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {prefs.pushEnabled && permission === "granted" ? (
                <Bell className="w-5 h-5 text-[#CDFF00]" />
              ) : (
                <BellOff className="w-5 h-5 text-white/30" />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  Push Notifications
                </p>
                <p className="text-xs text-white/40">
                  {!supported
                    ? "Not supported on this device"
                    : permission === "denied"
                    ? "Blocked - enable in browser settings"
                    : prefs.pushEnabled
                    ? "Active"
                    : "Disabled"}
                </p>
              </div>
            </div>
            {supported && permission !== "denied" && (
              <Switch
                checked={prefs.pushEnabled}
                onCheckedChange={(checked) =>
                  checked ? handleEnablePush() : handleDisablePush()
                }
              />
            )}
          </div>
        </div>

        {/* Reminders */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
            Reminders
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Training Reminders
                </p>
                <p className="text-xs text-white/40">
                  Remind me on training days
                </p>
              </div>
              <Switch
                checked={prefs.trainingReminders}
                onCheckedChange={(v) => update({ trainingReminders: v })}
              />
            </div>

            {prefs.trainingReminders && (
              <>
                <div className="bg-[#1A1A1A] rounded-xl p-4">
                  <p className="text-sm font-medium text-white mb-3">
                    Training Days
                  </p>
                  <div className="flex gap-2">
                    {DAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${
                          prefs.trainingDays.includes(i)
                            ? "bg-[#CDFF00] text-black"
                            : "bg-[#2A2A2A] text-white/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
                  <p className="text-sm font-medium text-white">
                    Reminder Time
                  </p>
                  <input
                    type="time"
                    value={prefs.reminderTime}
                    onChange={(e) => update({ reminderTime: e.target.value })}
                    className="bg-[#2A2A2A] text-white text-sm px-3 py-1.5 rounded-lg border-none outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Motivation */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
            Motivation
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Streak Protection
                </p>
                <p className="text-xs text-white/40">
                  Warn when streak is at risk
                </p>
              </div>
              <Switch
                checked={prefs.streakProtection}
                onCheckedChange={(v) => update({ streakProtection: v })}
              />
            </div>

            <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  PR Proximity Alerts
                </p>
                <p className="text-xs text-white/40">
                  Alert when close to a PR
                </p>
              </div>
              <Switch
                checked={prefs.prAlerts}
                onCheckedChange={(v) => update({ prAlerts: v })}
              />
            </div>

            <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Streak Celebrations
                </p>
                <p className="text-xs text-white/40">
                  Celebrate milestone streaks
                </p>
              </div>
              <Switch
                checked={prefs.streakCelebrations}
                onCheckedChange={(v) => update({ streakCelebrations: v })}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
            Summary
          </h3>
          <div className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4">
            <div>
              <p className="text-sm font-medium text-white">
                Weekly Digest
              </p>
              <p className="text-xs text-white/40">
                Sunday summary of your week
              </p>
            </div>
            <Switch
              checked={prefs.weeklyDigestPush}
              onCheckedChange={(v) => update({ weeklyDigestPush: v })}
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
            Quiet Hours
          </h3>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <p className="text-sm font-medium text-white mb-3">
              Do Not Disturb
            </p>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={prefs.quietStart}
                onChange={(e) => update({ quietStart: e.target.value })}
                className="bg-[#2A2A2A] text-white text-sm px-3 py-1.5 rounded-lg border-none outline-none flex-1 text-center"
              />
              <span className="text-white/30 text-sm">to</span>
              <input
                type="time"
                value={prefs.quietEnd}
                onChange={(e) => update({ quietEnd: e.target.value })}
                className="bg-[#2A2A2A] text-white text-sm px-3 py-1.5 rounded-lg border-none outline-none flex-1 text-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
