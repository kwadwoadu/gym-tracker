"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { fullSync } from "@/lib/sync";

type SyncStatus = "idle" | "syncing" | "success" | "error";

interface SyncContextValue {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
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

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MIN_SYNC_GAP = 60 * 1000; // 1 minute minimum between syncs

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hasSyncedOnLoginRef = useRef(false);
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);

  const performSync = useCallback(async () => {
    // Prevent concurrent syncs
    if (isSyncingRef.current) return;

    // Prevent syncing too frequently
    const now = Date.now();
    if (now - lastSyncTimeRef.current < MIN_SYNC_GAP) return;

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    isSyncingRef.current = true;
    lastSyncTimeRef.current = now;
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const result = await fullSync(email);

      if (result.success) {
        setSyncStatus("success");
        const syncTime = new Date().toISOString();
        setLastSyncedAt(syncTime);
        localStorage.setItem("setflow-last-synced-at", syncTime);
        // Reset to idle after a brief success indicator
        setTimeout(() => setSyncStatus("idle"), 2000);
      } else {
        setSyncStatus("error");
        setSyncError(result.error || "Sync failed");
      }
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : "Sync failed");
    } finally {
      isSyncingRef.current = false;
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  // Sync on initial sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.primaryEmailAddress && !hasSyncedOnLoginRef.current) {
      hasSyncedOnLoginRef.current = true;
      // Small delay to ensure everything is ready
      setTimeout(performSync, 500);
    }

    // Reset the flag when user signs out
    if (isLoaded && !isSignedIn) {
      hasSyncedOnLoginRef.current = false;
    }
  }, [isLoaded, isSignedIn, user?.primaryEmailAddress, performSync]);

  // Periodic sync every 5 minutes
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(() => {
      performSync();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isSignedIn, performSync]);

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    if (!isSignedIn) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Only sync if enough time has passed
        const now = Date.now();
        if (now - lastSyncTimeRef.current >= MIN_SYNC_GAP) {
          performSync();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSignedIn, performSync]);

  // Load last synced time from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("setflow-last-synced-at");
    if (stored) {
      setLastSyncedAt(stored);
    }
  }, []);

  const value: SyncContextValue = {
    syncStatus,
    lastSyncedAt,
    syncError,
    triggerSync: performSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
