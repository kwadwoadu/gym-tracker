"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  exercisesApi,
  programsApi,
  trainingDaysApi,
  workoutLogsApi,
  personalRecordsApi,
  achievementsApi,
  settingsApi,
  onboardingApi,
  statsApi,
  nutritionLogApi,
  mealPlanApi,
  nutritionStatsApi,
  supplementLogApi,
  type Exercise,
  type Program,
  type TrainingDay,
  type WorkoutLog,
  type UserSettings,
  type OnboardingProfile,
  type NutritionLog,
  type MealPlan,
  type SupplementLog,
} from "./api-client";

// ============================================================
// Query Keys
// ============================================================

export const queryKeys = {
  exercises: ["exercises"] as const,
  exercise: (id: string) => ["exercises", id] as const,
  programs: ["programs"] as const,
  program: (id: string) => ["programs", id] as const,
  trainingDays: (programId?: string) => ["training-days", programId] as const,
  trainingDay: (id: string) => ["training-days", "detail", id] as const,
  workoutLogs: (filters?: Record<string, unknown>) => ["workout-logs", filters] as const,
  workoutLog: (id: string) => ["workout-logs", id] as const,
  activeWorkout: ["workout-logs", "active"] as const,
  personalRecords: (exerciseId?: string) => ["personal-records", exerciseId] as const,
  achievements: ["achievements"] as const,
  settings: ["settings"] as const,
  onboarding: ["onboarding"] as const,
  stats: (period?: string) => ["stats", period] as const,
  muscleVolume: ["muscle-volume"] as const,
  // Nutrition
  nutritionLog: (date?: string) => ["nutrition-log", date] as const,
  mealPlan: (date?: string) => ["meal-plan", date] as const,
  nutritionStats: (weeks?: number) => ["nutrition-stats", weeks] as const,
  supplementLog: (date?: string) => ["supplement-log", date] as const,
};

// ============================================================
// Exercises
// ============================================================

export function useExercises() {
  return useQuery({
    queryKey: queryKeys.exercises,
    queryFn: exercisesApi.list,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: queryKeys.exercise(id),
    queryFn: () => exercisesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exercisesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exercise> }) =>
      exercisesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises });
      queryClient.invalidateQueries({ queryKey: queryKeys.exercise(id) });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exercisesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises });
    },
  });
}

// ============================================================
// Programs
// ============================================================

export function usePrograms(options?: { includeArchived?: boolean; archivedOnly?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.programs, options],
    queryFn: () => programsApi.list(options),
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: queryKeys.program(id),
    queryFn: () => programsApi.get(id),
    enabled: !!id,
  });
}

export function useActiveProgram() {
  const { data: programs } = usePrograms();
  return programs?.find((p) => p.isActive);
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Program> }) =>
      programsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
      queryClient.invalidateQueries({ queryKey: queryKeys.program(id) });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useArchiveProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useRestoreProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useCloneProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      programsApi.clone(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useDeleteProgramPermanent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.deletePermanent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

// ============================================================
// Training Days
// ============================================================

export function useTrainingDays(programId?: string) {
  return useQuery({
    queryKey: queryKeys.trainingDays(programId),
    queryFn: () => trainingDaysApi.list(programId),
  });
}

export function useTrainingDay(id: string) {
  return useQuery({
    queryKey: queryKeys.trainingDay(id),
    queryFn: () => trainingDaysApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTrainingDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingDaysApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingDays(data.programId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useUpdateTrainingDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingDay> }) =>
      trainingDaysApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingDays() });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingDay(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useDeleteTrainingDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingDaysApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingDays() });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

// ============================================================
// Workout Logs
// ============================================================

export function useWorkoutLogs(options?: Parameters<typeof workoutLogsApi.list>[0]) {
  return useQuery({
    queryKey: queryKeys.workoutLogs(options),
    queryFn: () => workoutLogsApi.list(options),
  });
}

