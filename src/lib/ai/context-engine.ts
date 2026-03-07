/**
 * Context Engine for AI Personal Trainer
 * Aggregates all user data into a structured context for the AI
 */

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
