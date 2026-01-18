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
  builtInId: string | null; // Original preset ID (e.g., "ex-barbell-bench")
  name: string;
  videoUrl: string | null;
  muscleGroups: string[];
  muscles?: {
    primary: string[];
    secondary: string[];
  };
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

  create: async (data: Omit<Exercise, "id" | "builtInId" | "isCustom" | "userId" | "createdAt"> & { builtInId?: string | null; muscles?: { primary: string[]; secondary: string[] } }): Promise<Exercise> => {
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

// Warmup/Finisher exercise in a training day
export interface WarmupExercise {
  exerciseId: string;
  reps?: number;
  duration?: number;
  notes?: string;
}

// Superset exercise in a training day
export interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
}

// Superset group in a training day
export interface Superset {
  id: string;
  label: string;
  exercises: SupersetExercise[];
}

export interface TrainingDay {
  id: string;
  name: string;
  dayNumber: number;
  programId: string;
  warmup: WarmupExercise[];
  supersets: Superset[];
  finisher: WarmupExercise[];
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  archivedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  trainingDays?: TrainingDay[];
  workoutCount?: number;
  lastWorkoutDate?: string | null;
}

export const programsApi = {
  list: async (options?: { includeArchived?: boolean; archivedOnly?: boolean }): Promise<Program[]> => {
    const params = new URLSearchParams();
    if (options?.includeArchived) params.set("includeArchived", "true");
    if (options?.archivedOnly) params.set("archivedOnly", "true");
    const query = params.toString();
    const res = await fetch(`${API_BASE}/programs${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<Program> => {
    const res = await fetch(`${API_BASE}/programs/${id}`);
    return handleResponse(res);
  },

  archive: async (id: string): Promise<{ success: boolean; program: Program }> => {
    const res = await fetch(`${API_BASE}/programs/${id}/archive`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    return handleResponse(res);
  },

  restore: async (id: string): Promise<{ success: boolean; program: Program }> => {
    const res = await fetch(`${API_BASE}/programs/${id}/archive`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    return handleResponse(res);
  },

  clone: async (id: string, name?: string): Promise<{ success: boolean; program: Program }> => {
    const res = await fetch(`${API_BASE}/programs/${id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  deletePermanent: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/programs/${id}?permanent=true`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
    trainingDays?: Partial<TrainingDay>[];
  }): Promise<Program> => {
    // Debug logging for program creation
    console.log(`[programsApi.create] Creating program "${data.name}" with ${data.trainingDays?.length || 0} training days`);
    if (data.trainingDays) {
      data.trainingDays.forEach((day, i) => {
        const supersetCount = Array.isArray(day.supersets) ? day.supersets.length : 0;
        console.log(`[programsApi.create] Day ${i + 1}: ${supersetCount} supersets`);
      });
    }

    const res = await fetch(`${API_BASE}/programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Program>(res);

    // Log response to verify data came back correctly
    console.log(`[programsApi.create] Response: ${result.trainingDays?.length || 0} training days returned`);

    return result;
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
  id?: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps?: number;
  actualReps: number;
  targetReps?: number;
  rpe?: number;
  tempo?: string;
  unit?: string;
  supersetLabel?: string;
  isComplete?: boolean;
  completedAt?: string;
  skipped?: boolean; // True if set was skipped
  skipReason?: string; // Optional: "equipment_taken", "time", "fatigue"
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
    programId?: string;
    dayId: string;
    dayName: string;
    date?: string;
    duration?: number;
    sets?: SetLog[];
    notes?: string;
    isComplete?: boolean;
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

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/personal-records/${id}`, {
      method: "DELETE",
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

// Onboarding state machine type
export type OnboardingState = "not_started" | "profile_complete" | "program_installing" | "complete";

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
  onboardingState: OnboardingState;
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
  thisWeekCount: number;
  programDayCount: number;
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

// ============================================================
// Nutrition (Feature-gated to k@adu.dk)
// ============================================================

export interface NutritionLog {
  id?: string;
  date: string;
  hitProteinGoal: boolean;
  caloriesOnTarget: boolean;
  notes: string | null;
}

export interface MealSlots {
  breakfast: string | null;
  midMorning: string | null;
  lunch: string | null;
  snack: string | null;
  dinner: string | null;
}

export interface MealPlan {
  id?: string;
  date: string;
  slots: MealSlots;
}

export interface WeeklyBreakdown {
  weekStart: string;
  weekEnd: string;
  proteinCompliance: number;
  calorieCompliance: number;
  daysLogged: number;
}

export interface NutritionStats {
  period: {
    startDate: string;
    endDate: string;
    weeks: number;
  };
  overall: {
    totalDays: number;
    proteinDays: number;
    calorieDays: number;
    proteinCompliance: number;
    calorieCompliance: number;
  };
  streaks: {
    proteinStreak: number;
    calorieStreak: number;
  };
  weeklyBreakdown: WeeklyBreakdown[];
  recentLogs: NutritionLog[];
  // Progress page format
  weekly?: Array<{ proteinHits: number; calorieHits: number; days: number }>;
  daily?: Array<{ date: string; hitProteinGoal: boolean; caloriesOnTarget: boolean }>;
}

export const nutritionLogApi = {
  get: async (date?: string): Promise<NutritionLog> => {
    const params = date ? `?date=${date}` : "";
    const res = await fetch(`${API_BASE}/nutrition/log${params}`);
    return handleResponse(res);
  },

  update: async (data: {
    date: string;
    hitProteinGoal?: boolean;
    caloriesOnTarget?: boolean;
    notes?: string | null;
  }): Promise<NutritionLog> => {
    const res = await fetch(`${API_BASE}/nutrition/log`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export const mealPlanApi = {
  get: async (date?: string): Promise<MealPlan> => {
    const params = date ? `?date=${date}` : "";
    const res = await fetch(`${API_BASE}/nutrition/plan${params}`);
    return handleResponse(res);
  },

  update: async (data: { date: string; slots: MealSlots }): Promise<MealPlan> => {
    const res = await fetch(`${API_BASE}/nutrition/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  copyFromDate: async (sourceDate: string, targetDate: string): Promise<MealPlan> => {
    const res = await fetch(`${API_BASE}/nutrition/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceDate, targetDate }),
    });
    return handleResponse(res);
  },
};

export const nutritionStatsApi = {
  get: async (weeks?: number): Promise<NutritionStats> => {
    const params = weeks ? `?weeks=${weeks}` : "";
    const res = await fetch(`${API_BASE}/nutrition/stats${params}`);
    return handleResponse(res);
  },
};

// Supplement Log Types
export interface SupplementLog {
  id?: string;
  date: string;
  dayType: string;
  completed: string[];
}

export const supplementLogApi = {
  get: async (date?: string): Promise<SupplementLog> => {
    const params = date ? `?date=${date}` : "";
    const res = await fetch(`${API_BASE}/nutrition/supplements${params}`);
    return handleResponse(res);
  },

  update: async (data: {
    date: string;
    dayType?: string;
    completed?: string[];
  }): Promise<SupplementLog> => {
    const res = await fetch(`${API_BASE}/nutrition/supplements`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Custom Meals (SetFlow v2.0)
// ============================================================

export interface CustomMeal {
  id: string;
  name: string;
  category: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  prepTime: string | null;
  ingredients: string[] | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const customMealsApi = {
  list: async (): Promise<CustomMeal[]> => {
    const res = await fetch(`${API_BASE}/nutrition/meals`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<CustomMeal> => {
    const res = await fetch(`${API_BASE}/nutrition/meals/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    category: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    calories?: number;
    prepTime?: string;
    ingredients?: string[];
  }): Promise<CustomMeal> => {
    const res = await fetch(`${API_BASE}/nutrition/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<Omit<CustomMeal, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<CustomMeal> => {
    const res = await fetch(`${API_BASE}/nutrition/meals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/nutrition/meals/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Custom Supplements (SetFlow v2.0)
// ============================================================

export interface CustomSupplement {
  id: string;
  name: string;
  dose: string;
  timing: string;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export const customSupplementsApi = {
  list: async (): Promise<CustomSupplement[]> => {
    const res = await fetch(`${API_BASE}/nutrition/custom-supplements`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    dose: string;
    timing: string;
    notes?: string;
  }): Promise<CustomSupplement> => {
    const res = await fetch(`${API_BASE}/nutrition/custom-supplements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<Omit<CustomSupplement, "id" | "userId" | "createdAt">>): Promise<CustomSupplement> => {
    const res = await fetch(`${API_BASE}/nutrition/custom-supplements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/nutrition/custom-supplements/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

// ============================================================
// Supplement Protocol (SetFlow v2.0)
// ============================================================

export interface SupplementProtocol {
  id?: string;
  userId: string;
  protocol: {
    morning: string[];
    preWorkout: string[];
    postWorkout: string[];
    evening: string[];
  };
  updatedAt?: string;
}

export const supplementProtocolApi = {
  get: async (): Promise<SupplementProtocol> => {
    const res = await fetch(`${API_BASE}/nutrition/protocol`);
    return handleResponse(res);
  },

  update: async (protocol: SupplementProtocol["protocol"]): Promise<SupplementProtocol> => {
    const res = await fetch(`${API_BASE}/nutrition/protocol`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ protocol }),
    });
    return handleResponse(res);
  },
};

// ============================================================
// Community Features (SetFlow v2.0 - Phase 3)
// ============================================================

// User Profile
export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  handle: string | null;
  shareStreak: boolean;
  shareVolume: boolean;
  shareWorkouts: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile extends UserProfile {
  stats?: {
    currentStreak?: number;
    totalWorkouts?: number;
    personalRecordsCount?: number;
    recentWorkouts?: Array<{ id: string; dayName: string; duration: number | null; date: string }>;
  };
}

export const userProfileApi = {
  get: async (): Promise<UserProfile | null> => {
    const res = await fetch(`${API_BASE}/community/profile`);
    return handleResponse(res);
  },

  getByUserId: async (userId: string): Promise<PublicUserProfile | null> => {
    const res = await fetch(`${API_BASE}/community/profile/${userId}`);
    return handleResponse(res);
  },

  update: async (data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/community/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// Follow System
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  handle: string | null;
  userId: string;
}

// User search result
export interface UserSearchResult {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  handle: string | null;
  isFollowing: boolean;
}

export const followApi = {
  follow: async (userId: string): Promise<Follow> => {
    const res = await fetch(`${API_BASE}/community/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  unfollow: async (userId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/community/follow`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  getFollowers: async (): Promise<FollowUser[]> => {
    const res = await fetch(`${API_BASE}/community/follow/followers`);
    return handleResponse(res);
  },

  getFollowing: async (): Promise<FollowUser[]> => {
    const res = await fetch(`${API_BASE}/community/follow/following`);
    return handleResponse(res);
  },

  isFollowing: async (userId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/community/follow/check/${userId}`);
    const data = await handleResponse<{ isFollowing: boolean }>(res);
    return data.isFollowing;
  },
};

// User Search
export const userSearchApi = {
  search: async (query: string, limit?: number): Promise<UserSearchResult[]> => {
    const params = new URLSearchParams();
    params.set("q", query);
    if (limit) params.set("limit", String(limit));
    const res = await fetch(`${API_BASE}/community/users/search?${params.toString()}`);
    return handleResponse(res);
  },
};

// Groups
export type GroupGoalType = "strength" | "weight_loss" | "muscle_building" | "endurance" | "general";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  goalType: GroupGoalType;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isJoined?: boolean;
}

export interface GroupMember {
  id: string;
  role: "admin" | "member";
  joinedAt: string;
  groupId: string;
  userId: string;
  user?: {
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export const groupsApi = {
  list: async (options?: { goalType?: GroupGoalType; joined?: boolean }): Promise<Group[]> => {
    const params = new URLSearchParams();
    if (options?.goalType) params.set("goalType", options.goalType);
    if (options?.joined) params.set("joined", "true");
    const query = params.toString();
    const res = await fetch(`${API_BASE}/community/groups${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<Group & { members: GroupMember[] }> => {
    const res = await fetch(`${API_BASE}/community/groups/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    description?: string;
    goalType: GroupGoalType;
    isPublic?: boolean;
  }): Promise<Group> => {
    const res = await fetch(`${API_BASE}/community/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<Omit<Group, "id" | "createdById" | "createdAt" | "updatedAt">>): Promise<Group> => {
    const res = await fetch(`${API_BASE}/community/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/community/groups/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  join: async (id: string): Promise<GroupMember> => {
    const res = await fetch(`${API_BASE}/community/groups/${id}/join`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  leave: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/community/groups/${id}/leave`, {
      method: "POST",
    });
    return handleResponse(res);
  },
};

// Challenges
export type ChallengeType = "streak" | "volume" | "workouts" | "consistency";

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  type: ChallengeType;
  target: number;
  startDate: string;
  endDate: string;
  groupId: string | null;
  badgeId: string | null;
  createdAt: string;
  participantCount?: number;
  isJoined?: boolean;
  myProgress?: number;
}

export interface ChallengeParticipant {
  id: string;
  progress: number;
  completedAt: string | null;
  joinedAt: string;
  challengeId: string;
  userId: string;
  user?: {
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export const challengesApi = {
  list: async (options?: { active?: boolean; groupId?: string; joined?: boolean }): Promise<Challenge[]> => {
    const params = new URLSearchParams();
    if (options?.active) params.set("active", "true");
    if (options?.groupId) params.set("groupId", options.groupId);
    if (options?.joined) params.set("joined", "true");
    const query = params.toString();
    const res = await fetch(`${API_BASE}/community/challenges${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<Challenge & { participants: ChallengeParticipant[] }> => {
    const res = await fetch(`${API_BASE}/community/challenges/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    description?: string;
    type: ChallengeType;
    target: number;
    startDate: string;
    endDate: string;
    groupId?: string;
    badgeId?: string;
  }): Promise<Challenge> => {
    const res = await fetch(`${API_BASE}/community/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  join: async (id: string): Promise<ChallengeParticipant> => {
    const res = await fetch(`${API_BASE}/community/challenges/${id}/join`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  updateProgress: async (id: string, progress: number): Promise<ChallengeParticipant> => {
    const res = await fetch(`${API_BASE}/community/challenges/${id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    });
    return handleResponse(res);
  },
};

// Badges
export type BadgeTier = "bronze" | "silver" | "gold";

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  tier: BadgeTier;
}

export interface UserBadge {
  id: string;
  earnedAt: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
}

export const badgesApi = {
  list: async (): Promise<Badge[]> => {
    const res = await fetch(`${API_BASE}/community/badges`);
    return handleResponse(res);
  },

  getUserBadges: async (userId?: string): Promise<UserBadge[]> => {
    const params = userId ? `?userId=${userId}` : "";
    const res = await fetch(`${API_BASE}/community/badges/user${params}`);
    return handleResponse(res);
  },
};

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  value: number;
  metric: string;
}

export const leaderboardApi = {
  get: async (metric: "streak" | "volume" | "workouts" = "workouts"): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`${API_BASE}/community/leaderboard?metric=${metric}`);
    return handleResponse(res);
  },
};

// Activity Feed
export interface ActivityItem {
  id: string;
  type: "workout_completed" | "pr_achieved" | "challenge_joined" | "badge_earned" | "group_joined";
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

export const activityApi = {
  getFeed: async (limit?: number): Promise<ActivityItem[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await fetch(`${API_BASE}/community/activity${params}`);
    return handleResponse(res);
  },
};

// ============================================================
// Focus Sessions (SetFlow v2.0 - Phase 4)
// ============================================================

export interface FocusSessionExercise {
  exerciseId: string;
  exerciseName: string;
}

export interface FocusSessionSetLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  actualReps: number;
  rpe?: number;
}

export interface FocusSession {
  id: string;
  userId: string;
  date: string;
  focusArea: string | null;
  exercises: FocusSessionExercise[];
  sets: FocusSessionSetLog[];
  duration: number | null;
  notes: string | null;
  isComplete: boolean;
  startTime: string;
  endTime: string | null;
}

export interface ExerciseRecommendation {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  equipment: string;
  lastUsed: string | null;
  usageCount: number;
  score: number;
}

export const focusSessionApi = {
  list: async (options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    isComplete?: boolean;
  }): Promise<FocusSession[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.startDate) params.set("startDate", options.startDate);
    if (options?.endDate) params.set("endDate", options.endDate);
    if (options?.isComplete !== undefined) params.set("isComplete", String(options.isComplete));

    const res = await fetch(`${API_BASE}/focus-session?${params.toString()}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<FocusSession> => {
    const res = await fetch(`${API_BASE}/focus-session/${id}`);
    return handleResponse(res);
  },

  getActive: async (): Promise<FocusSession | null> => {
    const res = await fetch(`${API_BASE}/focus-session/active`);
    return handleResponse(res);
  },

  create: async (data: {
    focusArea?: string;
    exercises: FocusSessionExercise[];
    date?: string;
    notes?: string;
  }): Promise<FocusSession> => {
    const res = await fetch(`${API_BASE}/focus-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: Partial<{
    exercises: FocusSessionExercise[];
    sets: FocusSessionSetLog[];
    notes: string;
    focusArea: string;
  }>): Promise<FocusSession> => {
    const res = await fetch(`${API_BASE}/focus-session/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  complete: async (id: string, data?: {
    duration?: number;
    notes?: string;
  }): Promise<FocusSession> => {
    const res = await fetch(`${API_BASE}/focus-session/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/focus-session/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Get exercise recommendations based on focus area
  getRecommendations: async (focusArea: string, limit?: number): Promise<ExerciseRecommendation[]> => {
    const params = new URLSearchParams();
    params.set("focusArea", focusArea);
    if (limit) params.set("limit", String(limit));

    const res = await fetch(`${API_BASE}/focus-session/recommend?${params.toString()}`);
    return handleResponse(res);
  },
};
