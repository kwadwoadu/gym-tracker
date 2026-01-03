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
  type Exercise,
  type Program,
  type TrainingDay,
  type WorkoutLog,
  type UserSettings,
  type OnboardingProfile,
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

export function usePrograms() {
  return useQuery({
    queryKey: queryKeys.programs,
    queryFn: programsApi.list,
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