export function useWorkoutLog(id: string) {
  return useQuery({
    queryKey: queryKeys.workoutLog(id),
    queryFn: () => workoutLogsApi.get(id),
    enabled: !!id,
  });
}

export function useActiveWorkout() {
  return useQuery({
    queryKey: queryKeys.activeWorkout,
    queryFn: workoutLogsApi.getActive,
    refetchInterval: 30000, // Refetch every 30 seconds to catch abandoned workouts
  });
}

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workoutLogsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeWorkout });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutLogs() });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutLog> }) =>
      workoutLogsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutLog(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeWorkout });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutLogs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workoutLogsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeWorkout });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutLogs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

// ============================================================
// Personal Records
// ============================================================

export function usePersonalRecords(exerciseId?: string) {
  return useQuery({
    queryKey: queryKeys.personalRecords(exerciseId),
    queryFn: () => personalRecordsApi.list(exerciseId),
  });
}

export function useCreatePersonalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: personalRecordsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalRecords() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

// ============================================================
// Achievements
// ============================================================

export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.achievements,
    queryFn: achievementsApi.list,
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: achievementsApi.unlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
    },
  });
}

// ============================================================
// Settings
// ============================================================

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsApi.get,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    // Optimistic update
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings });
      const previous = queryClient.getQueryData<UserSettings>(queryKeys.settings);
      queryClient.setQueryData(queryKeys.settings, (old: UserSettings | undefined) => ({
        ...old,
        ...newSettings,
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings, context.previous);
      }
    },
  });
}

// ============================================================
// Onboarding
// ============================================================

export function useOnboardingProfile() {
  return useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: onboardingApi.get,
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: onboardingApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding });
    },
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.onboarding });
      const previous = queryClient.getQueryData<OnboardingProfile>(queryKeys.onboarding);
      queryClient.setQueryData(queryKeys.onboarding, (old: OnboardingProfile | undefined) => ({
        ...old,
        ...newData,
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.onboarding, context.previous);
      }
    },
  });
}

// ============================================================
// Stats
// ============================================================

export function useStats(period?: "week" | "month" | "year" | "all") {
  return useQuery({
    queryKey: queryKeys.stats(period),
    queryFn: () => statsApi.get(period),
  });
}

// ============================================================
// Muscle Volume
// ============================================================

import { getWeeklyMuscleVolume } from "./db";

export function useMuscleVolume() {
  return useQuery({
    queryKey: queryKeys.muscleVolume,
    queryFn: () => getWeeklyMuscleVolume(),
  });
}

// ============================================================
// Nutrition (Feature-gated to k@adu.dk)
// ============================================================

export function useNutritionLog(date?: string) {
  return useQuery({
    queryKey: queryKeys.nutritionLog(date),
    queryFn: () => nutritionLogApi.get(date),
  });
}

export function useUpdateNutritionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nutritionLogApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutritionLog(data.date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.nutritionStats() });
    },
    // Optimistic update for instant feedback
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.nutritionLog(newData.date) });
      const previous = queryClient.getQueryData<NutritionLog>(queryKeys.nutritionLog(newData.date));
      queryClient.setQueryData(queryKeys.nutritionLog(newData.date), (old: NutritionLog | undefined) => ({
        ...old,
        ...newData,
      }));
      return { previous, date: newData.date };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.nutritionLog(context.date), context.previous);
      }
    },
  });
}

export function useMealPlan(date?: string) {
  return useQuery({
    queryKey: queryKeys.mealPlan(date),
    queryFn: () => mealPlanApi.get(date),
    enabled: !!date,
    staleTime: 0, // Always fetch fresh data for date-specific queries
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mealPlanApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan(data.date) });
    },
    // Optimistic update for instant drag-drop feedback
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.mealPlan(newData.date) });
      const previous = queryClient.getQueryData<MealPlan>(queryKeys.mealPlan(newData.date));
      queryClient.setQueryData(queryKeys.mealPlan(newData.date), (old: MealPlan | undefined) => ({
        ...old,
        ...newData,
      }));
      return { previous, date: newData.date };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.mealPlan(context.date), context.previous);
      }
    },
  });
}

