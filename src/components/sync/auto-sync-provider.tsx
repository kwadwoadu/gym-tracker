"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { SyncState } from "dexie-cloud-addon";
import db from "@/lib/db";

type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

interface SyncContextValue {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
  isOnline: boolean;
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    // Subscribe to Dexie Cloud sync state
    const subscription = db.cloud.syncState.subscribe((state: SyncState) => {
      console.log("[Dexie Cloud] Sync state:", state.phase, state.status);

      switch (state.phase) {
        case "pushing":
        case "pulling":
          setSyncStatus("syncing");
          setSyncError(null);
          break;
        case "in-sync":
          setSyncStatus("success");
          setSyncError(null);
          const now = new Date().toISOString();
          setLastSyncedAt(now);
          localStorage.setItem("setflow-last-synced-at", now);
          // Reset to idle after brief success indicator
          setTimeout(() => setSyncStatus("idle"), 2000);
          break;
        case "error":
          setSyncStatus("error");
          setSyncError(state.error?.message || "Sync failed");
          break;
        case "offline":
          setSyncStatus("offline");
          break;
        case "not-in-sync":
        case "initial":
        default:
          if (!navigator.onLine) {
            setSyncStatus("offline");
          } else {
            setSyncStatus("idle");
          }
      }
    });

    // Load last synced time from localStorage
    const stored = localStorage.getItem("setflow-last-synced-at");
    if (stored) {
      setLastSyncedAt(stored);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      subscription.unsubscribe();
    };
  }, []);

  const value: SyncContextValue = {
    syncStatus,
    lastSyncedAt,
    syncError,
    isOnline,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
