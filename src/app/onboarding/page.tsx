"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingCarousel,
  WelcomeStep,
  GoalsStep,
  ExperienceStep,
  ScheduleStep,
  EquipmentStep,
  BodyMetricsStep,
  InjuriesStep,
  CompletionStep,
} from "@/components/onboarding";
import {
  updateOnboardingProfile,
  completeOnboarding,
  skipOnboarding,
  type OnboardingProfile,
} from "@/lib/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type EquipmentType = "full_gym" | "home_gym" | "bodyweight";

export default function OnboardingPage() {
  const router = useRouter();
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // Onboarding state
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<EquipmentType | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [bodyFatPercent, setBodyFatPercent] = useState<number | null>(null);
  const [injuries, setInjuries] = useState<string[]>([]);

  // Save progress to IndexedDB after each step
  const saveProgress = useCallback(async () => {
    await updateOnboardingProfile({
      goals,
      experienceLevel,
      trainingDaysPerWeek,
      equipment,
      heightCm,
      weightKg,
      bodyFatPercent,
      injuries,
    });
  }, [goals, experienceLevel, trainingDaysPerWeek, equipment, heightCm, weightKg, bodyFatPercent, injuries]);

  const handleGoalsChange = async (newGoals: string[]) => {
    setGoals(newGoals);
    await updateOnboardingProfile({ goals: newGoals });
  };

  const handleExperienceChange = async (level: ExperienceLevel) => {
    setExperienceLevel(level);
    await updateOnboardingProfile({ experienceLevel: level });
  };

  const handleScheduleChange = async (days: number) => {
    setTrainingDaysPerWeek(days);
    await updateOnboardingProfile({ trainingDaysPerWeek: days });
  };

  const handleEquipmentChange = async (eq: EquipmentType) => {
    setEquipment(eq);
    await updateOnboardingProfile({ equipment: eq });
  };

  const handleBodyMetricsUpdate = async (
    field: "heightCm" | "weightKg" | "bodyFatPercent",
    value: number | null
  ) => {
    if (field === "heightCm") setHeightCm(value);
    else if (field === "weightKg") setWeightKg(value);
    else if (field === "bodyFatPercent") setBodyFatPercent(value);
    await updateOnboardingProfile({ [field]: value });
  };

  const handleInjuriesChange = async (newInjuries: string[]) => {
    setInjuries(newInjuries);
    await updateOnboardingProfile({ injuries: newInjuries });
  };

  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = async () => {
    await skipOnboarding();
    router.push("/onboarding/plans");
  };

  const handleComplete = async () => {
    await saveProgress();
    await completeOnboarding();
    router.push("/onboarding/plans");
  };

  // Profile for completion step
  const profile: Partial<OnboardingProfile> = {
    goals,
    experienceLevel,
    trainingDaysPerWeek,
    equipment,
    heightCm,
    weightKg,
    bodyFatPercent,
    injuries,
  };

  // Determine which steps can proceed
  const canProceed = [
    true, // Welcome - always can proceed
    goals.length > 0, // Goals - need at least 1
    experienceLevel !== null, // Experience - need selection
    true, // Schedule - slider always has value
    equipment !== null, // Equipment - need selection
    true, // Body metrics - optional
    true, // Injuries - optional (no selection = no injuries)
    true, // Completion - always can proceed
  ];

  return (
    <>
      <OnboardingCarousel
        onSkip={handleSkip}
        onComplete={handleComplete}
        canProceed={canProceed}
      >
        <WelcomeStep />
        <GoalsStep selectedGoals={goals} onSelect={handleGoalsChange} />
        <ExperienceStep selected={experienceLevel} onSelect={handleExperienceChange} />
        <ScheduleStep daysPerWeek={trainingDaysPerWeek} onSelect={handleScheduleChange} />
        <EquipmentStep selected={equipment} onSelect={handleEquipmentChange} />
        <BodyMetricsStep
          heightCm={heightCm}
          weightKg={weightKg}
          bodyFatPercent={bodyFatPercent}
          onUpdate={handleBodyMetricsUpdate}
        />
        <InjuriesStep selected={injuries} onSelect={handleInjuriesChange} />
        <CompletionStep profile={profile} />
      </OnboardingCarousel>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Skip personalization?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              You can always update your profile later in Settings. We&apos;ll show you our recommended programs to get started.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20">
              Continue Setup
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSkip}
              className="bg-[#CDFF00] text-black hover:bg-[#b8e600]"
            >
              Skip for Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
