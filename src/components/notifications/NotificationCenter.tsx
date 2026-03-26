"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Flame,
  Trophy,
  Calendar,
  BarChart3,
  Check,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  dismissAll,
  runScheduledChecks,
  type QueuedNotification,
  type NotificationType,
} from "@/lib/notifications/scheduler";

// ============================================================
// Notification Type Config
// ============================================================

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; label: string }
> = {
  streak_warning: {
    icon: Flame,
    color: "#F59E0B",
    label: "Streak Warning",
  },
  pr_alert: {
    icon: Trophy,
    color: "#22C55E",
    label: "PR Alert",
  },
  weekly_digest: {
    icon: BarChart3,
    color: "#CDFF00",
    label: "Weekly Digest",
  },
  training_reminder: {
    icon: Calendar,
    color: "#3B82F6",
    label: "Training Reminder",
  },
};

// ============================================================
// Time Formatting
// ============================================================

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================
// Notification Item
// ============================================================

function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: QueuedNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
        notification.read ? "bg-[#1A1A1A]/50" : "bg-[#1A1A1A]"
      }`}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!notification.read) onRead(notification.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !notification.read) onRead(notification.id);
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium truncate ${
              notification.read ? "text-white/50" : "text-white"
            }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-[#CDFF00] flex-shrink-0" />
          )}
        </div>
        <p
          className={`text-xs mt-0.5 line-clamp-2 ${
            notification.read ? "text-white/30" : "text-white/50"
          }`}
        >
          {notification.body}
        </p>
        <p className="text-[10px] text-white/20 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Bell className="w-6 h-6 text-white/20" />
      </div>
      <p className="text-sm font-medium text-white/40">No notifications</p>
      <p className="text-xs text-white/20 mt-1 text-center">
        Streak warnings, PR alerts, and digests will appear here
      </p>
    </div>
  );
}

// ============================================================
// NotificationCenter (exported)
// ============================================================

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<QueuedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refresh notification data from storage
  const refresh = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  // Run scheduled checks on mount + refresh
  useEffect(() => {
    runScheduledChecks().then(refresh);
  }, [refresh]);

  // Refresh when drawer opens
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // Poll for updates every 60s while app is open (skip when tab hidden)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      refresh();
    }, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleRead = useCallback(
    (id: string) => {
      markAsRead(id);
      refresh();
    },
    [refresh]
  );

  const handleDismiss = useCallback(
    (id: string) => {
      dismissNotification(id);
      refresh();
    },
    [refresh]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
    refresh();
  }, [refresh]);

  const handleDismissAll = useCallback(() => {
    dismissAll();
    refresh();
  }, [refresh]);

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#CDFF00] flex items-center justify-center px-1">
            <span className="text-[10px] font-bold text-black leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notification Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-[#0A0A0A] border-[#2A2A2A] max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold text-white">
                Notifications
              </DrawerTitle>
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-[#CDFF00] font-medium px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Read all
                    </button>
                  )}
                  <button
                    onClick={handleDismissAll}
                    className="text-xs text-white/30 font-medium px-2 py-1 rounded-md hover:bg-white/5 hover:text-white/50 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </DrawerHeader>

          <div className="px-4 pb-8 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={handleRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
