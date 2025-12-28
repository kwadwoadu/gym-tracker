"use client";

import { useState } from "react";
import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, CloudOff, RefreshCw, LogIn, LogOut, Check, AlertCircle } from "lucide-react";
import { fullSync } from "@/lib/sync";

export function SyncButton() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!isSignedIn) return;

    setIsSyncing(true);
    setSyncStatus("idle");
    setSyncError(null);

    const result = await fullSync(user?.primaryEmailAddress?.emailAddress);

    setIsSyncing(false);
    if (result.success) {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else {
      setSyncStatus("error");
      setSyncError(result.error || "Sync failed");
    }
  };

  if (!isLoaded) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-3 mb-4">
        {isSignedIn ? (
          <Cloud className="w-5 h-5 text-primary" />
        ) : (
          <CloudOff className="w-5 h-5 text-muted-foreground" />
        )}
        <h3 className="font-semibold text-foreground">Cloud Sync</h3>
      </div>

      {isSignedIn ? (
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

          {/* Sync button */}
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : syncStatus === "success" ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Synced!
              </>
            ) : syncStatus === "error" ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                Sync Failed
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          {syncError && (
            <p className="text-xs text-red-500 text-center">{syncError}</p>
          )}

          {/* Sign out */}
          <SignOutButton>
            <Button variant="ghost" className="w-full text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in to sync your workouts across devices and never lose your progress.
          </p>

          <SignInButton mode="modal">
            <Button className="w-full h-12 bg-primary text-primary-foreground">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Enable Sync
            </Button>
          </SignInButton>
        </div>
      )}
    </Card>
  );
}
