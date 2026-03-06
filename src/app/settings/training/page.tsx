"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useSettings, useUpdateSettings, usePrograms } from "@/lib/queries";
import type { UserSettings } from "@/lib/api-client";

const PROGRESSION_OPTIONS = [
  { value: 0.5, label: "0.5 kg" },
  { value: 1.0, label: "1.0 kg" },
  { value: 1.25, label: "1.25 kg" },
  { value: 2.5, label: "2.5 kg" },
];

type ToastType = "success" | "error";

export default function TrainingSettingsPage() {
  const router = useRouter();
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { data: programs } = usePrograms();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSettingChange = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value });
    } catch {
      setToast({ message: "Failed to save setting", type: "error" });
    }
  };

  const activeProgram = programs?.find((p) => p.isActive);
  const trainingDaysCount = activeProgram?.trainingDays?.length || 0;

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <h2 className="text-[28px] font-bold tracking-tight text-white">Training</h2>

      {/* Weight Unit */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Weight Unit</p>
            <p className="text-sm text-muted-foreground">
              {settings.weightUnit === "kg" ? "Kilograms" : "Pounds"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card-alt rounded-lg p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                settings.weightUnit === "kg"
                  ? "bg-primary text-black"
                  : "text-white/50"
              }`}
              onClick={() => handleSettingChange("weightUnit", "kg")}
            >
              kg
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                settings.weightUnit === "lbs"
                  ? "bg-primary text-black"
                  : "text-white/50"
              }`}
              onClick={() => handleSettingChange("weightUnit", "lbs")}
            >
              lbs
            </button>
          </div>
        </div>
      </Card>

      {/* Rest Timer */}
      <Card className="bg-card border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Default Rest Timer</p>
            <p className="text-sm text-muted-foreground">Rest between sets</p>
          </div>
          <span className="text-lg font-semibold text-primary">
            {settings.defaultRestSeconds}s
          </span>
        </div>
        <Slider
          value={[settings.defaultRestSeconds]}
          onValueChange={([value]) => handleSettingChange("defaultRestSeconds", value)}
          min={30}
          max={180}
          step={15}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>30s</span>
          <span>180s</span>
        </div>
      </Card>

      {/* Progression Increment */}
      <Card className="bg-card border-border p-5 space-y-3">
        <div>
          <p className="font-medium text-foreground">Progression Increment</p>
          <p className="text-sm text-muted-foreground">Weight increase suggestion</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROGRESSION_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.progressionIncrement === option.value
                  ? "bg-primary text-black"
                  : "bg-card-alt text-white/50 hover:text-white/80"
              }`}
              onClick={() => handleSettingChange("progressionIncrement", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Toggle Settings */}
      <Card className="bg-card border-border p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Auto-Progress Weight</p>
            <p className="text-sm text-muted-foreground">Suggest higher weight when targets hit</p>
          </div>
          <Switch
            checked={settings.autoProgressWeight}
            onCheckedChange={(checked) => handleSettingChange("autoProgressWeight", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Sound Effects</p>
            <p className="text-sm text-muted-foreground">Timer and completion sounds</p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Auto-Start Rest Timer</p>
            <p className="text-sm text-muted-foreground">Start timer after logging a set</p>
          </div>
          <Switch
            checked={settings.autoStartRestTimer ?? true}
            onCheckedChange={(checked) => handleSettingChange("autoStartRestTimer", checked)}
          />
        </div>
      </Card>

      {/* Training Program */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Training Program</CardTitle>
          <CardDescription>Your current workout program</CardDescription>
        </CardHeader>
        <CardContent>
          {activeProgram ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">{activeProgram.name}</p>
                <p className="text-sm text-muted-foreground">
                  {trainingDaysCount} training {trainingDaysCount === 1 ? "day" : "days"} per week
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => router.push("/programs")}
              >
                My Programs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No program selected</p>
              <Button className="w-full h-12" onClick={() => router.push("/programs")}>
                Browse Programs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
