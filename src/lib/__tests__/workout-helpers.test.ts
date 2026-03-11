import { describe, it, expect } from "vitest";
import { calculateTotalVolume } from "../workout-helpers";
import type { SetLog } from "../api-client";

// Helper to create a SetLog for testing
function makeSetLog(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: `set-${Date.now()}`,
    exerciseId: "bench-press",
    exerciseName: "Bench Press",
    supersetLabel: "A",
    setNumber: 1,
    targetReps: 10,
    actualReps: 10,
    weight: 80,
    unit: "kg",
    isComplete: true,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("calculateTotalVolume", () => {
  it("returns 0 for empty sets", () => {
    expect(calculateTotalVolume([])).toBe(0);
  });

  it("calculates volume for a single set", () => {
    const sets = [makeSetLog({ weight: 80, actualReps: 10 })];
    expect(calculateTotalVolume(sets)).toBe(800);
  });

  it("calculates volume across multiple sets", () => {
    const sets = [
      makeSetLog({ weight: 80, actualReps: 10 }),
      makeSetLog({ weight: 80, actualReps: 8 }),
      makeSetLog({ weight: 85, actualReps: 6 }),
    ];
    // 80*10 + 80*8 + 85*6 = 800 + 640 + 510 = 1950
    expect(calculateTotalVolume(sets)).toBe(1950);
  });

  it("handles zero weight sets (bodyweight exercises)", () => {
    const sets = [makeSetLog({ weight: 0, actualReps: 15 })];
    expect(calculateTotalVolume(sets)).toBe(0);
  });

  it("handles zero rep sets (skipped)", () => {
    const sets = [makeSetLog({ weight: 80, actualReps: 0 })];
    expect(calculateTotalVolume(sets)).toBe(0);
  });
});

/**
 * Test the next-position calculation logic used in handleSetComplete.
 * Extracted as a pure function for testability.
 */
function calculateNextPosition(
  currentSupersetIndex: number,
  currentExerciseIndex: number,
  currentSetNumber: number,
  exercisesInSuperset: number,
  totalSets: number,
  totalSupersets: number,
  focusMode: boolean
): { supersetIndex: number; exerciseIndex: number; setNumber: number } | "done" {
  let nextSupersetIndex = currentSupersetIndex;
  let nextExerciseIndex = currentExerciseIndex;
  let nextSetNumber = currentSetNumber;

  if (focusMode) {
    nextSetNumber++;
    if (nextSetNumber > totalSets) {
      nextExerciseIndex++;
      nextSetNumber = 1;
      if (nextExerciseIndex >= exercisesInSuperset) {
        nextExerciseIndex = 0;
        nextSupersetIndex++;
        if (nextSupersetIndex >= totalSupersets) return "done";
      }
    }
  } else {
    nextExerciseIndex++;
    if (nextExerciseIndex >= exercisesInSuperset) {
      nextExerciseIndex = 0;
      nextSetNumber++;
      if (nextSetNumber > totalSets) {
        nextSetNumber = 1;
        nextSupersetIndex++;
        if (nextSupersetIndex >= totalSupersets) return "done";
      }
    }
  }

  return {
    supersetIndex: nextSupersetIndex,
    exerciseIndex: nextExerciseIndex,
    setNumber: nextSetNumber,
  };
}

describe("calculateNextPosition - normal mode", () => {
  // Superset A with 2 exercises (A1, A2), 4 sets each, 3 total supersets
  const exercisesInSuperset = 2;
  const totalSets = 4;
  const totalSupersets = 3;
  const focusMode = false;

  it("alternates: A1S1 -> A2S1", () => {
    const result = calculateNextPosition(0, 0, 1, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 1, setNumber: 1 });
  });

  it("wraps exercise and increments set: A2S1 -> A1S2", () => {
    const result = calculateNextPosition(0, 1, 1, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 0, setNumber: 2 });
  });

  it("last set of superset moves to next superset: A2S4 -> B1S1", () => {
    const result = calculateNextPosition(0, 1, 4, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 1, exerciseIndex: 0, setNumber: 1 });
  });

  it("last superset last set returns done", () => {
    const result = calculateNextPosition(2, 1, 4, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toBe("done");
  });

  it("single exercise superset increments set directly", () => {
    const result = calculateNextPosition(0, 0, 1, 1, totalSets, totalSupersets, false);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 0, setNumber: 2 });
  });
});

describe("calculateNextPosition - focus mode", () => {
  const exercisesInSuperset = 2;
  const totalSets = 4;
  const totalSupersets = 3;
  const focusMode = true;

  it("focus: A1S1 -> A1S2 (same exercise, next set)", () => {
    const result = calculateNextPosition(0, 0, 1, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 0, setNumber: 2 });
  });

  it("focus: A1S4 -> A2S1 (all sets done, move to next exercise)", () => {
    const result = calculateNextPosition(0, 0, 4, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 1, setNumber: 1 });
  });

  it("focus: A2S4 -> B1S1 (all exercises done, move to next superset)", () => {
    const result = calculateNextPosition(0, 1, 4, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toEqual({ supersetIndex: 1, exerciseIndex: 0, setNumber: 1 });
  });

  it("focus: last superset last exercise last set returns done", () => {
    const result = calculateNextPosition(2, 1, 4, exercisesInSuperset, totalSets, totalSupersets, focusMode);
    expect(result).toBe("done");
  });

  it("focus: single exercise superset behaves same as normal", () => {
    const result = calculateNextPosition(0, 0, 1, 1, totalSets, totalSupersets, true);
    expect(result).toEqual({ supersetIndex: 0, exerciseIndex: 0, setNumber: 2 });
  });
});

describe("traversal sequence - full workout simulation", () => {
  it("normal mode: 2 exercises x 3 sets produces correct sequence", () => {
    const sequence: string[] = [];
    let state = { supersetIndex: 0, exerciseIndex: 0, setNumber: 1 };

    for (let i = 0; i < 6; i++) {
      sequence.push(`E${state.exerciseIndex + 1}S${state.setNumber}`);
      const next = calculateNextPosition(
        state.supersetIndex, state.exerciseIndex, state.setNumber,
        2, 3, 1, false
      );
      if (next === "done") break;
      state = next;
    }

    // Normal: E1S1, E2S1, E1S2, E2S2, E1S3, E2S3
    expect(sequence).toEqual(["E1S1", "E2S1", "E1S2", "E2S2", "E1S3", "E2S3"]);
  });

  it("focus mode: 2 exercises x 3 sets produces correct sequence", () => {
    const sequence: string[] = [];
    let state = { supersetIndex: 0, exerciseIndex: 0, setNumber: 1 };

    for (let i = 0; i < 6; i++) {
      sequence.push(`E${state.exerciseIndex + 1}S${state.setNumber}`);
      const next = calculateNextPosition(
        state.supersetIndex, state.exerciseIndex, state.setNumber,
        2, 3, 1, true
      );
      if (next === "done") break;
      state = next;
    }

    // Focus: E1S1, E1S2, E1S3, E2S1, E2S2, E2S3
    expect(sequence).toEqual(["E1S1", "E1S2", "E1S3", "E2S1", "E2S2", "E2S3"]);
  });
});
