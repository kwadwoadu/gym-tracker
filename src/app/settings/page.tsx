"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  ArrowLeft,
  Loader2,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getUserSettings, updateUserSettings, type UserSettings } from "@/lib/db";
import {
  exportAllData,
  downloadExportedData,
  importData,
  readFileAsString,
  clearWorkoutLogs,
  resetToDefault,
} from "@/lib/export";
import { SyncButton } from "@/components/sync/sync-button";

const PROGRESSION_OPTIONS = [
  { value: 0.5, label: "0.5 kg" },
  { value: 1.0, label: "1.0 kg" },
  { value: 1.25, label: "1.25 kg" },
  { value: 2.5, label: "2.5 kg" },
];

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const userSettings = await getUserSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleSettingChange = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await updateUserSettings({ [key]: value });
    } catch (error) {
      console.error("Failed to update setting:", error);
      // Revert on error
      setSettings(settings);
      showToast("Failed to save setting", "error");
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      downloadExportedData(data);
      showToast("Data exported successfully", "success");
    } catch (error) {
      console.error("Failed to export data:", error);
      showToast("Failed to export data", "error");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const jsonString = await readFileAsString(file);
      await importData(jsonString);
      // Reload settings after import
      const newSettings = await getUserSettings();
      setSettings(newSettings);
      showToast("Data imported successfully", "success");
    } catch (error) {
      console.error("Failed to import data:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to import data",
        "error"
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearWorkoutLogs();
      showToast("Workout logs cleared", "success");
    } catch (error) {
      console.error("Failed to clear logs:", error);
      showToast("Failed to clear logs", "error");
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefault();
      // Reload settings after reset
      const newSettings = await getUserSettings();
      setSettings(newSettings);
      showToast("Reset to default program", "success");
    } catch (error) {
      console.error("Failed to reset:", error);
      showToast("Failed to reset", "error");
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
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

      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Preferences & data management
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Cloud Sync Section */}
        <SyncButton />

        {/* Preferences Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>Customize your workout experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weight Unit */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weight Unit</p>
                <p className="text-sm text-muted-foreground">
                  {settings.weightUnit === "kg" ? "Kilograms" : "Pounds"}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    settings.weightUnit === "kg"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleSettingChange("weightUnit", "kg")}
                >
                  kg
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    settings.weightUnit === "lbs"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleSettingChange("weightUnit", "lbs")}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Default Rest Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Default Rest Timer</p>
                  <p className="text-sm text-muted-foreground">
                    Rest between sets
                  </p>
                </div>
                <span className="text-lg font-semibold text-primary">
                  {settings.defaultRestSeconds}s
                </span>
              </div>
              <Slider
                value={[settings.defaultRestSeconds]}
                onValueChange={([value]) =>
                  handleSettingChange("defaultRestSeconds", value)
                }
                min={30}
                max={180}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30s</span>
                <span>180s</span>
              </div>
            </div>

            {/* Progression Increment */}
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Progression Increment</p>
                <p className="text-sm text-muted-foreground">
                  Weight increase suggestion
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PROGRESSION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.progressionIncrement === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() =>
                      handleSettingChange("progressionIncrement", option.value)
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Progress */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto-Progress Weight</p>
                <p className="text-sm text-muted-foreground">
                  Suggest higher weight when targets are hit
                </p>
              </div>
              <Switch
                checked={settings.autoProgressWeight}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoProgressWeight", checked)
                }
              />
            </div>

            {/* Sound Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">
                  Timer and completion sounds
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("soundEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>Export, import, or reset your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Export Button */}
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={handleExport}
            >
              <Download className="w-5 h-5 mr-3" />
              Export Data
            </Button>

            {/* Import Button */}
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={handleImportClick}
            >
              <Upload className="w-5 h-5 mr-3" />
              Import Data
            </Button>

            {/* Clear Workout Logs */}
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
                    This will delete all your workout history and personal records.
                    Your program and exercises will be kept. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearLogs}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Clear Logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Reset to Default */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-red-500 hover:text-red-600 border-red-500/30 hover:border-red-500/50"
                >
                  <RotateCcw className="w-5 h-5 mr-3" />
                  Reset to Default Program
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete ALL your data including workouts, personal
                    records, custom exercises, and settings. The app will be reset
                    to the default program. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600"
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
          <p>SetFlow v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
