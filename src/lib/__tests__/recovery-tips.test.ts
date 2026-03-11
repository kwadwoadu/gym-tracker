import { describe, it, expect } from "vitest";
import { getRecoveryTips, getMuscleGroupsFromWorkout } from "../recovery-tips";

describe("getRecoveryTips", () => {
  it("returns tips for trained muscle groups", () => {
    const tips = getRecoveryTips(["chest"]);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0].title).toBe("Doorway Chest Stretch");
  });

  it("returns max 3 tips", () => {
    const tips = getRecoveryTips(["chest", "back", "shoulders", "quads"]);
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it("deduplicates tips shared across muscle groups", () => {
    // "back" and "shoulders" share "Child's Pose"
    const tips = getRecoveryTips(["back", "shoulders"]);
    const titles = tips.map((t) => t.title);
    const unique = new Set(titles);
    expect(titles.length).toBe(unique.size);
  });

  it("returns empty array for unknown muscle groups", () => {
    const tips = getRecoveryTips(["unknown_muscle"]);
    expect(tips).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    const tips = getRecoveryTips([]);
    expect(tips).toEqual([]);
  });
});

describe("getMuscleGroupsFromWorkout", () => {
  it("extracts unique muscle groups from exercise sets", () => {
    const sets = [
      { exerciseId: "ex1" },
      { exerciseId: "ex2" },
      { exerciseId: "ex1" }, // duplicate
    ];
    const exerciseMap = new Map([
      ["ex1", { muscleGroups: ["chest", "triceps"] }],
      ["ex2", { muscleGroups: ["chest", "shoulders"] }],
    ]);
    const result = getMuscleGroupsFromWorkout(sets, exerciseMap);
    expect(result.sort()).toEqual(["chest", "shoulders", "triceps"]);
  });

  it("skips exercises not in map", () => {
    const sets = [{ exerciseId: "missing" }];
    const exerciseMap = new Map<string, { muscleGroups: string[] }>();
    expect(getMuscleGroupsFromWorkout(sets, exerciseMap)).toEqual([]);
  });
});
