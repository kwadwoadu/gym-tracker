"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, RefreshCw, LogOut, Check, AlertCircle } from "lucide-react";
import { useSyncStatus } from "./auto-sync-provider";

function formatLastSynced(isoString: string | null): string {
  if (!isoString) return "Never";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function SyncButton() {
  const { user } = useUser();
  const { syncStatus, lastSyncedAt, syncError, triggerSync } = useSyncStatus();

  const isSyncing = syncStatus === "syncing";

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-3 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Cloud Sync</h3>
          <p className="text-xs text-muted-foreground">
            Last synced: {formatLastSynced(lastSyncedAt)}
          </p>
        </div>
        {/* Sync status indicator */}
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
          ) : syncStatus === "success" ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : syncStatus === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Check className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.fullName || user?.primaryEmailAddress?.emailAddress}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* Error message */}
        {syncError && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-500">{syncError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={triggerSync}
              className="ml-auto text-red-500 hover:text-red-400"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Sync Now button (secondary action) */}
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={triggerSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {/* Sign out */}
        <SignOutButton>
          <Button variant="ghost" className="w-full text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </Card>
  );
}
