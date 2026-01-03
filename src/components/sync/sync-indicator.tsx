"use client";

import { Cloud, CloudOff, RefreshCw, Check, WifiOff } from "lucide-react";
import { useSyncStatus } from "./auto-sync-provider";
import db from "@/lib/db";

export function SyncIndicator() {
  const { syncStatus, syncError, isOnline } = useSyncStatus();

  const handleClick = async () => {
    if (syncStatus !== "syncing" && isOnline) {
      // Trigger manual sync via Dexie Cloud
      try {
        await db.cloud.sync();
      } catch (error) {
        console.error("[Dexie Cloud] Manual sync failed:", error);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={syncStatus === "syncing" || !isOnline}
      className="relative p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
      title={
        !isOnline
          ? "Offline - changes saved locally"
          : syncError
          ? `Sync failed: ${syncError}`
          : syncStatus === "syncing"
          ? "Syncing..."
          : "Tap to sync"
      }
    >
      {syncStatus === "syncing" && (
        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      )}
      {syncStatus === "success" && (
        <Check className="w-5 h-5 text-green-500" />
      )}
      {syncStatus === "error" && (
        <CloudOff className="w-5 h-5 text-red-500" />
      )}
      {syncStatus === "offline" && (
        <WifiOff className="w-5 h-5 text-yellow-500" />
      )}
      {syncStatus === "idle" && (
        <Cloud className="w-5 h-5 text-muted-foreground" />
      )}

      {/* Error dot indicator */}
      {syncStatus === "error" && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
