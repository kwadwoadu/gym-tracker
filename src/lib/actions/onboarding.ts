"use server";

import { auth } from "@clerk/nextjs/server";
import { cloudDb } from "@/lib/db/neon";
import { onboardingProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type OnboardingProfileData = {
  goals: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced" | null;
  trainingDaysPerWeek: number | null;
  equipment: "full_gym" | "home_gym" | "bodyweight" | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPercent: number | null;
  injuries: string[];
  hasCompletedOnboarding: boolean;
  skippedOnboarding: boolean;
};

function generateId(): string {
  return crypto.randomUUID();
}

export async function getServerOnboardingProfile(): Promise<OnboardingProfileData | null> {
  // Cloud sync not available - return null
  if (!cloudDb) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const [profile] = await cloudDb
    .select()
    .from(onboardingProfiles)
    .where(eq(onboardingProfiles.userId, userId))
    .limit(1);

  if (!profile) return null;

  return {
    goals: profile.goals,
    experienceLevel: profile.experienceLevel,
    trainingDaysPerWeek: profile.trainingDaysPerWeek,
    equipment: profile.equipment,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    bodyFatPercent: profile.bodyFatPercent,
    injuries: profile.injuries,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    skippedOnboarding: profile.skippedOnboarding,
  };
}

export async function saveOnboardingProfile(
  data: Partial<OnboardingProfileData>
): Promise<{ success: boolean; error?: string }> {
  // Cloud sync not available - silently succeed (data is stored in IndexedDB)
  if (!cloudDb) {
    return { success: true };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const [existing] = await cloudDb
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.userId, userId))
      .limit(1);

    if (existing) {
      await cloudDb
        .update(onboardingProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProfiles.userId, userId));
    } else {
      await cloudDb.insert(onboardingProfiles).values({
        id: generateId(),
        userId,
        goals: data.goals || [],
        experienceLevel: data.experienceLevel || null,
        trainingDaysPerWeek: data.trainingDaysPerWeek || null,
        equipment: data.equipment || null,
        heightCm: data.heightCm || null,
        weightKg: data.weightKg || null,
        bodyFatPercent: data.bodyFatPercent || null,
        injuries: data.injuries || [],
        hasCompletedOnboarding: data.hasCompletedOnboarding || false,
        skippedOnboarding: data.skippedOnboarding || false,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding profile:", error);
    return { success: false, error: "Failed to save profile" };
  }
}

export async function completeServerOnboarding(): Promise<{ success: boolean; error?: string }> {
  return saveOnboardingProfile({
    hasCompletedOnboarding: true,
    skippedOnboarding: false,
  });
}

export async function skipServerOnboarding(): Promise<{ success: boolean; error?: string }> {
  return saveOnboardingProfile({
    hasCompletedOnboarding: true,
    skippedOnboarding: true,
  });
}

export async function checkOnboardingStatus(): Promise<{
  completed: boolean;
  skipped: boolean;
}> {
  const profile = await getServerOnboardingProfile();
  return {
    completed: profile?.hasCompletedOnboarding || false,
    skipped: profile?.skippedOnboarding || false,
  };
}
