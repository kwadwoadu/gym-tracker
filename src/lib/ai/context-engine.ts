/**
 * Context Engine for AI Personal Trainer
 * Aggregates all user data into a structured context for the AI
 */

interface ServerSetLog {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  actualReps?: number;
  rpe?: number;
  setNumber: number;
}

function parseSetLogs(raw: unknown): ServerSetLog[] {
  if (!Array.isArray(raw)) return [];
  return raw as ServerSetLog[];
}

interface ServerWorkoutLog {
  date: string;
  dayName: string;
  startTime: Date;
  duration: number | null;
  sets: unknown; // Prisma JsonValue - parsed via parseSetLogs()
}

interface ServerPR {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface ServerProgram {
  name: string;
  trainingDays: Array<{
    name: string;
    supersets: unknown; // JSON field
  }>;
}

interface ServerOnboardingProfile {
  goals: string[];
  experienceLevel: string | null;
  injuries: string[];
  trainingDaysPerWeek: number | null;
}

/**
 * Build context string server-side from raw Prisma data.
 * This is the reliable path - no client-side hook timing issues.
 */
export function buildServerContext(
  workoutLogs: ServerWorkoutLog[],
  personalRecords: ServerPR[],
  activeProgram: ServerProgram | null,
  onboardingProfile: ServerOnboardingProfile | null,
  totalWorkoutCount: number,
  recoveryScore?: number,
): string {
  const lines: string[] = [];

  // Profile
  lines.push("### Profile");
  const goals = onboardingProfile?.goals?.length
    ? onboardingProfile.goals.join(", ")
    : "Build muscle, Progressive overload";
  lines.push(`- Goals: ${goals}`);
  lines.push(`- Experience: ${onboardingProfile?.experienceLevel || "Intermediate"}`);
  lines.push(`- Training days/week: ${onboardingProfile?.trainingDaysPerWeek || 3}`);
  lines.push("");

  // Performance stats - calculate volume from workout logs
  let totalVolume = 0;

  for (const log of workoutLogs) {
    const sets = parseSetLogs(log.sets);
    for (const set of sets) {
      totalVolume += (set.weight || 0) * (set.reps || 0);
    }
  }

  // Streak calculation
  const today = new Date().toISOString().split("T")[0];
  const workoutDates = [...new Set(workoutLogs.map((l) => l.date))].sort();
  let currentStreak = 0;
  for (let i = workoutDates.length - 1; i >= 0; i--) {
    const workoutDate = new Date(workoutDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - (workoutDates.length - 1 - i));
    if (workoutDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
      currentStreak++;
    } else {
      break;
    }
  }

  // This week count
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekDates = new Set(
    workoutLogs
      .filter((l) => new Date(l.startTime) >= startOfWeek)
      .map((l) => l.date)
  );

  lines.push("### Performance");
  lines.push(`- Current streak: ${currentStreak} days`);
  lines.push(`- This week: ${thisWeekDates.size} sessions`);
  lines.push(`- Total workouts: ${totalWorkoutCount}`);
  lines.push(`- Total volume: ${Math.round(totalVolume).toLocaleString()}kg`);
  lines.push("");

  // Recent workouts - concise format
  if (workoutLogs.length > 0) {
    lines.push("### Recent Workouts");
    for (const w of workoutLogs.slice(0, 10)) {
      const date = new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dur = w.duration ? `${Math.round(w.duration / 60)}min` : "";

      const exerciseMap = new Map<string, { weight: number; reps: number[] }>();
      const sets = parseSetLogs(w.sets);
      for (const s of sets) {
        const key = s.exerciseName;
        const existing = exerciseMap.get(key);
        if (existing) {
          existing.reps.push(s.reps);
          existing.weight = Math.max(existing.weight, s.weight);
        } else {
          exerciseMap.set(key, { weight: s.weight, reps: [s.reps] });
        }
      }

      const exercises = Array.from(exerciseMap.entries())
        .slice(0, 4)
        .map(([name, data]) => `${name} ${data.weight}kg x${data.reps.join(",")}`)
        .join(" | ");

      lines.push(`- ${date} (${w.dayName}): ${exercises}${dur ? ` | ${dur}` : ""}`);
    }
    lines.push("");
  }

  // Recent PRs
  if (personalRecords.length > 0) {
    lines.push("### Recent PRs");
    for (const pr of personalRecords.slice(0, 5)) {
      const dateStr = pr.date
        ? ` (${new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
        : "";
      lines.push(`- ${pr.exerciseName}: ${pr.weight}kg x ${pr.reps}${dateStr}`);
    }
    lines.push("");
  }

  // Current program
  if (activeProgram) {
    lines.push("### Current Program");
    lines.push(`Program: ${activeProgram.name}`);
    for (const day of activeProgram.trainingDays) {
      const supersets = day.supersets as Array<{ exercises: unknown[] }>;
      const exerciseCount = Array.isArray(supersets)
        ? supersets.reduce((sum, ss) => sum + (Array.isArray(ss.exercises) ? ss.exercises.length : 0), 0)
        : 0;
      lines.push(`- ${day.name}: ${exerciseCount} exercises`);
    }
    lines.push("");
  }

  // Today
  lines.push("### Today");
  lines.push(`- Day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`);
  if (activeProgram?.trainingDays?.length) {
    lines.push(`- Program days: ${activeProgram.trainingDays.map((d) => d.name).join(", ")}`);
  }

  // Recovery status
  if (recoveryScore !== undefined && recoveryScore >= 1 && recoveryScore <= 5) {
    const recoveryLabels: Record<number, string> = {
      1: "Exhausted (1/5) - Very low recovery, suggest rest or light session",
      2: "Tired (2/5) - Below average, reduce intensity 10-15%",
      3: "Moderate (3/5) - Normal recovery, train as planned",
      4: "Good (4/5) - Strong recovery, push for progressive overload",
      5: "Great (5/5) - Peak recovery, great day for PRs",
    };
    lines.push("");
    lines.push("### Recovery Status (Self-Assessed Today)");
    lines.push(`- Recovery: ${recoveryLabels[recoveryScore]}`);
  }

  // Risk factors
  if (onboardingProfile?.injuries?.length) {
    lines.push("");
    lines.push("### Risk Factors");
    lines.push(`- Known injuries: ${onboardingProfile.injuries.join(", ")}`);
  }

  return lines.join("\n");
}

export interface TrainerContext {
  profile: {
    goals: string[];
    experience: string;
    trainingDaysPerWeek: number;
  };
  currentProgram: {
    name: string;
    trainingDays: Array<{
      name: string;
      exerciseCount: number;
      supersetCount: number;
    }>;
  } | null;
  performanceSummary: string;
  recentPRs: string;
  riskFactors: string[];
  todayWorkout: string;
}

/**
 * Build a text summary of the trainer context for the AI prompt
 */
export function buildContextPrompt(ctx: TrainerContext): string {
  const lines: string[] = [];

  lines.push("## User Context\n");

  // Profile
  lines.push("### Profile");
  lines.push(`- Goals: ${ctx.profile.goals.join(", ") || "Not specified"}`);
  lines.push(`- Experience: ${ctx.profile.experience}`);
  lines.push(`- Training days/week: ${ctx.profile.trainingDaysPerWeek}`);
  lines.push("");

  // Current program
  if (ctx.currentProgram) {
    lines.push("### Current Program");
    lines.push(`Program: ${ctx.currentProgram.name}`);
    for (const day of ctx.currentProgram.trainingDays) {
      lines.push(
        `- ${day.name}: ${day.exerciseCount} exercises, ${day.supersetCount} supersets`
      );
    }
    lines.push("");
  }

  // Performance
  if (ctx.performanceSummary) {
    lines.push("### Performance (Last 4 Weeks)");
    lines.push(ctx.performanceSummary);
    lines.push("");
  }

  // PRs
  if (ctx.recentPRs) {
    lines.push("### Recent PRs");
    lines.push(ctx.recentPRs);
    lines.push("");
  }

  // Risk factors
  if (ctx.riskFactors.length > 0) {
    lines.push("### Risk Factors");
    for (const risk of ctx.riskFactors) {
      lines.push(`- ${risk}`);
    }
    lines.push("");
  }

  // Today
  lines.push("### Today");
  lines.push(`- Day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`);
  lines.push(`- Scheduled: ${ctx.todayWorkout}`);

  return lines.join("\n");
}

/**
 * Minimal workout log shape for context building (avoids importing full types)
 */
interface ContextWorkoutLog {
  date: string;
  dayName: string;
  duration: number | null;
  isComplete: boolean;
  sets: Array<{
    exerciseName: string;
    weight: number;
    actualReps: number;
    rpe?: number;
    supersetLabel?: string;
  }>;
}

/**
 * Build a minimal context from available data
 * This is the client-side version that uses whatever data is available
 */
export function buildMinimalContext(
  programName: string | null,
  trainingDays: Array<{ name: string; supersets: unknown[] }>,
  stats: {
    currentStreak: number;
    totalWorkouts: number;
    totalVolume?: number;
    totalSets?: number;
    totalReps?: number;
    thisWeekCount?: number;
    programDayCount?: number;
  } | null,
  recentPRs: Array<{ exerciseName: string; weight: number; reps: number; date?: string }>,
  userProfile?: { goals: string[]; experienceLevel: string | null; injuries: string[] },
  recentWorkouts?: ContextWorkoutLog[],
): TrainerContext {
  const performanceLines: string[] = [];
  if (stats) {
    performanceLines.push(`Current streak: ${stats.currentStreak} days`);
    performanceLines.push(`Total workouts: ${stats.totalWorkouts}`);
    if (stats.totalVolume) performanceLines.push(`Total volume: ${Math.round(stats.totalVolume).toLocaleString()}kg`);
    if (stats.totalSets) performanceLines.push(`Total sets: ${stats.totalSets}`);
    if (stats.totalReps) performanceLines.push(`Total reps: ${stats.totalReps}`);
    if (stats.thisWeekCount !== undefined) performanceLines.push(`This week: ${stats.thisWeekCount} sessions`);
  }

  // Format workout logs concisely: "Mar 5 (Full Body A): Bench Press 80kg x8,8,7 | Squat 120kg x10,9,8 | 45min"
  if (recentWorkouts?.length) {
    performanceLines.push("");
    performanceLines.push("Recent Workouts:");
    for (const w of recentWorkouts.slice(0, 10)) {
      const date = new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dur = w.duration ? `${Math.round(w.duration / 60)}min` : "";

      // Group sets by exercise, show weight x reps per set
      const exerciseMap = new Map<string, { weight: number; reps: number[] }>();
      for (const s of w.sets) {
        const key = s.exerciseName;
        const existing = exerciseMap.get(key);
        if (existing) {
          existing.reps.push(s.actualReps);
          existing.weight = Math.max(existing.weight, s.weight);
        } else {
          exerciseMap.set(key, { weight: s.weight, reps: [s.actualReps] });
        }
      }

      const exercises = Array.from(exerciseMap.entries())
        .slice(0, 4)
        .map(([name, data]) => `${name} ${data.weight}kg x${data.reps.join(",")}`)
        .join(" | ");

      performanceLines.push(`- ${date} (${w.dayName}): ${exercises}${dur ? ` | ${dur}` : ""}`);
    }
  }

  const prLines = recentPRs
    .slice(0, 5)
    .map((pr) => {
      const dateStr = pr.date
        ? ` (${new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
        : "";
      return `${pr.exerciseName}: ${pr.weight}kg x ${pr.reps}${dateStr}`;
    })
    .join("\n");

  const riskFactors: string[] = [];
  if (userProfile?.injuries?.length) {
    riskFactors.push(`Known injuries: ${userProfile.injuries.join(", ")}`);
  }

  return {
    profile: {
      goals: userProfile?.goals?.length ? userProfile.goals : ["Build muscle", "Progressive overload"],
      experience: userProfile?.experienceLevel || "Intermediate",
      trainingDaysPerWeek: trainingDays.length,
    },
    currentProgram: programName
      ? {
          name: programName,
          trainingDays: trainingDays.map((d) => ({
            name: d.name,
            exerciseCount: (d.supersets as Array<{ exercises: unknown[] }>).reduce(
              (sum, ss) => sum + ss.exercises.length,
              0
            ),
            supersetCount: d.supersets.length,
          })),
        }
      : null,
    performanceSummary: performanceLines.join("\n"),
    recentPRs: prLines || "No recent PRs",
    riskFactors,
    todayWorkout: trainingDays[0]?.name || "Rest day",
  };
}
