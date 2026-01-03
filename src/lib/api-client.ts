/**
 * API Client for SetFlow
 * Replaces direct Dexie operations with REST API calls
 */

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================================
// Exercises
// ============================================================

export interface Exercise {
  id: string;
  name: string;
  videoUrl: string | null;
  muscleGroups: string[];
  equipment: string;
  isCustom: boolean;
  userId: string | null;
  createdAt: string;
}

export const exercisesApi = {
  list: async (): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE}/exercises`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<Exercise> => {
    const res = await fetch(`${API_BASE}/exercises/${id}`);
    return handleResponse(res);
  },

  create: async (data: Omit<Exercise, "id" | "isCustom" | "userId" | "createdAt">): Promise<Exercise> => {
    const res = await fetch(`${API_BASE}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<Exercise>): Promise<Exercise> => {
    const res = await fetch(`${API_BASE}/exercises/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/exercises/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Programs
// ============================================================

export interface TrainingDay {
  id: string;
  name: string;
  dayNumber: number;
  programId: string;
  warmup: unknown[];
  supersets: unknown[];
  finisher: unknown[];
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  trainingDays?: TrainingDay[];
}

export const programsApi = {
  list: async (): Promise<Program[]> => {
    const res = await fetch(`${API_BASE}/programs`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<Program> => {
    const res = await fetch(`${API_BASE}/programs/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
    trainingDays?: Partial<TrainingDay>[];
  }): Promise<Program> => {
    const res = await fetch(`${API_BASE}/programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<Program>): Promise<Program> => {
    const res = await fetch(`${API_BASE}/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/programs/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Training Days
// ============================================================

export const trainingDaysApi = {
  list: async (programId?: string): Promise<TrainingDay[]> => {
    const params = programId ? `?programId=${programId}` : "";
    const res = await fetch(`${API_BASE}/training-days${params}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<TrainingDay & { program: { userId: string; name: string } }> => {
    const res = await fetch(`${API_BASE}/training-days/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    programId: string;
    name: string;
    dayNumber?: number;
    warmup?: unknown[];
    supersets?: unknown[];
    finisher?: unknown[];
  }): Promise<TrainingDay> => {
    const res = await fetch(`${API_BASE}/training-days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<TrainingDay>): Promise<TrainingDay> => {
    const res = await fetch(`${API_BASE}/training-days/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/training-days/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Workout Logs
// ============================================================

export interface SetLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  notes: string | null;
  isComplete: boolean;
  programId: string;
  dayId: string;
  userId: string;
  sets: SetLog[];
  day?: { name: string; dayNumber: number; warmup?: unknown[]; supersets?: unknown[]; finisher?: unknown[] };
  program?: { name: string };
}

export const workoutLogsApi = {
  list: async (options?: {
    limit?: number;
    programId?: string;
    dayId?: string;
    startDate?: string;
    endDate?: string;
    isComplete?: boolean;
  }): Promise<WorkoutLog[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.programId) params.set("programId", options.programId);
    if (options?.dayId) params.set("dayId", options.dayId);
    if (options?.startDate) params.set("startDate", options.startDate);
    if (options?.endDate) params.set("endDate", options.endDate);
    if (options?.isComplete !== undefined) params.set("isComplete", String(options.isComplete));

    const res = await fetch(`${API_BASE}/workout-logs?${params.toString()}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<WorkoutLog> => {
    const res = await fetch(`${API_BASE}/workout-logs/${id}`);
    return handleResponse(res);
  },

  getActive: async (): Promise<WorkoutLog | null> => {
    const res = await fetch(`${API_BASE}/workout-logs/active`);
    return handleResponse(res);
  },

  create: async (data: {
    programId: string;
    dayId: string;
    dayName: string;
    date?: string;
  }): Promise<WorkoutLog> => {
    const res = await fetch(`${API_BASE}/workout-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<WorkoutLog>): Promise<WorkoutLog> => {
    const res = await fetch(`${API_BASE}/workout-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/workout-logs/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Personal Records
// ============================================================

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: string;
  date: string;
  workoutLogId: string;
  userId: string;
  exercise?: { name: string; muscleGroups: string[] };
}

export const personalRecordsApi = {
  list: async (exerciseId?: string): Promise<PersonalRecord[]> => {
    const params = exerciseId ? `?exerciseId=${exerciseId}` : "";
    const res = await fetch(`${API_BASE}/personal-records${params}`);
    return handleResponse(res);
  },

  create: async (data: {
    exerciseId: string;
    exerciseName: string;
    weight: number;
    reps: number;
    unit?: string;
    date?: string;
    workoutLogId: string;
  }): Promise<PersonalRecord> => {
    const res = await fetch(`${API_BASE}/personal-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Achievements
// ============================================================

export interface Achievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  userId: string;
}

export const achievementsApi = {
  list: async (): Promise<Achievement[]> => {
    const res = await fetch(`${API_BASE}/achievements`);
    return handleResponse(res);
  },

  unlock: async (achievementId: string): Promise<Achievement> => {
    const res = await fetch(`${API_BASE}/achievements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievementId }),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Settings
// ============================================================

export interface UserSettings {
  id: string;
  weightUnit: string;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  autoProgressWeight: boolean;
  progressionIncrement: number;
  autoStartRestTimer: boolean;
  userId: string;
}

export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  update: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Onboarding
// ============================================================

export interface OnboardingProfile {
  id: string;
  goals: string[];
  experienceLevel: string | null;
  trainingDaysPerWeek: number | null;
  equipment: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPercent: number | null;
  injuries: string[];
  hasCompletedOnboarding: boolean;
  skippedOnboarding: boolean;
  completedAt: string | null;
  userId: string;
}

export const onboardingApi = {
  get: async (): Promise<OnboardingProfile | null> => {
    const res = await fetch(`${API_BASE}/onboarding`);
    return handleResponse(res);
  },

  update: async (data: Partial<OnboardingProfile>): Promise<OnboardingProfile> => {
    const res = await fetch(`${API_BASE}/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Stats
// ============================================================

export interface Stats {
  period: string;
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  dayFrequency: number[];
  currentStreak: number;
  personalRecordsCount: number;
  recentPRs: PersonalRecord[];
}

export const statsApi = {
  get: async (period?: "week" | "month" | "year" | "all"): Promise<Stats> => {
    const params = period ? `?period=${period}` : "";
    const res = await fetch(`${API_BASE}/stats${params}`);
    return handleResponse(res);
  },
};
