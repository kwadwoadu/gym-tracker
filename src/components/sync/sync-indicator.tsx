"use client";

import { Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import { useSyncStatus } from "./auto-sync-provider";

export function SyncIndicator() {
  const { syncStatus, syncError, triggerSync } = useSyncStatus();

  const handleClick = () => {
    if (syncStatus !== "syncing") {
      triggerSync();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={syncStatus === "syncing"}
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      title={syncError || (syncStatus === "error" ? "Sync failed - tap to retry" : "Sync status")}
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