export function useCopyMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceDate, targetDate }: { sourceDate: string; targetDate: string }) =>
      mealPlanApi.copyFromDate(sourceDate, targetDate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan(data.date) });
    },
  });
}

export function useNutritionStats(weeks?: number) {
  return useQuery({
    queryKey: queryKeys.nutritionStats(weeks),
    queryFn: () => nutritionStatsApi.get(weeks),
  });
}

// ============================================================
// Supplements (Feature-gated to k@adu.dk)
// ============================================================

export function useSupplementLog(date?: string) {
  return useQuery({
    queryKey: queryKeys.supplementLog(date),
    queryFn: () => supplementLogApi.get(date),
    staleTime: 0, // Always fetch fresh data for date-specific queries
  });
}

export function useUpdateSupplementLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplementLogApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplementLog(data.date) });
    },
    // Optimistic update for instant feedback
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.supplementLog(newData.date) });
      const previous = queryClient.getQueryData<SupplementLog>(queryKeys.supplementLog(newData.date));
      queryClient.setQueryData(queryKeys.supplementLog(newData.date), (old: SupplementLog | undefined) => ({
        ...old,
        ...newData,
      }));
      return { previous, date: newData.date };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.supplementLog(context.date), context.previous);
      }
    },
  });
}

// ============================================================
// Gamification (XP System)
// ============================================================

import { gamificationApi, type GamificationResponse, type AwardXPResponse, type CompleteChallengeResponse } from "./api-client";
import { getTodayDate } from "@/data/daily-challenges";
import { getWeekId } from "@/data/weekly-challenges";

// Add gamification query keys
export const gamificationKeys = {
  all: ["gamification"] as const,
  data: () => [...gamificationKeys.all, "data"] as const,
  dailyChallenges: (date?: string) => [...gamificationKeys.all, "challenges", "daily", date || getTodayDate()] as const,
  weeklyChallenges: (weekId?: string) => [...gamificationKeys.all, "challenges", "weekly", weekId || getWeekId()] as const,
  history: (limit?: number) => [...gamificationKeys.all, "history", limit] as const,
};

export function useGamification() {
  return useQuery({
    queryKey: gamificationKeys.data(),
    queryFn: gamificationApi.get,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useDailyChallenges(date?: string) {
  return useQuery({
    queryKey: gamificationKeys.dailyChallenges(date),
    queryFn: () => gamificationApi.getDailyChallenges(date),
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useWeeklyChallenges(weekId?: string) {
  return useQuery({
    queryKey: gamificationKeys.weeklyChallenges(weekId),
    queryFn: () => gamificationApi.getWeeklyChallenges(weekId),
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useXPHistory(limit?: number) {
  return useQuery({
    queryKey: gamificationKeys.history(limit),
    queryFn: () => gamificationApi.getXPHistory(limit),
  });
}

export function useAwardXP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, source }: { amount: number; source: string }) =>
      gamificationApi.awardXP(amount, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
  });
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      type,
      progress,
    }: {
      challengeId: string;
      type: "daily" | "weekly";
      progress: number;
    }) => gamificationApi.updateChallengeProgress(challengeId, type, progress),
    onSuccess: (_, { type }) => {
      if (type === "daily") {
        queryClient.invalidateQueries({ queryKey: gamificationKeys.dailyChallenges() });
      } else {
        queryClient.invalidateQueries({ queryKey: gamificationKeys.weeklyChallenges() });
      }
      queryClient.invalidateQueries({ queryKey: gamificationKeys.data() });
    },
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, type }: { challengeId: string; type: "daily" | "weekly" }) =>
      gamificationApi.completeChallenge(challengeId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
  });
}

export function useBulkUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requirementType,
      value,
      mode = "increment",
    }: {
      requirementType: string;
      value: number;
      mode?: "increment" | "set";
    }) => gamificationApi.bulkUpdateChallengeProgress(requirementType, value, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
  });
}
