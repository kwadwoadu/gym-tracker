"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Cloud,
  RefreshCw,
  Smartphone,
  Clock,
} from "lucide-react";
import { exportAllData, downloadExportedData, importData, readFileAsString } from "@/lib/export";
import { useSyncStatus } from "@/components/sync/auto-sync-provider";

type ToastType = "success" | "error";

type SyncFrequency = "auto" | "manual" | "5min" | "15min" | "1hr";

const SYNC_FREQUENCY_LABELS: Record<SyncFrequency, string> = {
  auto: "Auto (on focus)",
  manual: "Manual only",
  "5min": "Every 5 minutes",
  "15min": "Every 15 minutes",
  "1hr": "Every hour",
};

function formatLastSync(isoDate: string | null): string {
  if (!isoDate) return "Never synced";
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DataSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { syncStatus, lastSyncedAt, isOnline, triggerSync } = useSyncStatus();
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>("auto");

  // Load sync frequency preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("setflow-sync-frequency") as SyncFrequency | null;
      if (stored) setSyncFrequency(stored);
    }
  }, []);

  const handleSyncFrequencyChange = (value: SyncFrequency) => {
    setSyncFrequency(value);
    localStorage.setItem("setflow-sync-frequency", value);
  };

  const handleSyncNow = async () => {
    await triggerSync();
    showToast("Sync complete!", "success");
  };

  // Get device ID for display
  const deviceId = typeof window !== "undefined"
    ? localStorage.getItem("setflow-device-id")?.slice(0, 8) || "Unknown"
    : "...";

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();
      downloadExportedData(data);
      showToast("Data exported!", "success");
    } catch (error) {
      console.error("Failed to export:", error);
      showToast("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const jsonString = await readFileAsString(file);
      await importData(jsonString);
      showToast("Data imported! Refreshing...", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to import:", error);
      showToast(error instanceof Error ? error.message : "Failed to import data", "error");
      setIsImporting(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearLogs = async () => {
    showToast("Clear logs feature coming soon", "success");
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const response = await fetch("/api/reset", { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset");
      }
      showToast("Reset to default program!", "success");
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset:", error);
      showToast(error instanceof Error ? error.message : "Failed to reset", "error");
      setIsResetting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <h2 className="text-[28px] font-bold tracking-tight text-white">Data</h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Export / Import */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Backup</CardTitle>
          <CardDescription>Export or import your workout data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-3" />
            )}
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-3" />
            )}
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Cloud Sync */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Cloud Sync
          </CardTitle>
          <CardDescription>Sync workouts across your devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync status */}
          <div className="bg-card-alt rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === "success"
                      ? "bg-green-500"
                      : syncStatus === "syncing"
                      ? "bg-blue-500 animate-pulse"
                      : syncStatus === "error"
                      ? "bg-red-500"
                      : syncStatus === "offline"
                      ? "bg-yellow-500"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-sm text-foreground capitalize">
                  {syncStatus === "idle" ? "Ready" : syncStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last synced</span>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{formatLastSync(lastSyncedAt)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This device</span>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono text-xs">{deviceId}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <span className={`text-sm ${isOnline ? "text-green-500" : "text-yellow-500"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Sync frequency */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sync frequency</p>
              <p className="text-xs text-muted-foreground">How often to sync data</p>
            </div>
            <Select value={syncFrequency} onValueChange={(v) => handleSyncFrequencyChange(v as SyncFrequency)}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(Object.entries(SYNC_FREQUENCY_LABELS) as [SyncFrequency, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sync now button */}
          <Button
            variant="outline"
            className="w-full h-12 border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleSyncNow}
            disabled={syncStatus === "syncing" || !isOnline}
          >
            {syncStatus === "syncing" ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
          </Button>

          {/* Data estimate */}
          <p className="text-xs text-muted-foreground text-center">
            Sync uses minimal data. Workout logs, programs, and settings are synced.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-red-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Clear Logs */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-orange-500 hover:text-orange-600 border-orange-500/30 hover:border-orange-500/50"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                Clear Workout Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Workout Logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all workout history and personal records.
                  Your program and exercises will be kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLogs} className="bg-orange-500 hover:bg-orange-600">
                  Clear Logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reset */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-red-500 hover:text-red-600 border-red-500/30 hover:border-red-500/50"
                disabled={isResetting}
              >
                {isResetting ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-5 h-5 mr-3" />
                )}
                {isResetting ? "Resetting..." : "Reset to Default Program"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Everything?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block">
                    This will delete ALL data including workouts, personal records, and achievements.
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    We recommend exporting your data first.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full sm:w-auto"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export First
                </Button>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                >
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>SetFlow v2.2.0</p>
      </div>
    </div>
  );
}
