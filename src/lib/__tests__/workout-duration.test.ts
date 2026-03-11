import { describe, it, expect } from "vitest";
import { estimateWorkoutDuration, countExercises, countSupersets } from "../workout-duration";
import type { TrainingDay } from "../api-client";

function makeDay(opts: {
  warmup?: number;
  supersets?: Array<{ exercises: Array<{ sets: number; restSeconds?: number }> }>;
  finisher?: number;
}): TrainingDay {
  return {
    id: "test-day",
    name: "Test Day",
    dayNumber: 1,
    programId: "prog1",
    warmup: Array.from({ length: opts.warmup || 0 }, (_, i) => ({
      exerciseId: `w${i}`,
      reps: 10,
    })),
    supersets: (opts.supersets || []).map((ss, i) => ({
      id: `ss${i}`,
      label: String.fromCharCode(65 + i),
      exercises: ss.exercises.map((ex, j) => ({
        exerciseId: `e${i}${j}`,
        sets: ex.sets,
        reps: "8-12",
        restSeconds: ex.restSeconds,
      })),
    })),
    finisher: Array.from({ length: opts.finisher || 0 }, (_, i) => ({
      exerciseId: `f${i}`,
      duration: 30,
    })),
  };
}

describe("estimateWorkoutDuration", () => {
  it("returns 0 for empty day", () => {
    const day = makeDay({});
    expect(estimateWorkoutDuration(day)).toBe(0);
  });

  it("includes warmup time at 1.5min per exercise", () => {
    const day = makeDay({ warmup: 4 });
    expect(estimateWorkoutDuration(day)).toBe(6); // 4 * 1.5 = 6
  });

  it("calculates exercise time from sets and rest", () => {
    const day = makeDay({
      supersets: [{ exercises: [{ sets: 3, restSeconds: 60 }] }],
    });
    // setTime = 3 * 1.5 = 4.5, restTime = 3 * (60/60) = 3, total = 7.5 -> 8
    expect(estimateWorkoutDuration(day)).toBe(8);
  });

  it("uses 90s default rest when not specified", () => {
    const day = makeDay({
      supersets: [{ exercises: [{ sets: 2 }] }],
    });
    // setTime = 2 * 1.5 = 3, restTime = 2 * (90/60) = 3, total = 6
    expect(estimateWorkoutDuration(day)).toBe(6);
  });

  it("includes finisher time at 3min each", () => {
    const day = makeDay({ finisher: 2 });
    expect(estimateWorkoutDuration(day)).toBe(6); // 2 * 3 = 6
  });
});

describe("countExercises", () => {
  it("counts exercises across supersets", () => {
    const day = makeDay({
      supersets: [
        { exercises: [{ sets: 3 }, { sets: 3 }] },
        { exercises: [{ sets: 4 }] },
      ],
    });
    expect(countExercises(day)).toBe(3);
  });

  it("returns 0 for empty supersets", () => {
    const day = makeDay({});
    expect(countExercises(day)).toBe(0);
  });
});

describe("countSupersets", () => {
  it("counts supersets", () => {
    const day = makeDay({
      supersets: [
        { exercises: [{ sets: 3 }] },
        { exercises: [{ sets: 3 }] },
      ],
    });
    expect(countSupersets(day)).toBe(2);
  });
});
