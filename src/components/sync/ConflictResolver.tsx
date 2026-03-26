"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Smartphone,
  Cloud,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export interface SyncConflict {
  id: string;
  type: "workout_logs" | "programs" | "settings" | "personal_records";
  localCount: number;
  remoteCount: number;
  localLastModified: string;
  remoteLastModified: string;
  description: string;
}

type ResolutionStrategy = "keep_local" | "keep_remote" | "keep_newest";

interface ConflictResolverProps {
  open: boolean;
  onClose: () => void;
  conflicts: SyncConflict[];
  onResolve: (strategy: ResolutionStrategy) => Promise<void>;
}

const TYPE_LABELS: Record<string, string> = {
  workout_logs: "Workout logs",
  programs: "Program changes",
  settings: "Settings",
  personal_records: "Personal records",
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

export function ConflictResolver({
  open,
  onClose,
  conflicts,
  onResolve,
}: ConflictResolverProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setResolved(false);
      setIsResolving(false);
    }
  }, [open]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleResolve = async (strategy: ResolutionStrategy) => {
    setIsResolving(true);
    try {
      await onResolve(strategy);
      setResolved(true);
      timerRef.current = setTimeout(() => {
        setResolved(false);
        onClose();
      }, 1500);
    } catch {
      setIsResolving(false);
    }
  };

  const totalConflicts = conflicts.reduce(
    (sum, c) => sum + Math.max(c.localCount, c.remoteCount),
    0
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-background border-border max-w-md p-0 gap-0">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gym-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gym-warning" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Sync Conflict Detected
              </h2>
              <p className="text-sm text-muted-foreground">
                {totalConflicts} item{totalConflicts !== 1 ? "s" : ""} differ
                between devices
              </p>
            </div>
          </div>
        </div>

        {/* Conflict summary */}
        <div className="p-5 space-y-2">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="bg-card rounded-xl p-3.5 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {TYPE_LABELS[conflict.type] || conflict.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {conflict.description}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>
                    This device: {conflict.localCount} item
                    {conflict.localCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-white/20">|</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(conflict.localLastModified)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>
                    Cloud: {conflict.remoteCount} item
                    {conflict.remoteCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-white/20">|</span>
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatRelativeTime(conflict.remoteLastModified)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resolution options */}
        <div className="p-5 pt-0 space-y-2">
          {resolved ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-500 font-medium">
                Conflict resolved
              </span>
            </div>
          ) : isResolving ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">
                Resolving...
              </span>
            </div>
          ) : (
            <>
              <Button
                variant="default"
                className="w-full h-12 bg-primary text-primary-foreground font-medium"
                onClick={() => handleResolve("keep_newest")}
              >
                <Clock className="w-4 h-4 mr-2" />
                Keep Newest
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-border text-foreground"
                onClick={() => handleResolve("keep_local")}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Keep This Device
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-border text-foreground"
                onClick={() => handleResolve("keep_remote")}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Keep Cloud Data
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
