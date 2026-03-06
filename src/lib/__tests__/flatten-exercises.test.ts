import { describe, it, expect } from "vitest";
import { flattenSupersets, toWorkoutState } from "../flatten-exercises";
import type { Superset } from "@/lib/api-client";

const mockSupersets: Superset[] = [
  {
    id: "ss-a",
    label: "A",
    exercises: [
      { exerciseId: "ex-1", sets: 4, reps: "10", tempo: "T:30A1", restSeconds: 60 },
      { exerciseId: "ex-2", sets: 4, reps: "12", tempo: "T:20A1", restSeconds: 60 },
    ],
  },
  {
    id: "ss-b",
    label: "B",
    exercises: [
      { exerciseId: "ex-3", sets: 3, reps: "8-10", tempo: "", restSeconds: 90 },
    ],
  },
];

describe("flattenSupersets", () => {
  it("flattens supersets into linear list", () => {
    const result = flattenSupersets(mockSupersets);
    expect(result).toHaveLength(3);
    expect(result[0].exerciseId).toBe("ex-1");
    expect(result[1].exerciseId).toBe("ex-2");
    expect(result[2].exerciseId).toBe("ex-3");
  });

  it("preserves superset metadata", () => {
    const result = flattenSupersets(mockSupersets);
    expect(result[0].supersetLabel).toBe("A");
    expect(result[0].supersetSize).toBe(2);
    expect(result[0].indexInSuperset).toBe(0);
    expect(result[1].indexInSuperset).toBe(1);
    expect(result[2].supersetLabel).toBe("B");
    expect(result[2].supersetSize).toBe(1);
  });

  it("assigns sequential globalIndex", () => {
    const result = flattenSupersets(mockSupersets);
    expect(result.map((r) => r.globalIndex)).toEqual([0, 1, 2]);
  });

  it("handles empty supersets", () => {
    expect(flattenSupersets([])).toEqual([]);
  });

  it("preserves exercise details", () => {
    const result = flattenSupersets(mockSupersets);
    expect(result[0].sets).toBe(4);
    expect(result[0].reps).toBe("10");
    expect(result[2].reps).toBe("8-10");
    expect(result[2].restSeconds).toBe(90);
  });
});

describe("toWorkoutState", () => {
  const flat = flattenSupersets(mockSupersets);

  it("maps first exercise correctly", () => {
    const state = toWorkoutState(0, flat);
    expect(state.supersetIndex).toBe(0);
    expect(state.exerciseIndex).toBe(0);
  });

  it("maps second exercise in superset", () => {
    const state = toWorkoutState(1, flat);
    expect(state.supersetIndex).toBe(0);
    expect(state.exerciseIndex).toBe(1);
  });

  it("maps exercise in second superset", () => {
    const state = toWorkoutState(2, flat);
    expect(state.supersetIndex).toBe(1);
    expect(state.exerciseIndex).toBe(0);
  });

  it("handles out of bounds gracefully", () => {
    const state = toWorkoutState(99, flat);
    expect(state.supersetIndex).toBe(0);
    expect(state.exerciseIndex).toBe(0);
  });
});
