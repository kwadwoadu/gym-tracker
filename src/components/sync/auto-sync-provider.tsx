"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

interface SyncContextValue {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
  isOnline: boolean;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncStatus() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncStatus must be used within AutoSyncProvider");
  }
  return context;
}

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Track online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("idle");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setSyncStatus("offline");
    }

    // Load last synced time from localStorage
    const stored = localStorage.getItem("setflow-last-synced-at");
    if (stored) {
      setLastSyncedAt(stored);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // With server-based architecture, sync is handled by React Query
  // This is just a placeholder for UI compatibility
  const triggerSync = async () => {
    if (syncStatus === "syncing" || !isOnline) return;

    setSyncStatus("syncing");
    setSyncError(null);

    try {
      // React Query handles data fetching automatically
      // Just update the last synced timestamp
      const now = new Date().toISOString();
      setLastSyncedAt(now);
      localStorage.setItem("setflow-last-synced-at", now);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : "Sync failed");
    }
  };

  const value: SyncContextValue = {
    syncStatus,
    lastSyncedAt,
    syncError,
    isOnline,
    triggerSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
