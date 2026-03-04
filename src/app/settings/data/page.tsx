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
  Loader2,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { exportAllData, downloadExportedData, importData, readFileAsString } from "@/lib/export";

type ToastType = "success" | "error";

export default function DataSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

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
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
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

      {/* Danger Zone */}
      <Card className="bg-[#1A1A1A] border-red-500/20">
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
