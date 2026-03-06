"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNutritionProfile, useUpdateNutritionProfile } from "@/lib/queries";
import type { NutritionProfile } from "@/lib/api-client";

type ToastType = "success" | "error";

export default function NutritionSettingsPage() {
  const { data: nutritionProfile, isLoading } = useNutritionProfile();
  const updateNutritionProfileMutation = useUpdateNutritionProfile();
  const [nutritionFields, setNutritionFields] = useState<Partial<NutritionProfile>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (nutritionProfile) {
      setNutritionFields({
        caloriesTrainingDay: nutritionProfile.caloriesTrainingDay,
        proteinTrainingDay: nutritionProfile.proteinTrainingDay,
        carbsTrainingDay: nutritionProfile.carbsTrainingDay,
        fatTrainingDay: nutritionProfile.fatTrainingDay,
        caloriesRestDay: nutritionProfile.caloriesRestDay,
        proteinRestDay: nutritionProfile.proteinRestDay,
        carbsRestDay: nutritionProfile.carbsRestDay,
        fatRestDay: nutritionProfile.fatRestDay,
        currentPhase: nutritionProfile.currentPhase,
        weightGainTarget: nutritionProfile.weightGainTarget,
        weightCheckIntervalDays: nutritionProfile.weightCheckIntervalDays,
        calorieStepUp: nutritionProfile.calorieStepUp,
        calorieStepDown: nutritionProfile.calorieStepDown,
        gainRateMinPerWeek: nutritionProfile.gainRateMinPerWeek,
        gainRateMaxPerWeek: nutritionProfile.gainRateMaxPerWeek,
      });
    }
  }, [nutritionProfile]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFieldChange = (field: keyof NutritionProfile, value: number | string) => {
    setNutritionFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: keyof NutritionProfile) => {
    const value = nutritionFields[field];
    if (value !== undefined && value !== nutritionProfile?.[field]) {
      updateNutritionProfileMutation.mutate({ [field]: value });
    }
  };

  const handlePhaseChange = (phase: string) => {
    setNutritionFields((prev) => ({ ...prev, currentPhase: phase }));
    updateNutritionProfileMutation.mutate({ currentPhase: phase });
  };

  if (isLoading) {
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

      <h2 className="text-[28px] font-bold tracking-tight text-white">Nutrition</h2>

      {/* Training Day Targets */}
      <Card className="bg-card border-border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">Training Day Targets</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nt-cal-training">Calories</Label>
            <Input
              id="nt-cal-training"
              type="number"
              value={nutritionFields.caloriesTrainingDay ?? ""}
              onChange={(e) => handleFieldChange("caloriesTrainingDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("caloriesTrainingDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-protein-training">Protein (g)</Label>
            <Input
              id="nt-protein-training"
              type="number"
              value={nutritionFields.proteinTrainingDay ?? ""}
              onChange={(e) => handleFieldChange("proteinTrainingDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("proteinTrainingDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-carbs-training">Carbs (g)</Label>
            <Input
              id="nt-carbs-training"
              type="number"
              value={nutritionFields.carbsTrainingDay ?? ""}
              onChange={(e) => handleFieldChange("carbsTrainingDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("carbsTrainingDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-fat-training">Fat (g)</Label>
            <Input
              id="nt-fat-training"
              type="number"
              value={nutritionFields.fatTrainingDay ?? ""}
              onChange={(e) => handleFieldChange("fatTrainingDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("fatTrainingDay")}
            />
          </div>
        </div>
      </Card>

      {/* Rest Day Targets */}
      <Card className="bg-card border-border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">Rest Day Targets</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nt-cal-rest">Calories</Label>
            <Input
              id="nt-cal-rest"
              type="number"
              value={nutritionFields.caloriesRestDay ?? ""}
              onChange={(e) => handleFieldChange("caloriesRestDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("caloriesRestDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-protein-rest">Protein (g)</Label>
            <Input
              id="nt-protein-rest"
              type="number"
              value={nutritionFields.proteinRestDay ?? ""}
              onChange={(e) => handleFieldChange("proteinRestDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("proteinRestDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-carbs-rest">Carbs (g)</Label>
            <Input
              id="nt-carbs-rest"
              type="number"
              value={nutritionFields.carbsRestDay ?? ""}
              onChange={(e) => handleFieldChange("carbsRestDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("carbsRestDay")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-fat-rest">Fat (g)</Label>
            <Input
              id="nt-fat-rest"
              type="number"
              value={nutritionFields.fatRestDay ?? ""}
              onChange={(e) => handleFieldChange("fatRestDay", Number(e.target.value))}
              onBlur={() => handleFieldBlur("fatRestDay")}
            />
          </div>
        </div>
      </Card>

      {/* Weight Management */}
      <Card className="bg-card border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">Weight Management</h3>

        {/* Phase Selector */}
        <div className="space-y-1.5">
          <Label>Current Phase</Label>
          <div className="flex items-center gap-2 bg-card-alt rounded-lg p-1">
            {(["bulk", "cut", "maintain"] as const).map((phase) => (
              <button
                key={phase}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  nutritionFields.currentPhase === phase
                    ? "bg-primary text-black"
                    : "text-white/50"
                }`}
                onClick={() => handlePhaseChange(phase)}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nt-weight-gain">Gain Target (kg/wk)</Label>
            <Input
              id="nt-weight-gain"
              type="number"
              step={0.1}
              value={nutritionFields.weightGainTarget ?? ""}
              onChange={(e) => handleFieldChange("weightGainTarget", Number(e.target.value))}
              onBlur={() => handleFieldBlur("weightGainTarget")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-check-interval">Check Interval (days)</Label>
            <Input
              id="nt-check-interval"
              type="number"
              value={nutritionFields.weightCheckIntervalDays ?? ""}
              onChange={(e) => handleFieldChange("weightCheckIntervalDays", Number(e.target.value))}
              onBlur={() => handleFieldBlur("weightCheckIntervalDays")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-step-up">Step Up (kcal)</Label>
            <Input
              id="nt-step-up"
              type="number"
              value={nutritionFields.calorieStepUp ?? ""}
              onChange={(e) => handleFieldChange("calorieStepUp", Number(e.target.value))}
              onBlur={() => handleFieldBlur("calorieStepUp")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-step-down">Step Down (kcal)</Label>
            <Input
              id="nt-step-down"
              type="number"
              value={nutritionFields.calorieStepDown ?? ""}
              onChange={(e) => handleFieldChange("calorieStepDown", Number(e.target.value))}
              onBlur={() => handleFieldBlur("calorieStepDown")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-min-gain">Min Rate (kg/wk)</Label>
            <Input
              id="nt-min-gain"
              type="number"
              step={0.05}
              value={nutritionFields.gainRateMinPerWeek ?? ""}
              onChange={(e) => handleFieldChange("gainRateMinPerWeek", Number(e.target.value))}
              onBlur={() => handleFieldBlur("gainRateMinPerWeek")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-max-gain">Max Rate (kg/wk)</Label>
            <Input
              id="nt-max-gain"
              type="number"
              step={0.05}
              value={nutritionFields.gainRateMaxPerWeek ?? ""}
              onChange={(e) => handleFieldChange("gainRateMaxPerWeek", Number(e.target.value))}
              onBlur={() => handleFieldBlur("gainRateMaxPerWeek")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
