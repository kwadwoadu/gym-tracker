import { describe, it, expect } from "vitest";
import { getNextTrainingDay } from "../next-day";
import type { TrainingDay, WorkoutLog } from "../api-client";

function makeDay(id: string, name: string, dayNumber: number): TrainingDay {
  return {
    id,
    name,
    dayNumber,
    programId: "prog1",
    warmup: [],
    supersets: [],
    finisher: [],
  };
}

function makeLog(dayId: string, date: string, isComplete: boolean): WorkoutLog {
  return {
    id: `log-${dayId}-${date}`,
    date,
    dayId,
    dayName: "",
    startTime: "",
    endTime: null,
    duration: null,
    notes: null,
    isComplete,
    programId: "prog1",
    userId: "user1",
    sets: [],
  };
}

const days = [
  makeDay("day1", "Day 1", 0),
  makeDay("day2", "Day 2", 1),
  makeDay("day3", "Day 3", 2),
];

describe("getNextTrainingDay", () => {
  it("returns null for empty days array", () => {
    expect(getNextTrainingDay([], [])).toBeNull();
  });

  it("returns first day when no workout history", () => {
    expect(getNextTrainingDay(days, [])).toEqual(days[0]);
  });

  it("returns next day after last completed workout", () => {
    const logs = [makeLog("day1", "2026-03-07", true)];
    expect(getNextTrainingDay(days, logs)).toEqual(days[1]);
  });

  it("wraps around to first day after last day", () => {
    const logs = [makeLog("day3", "2026-03-07", true)];
    expect(getNextTrainingDay(days, logs)).toEqual(days[0]);
  });

  it("ignores incomplete workouts", () => {
    const logs = [makeLog("day2", "2026-03-07", false)];
    expect(getNextTrainingDay(days, logs)).toEqual(days[0]);
  });

  it("uses most recent completed workout by date", () => {
    const logs = [
      makeLog("day1", "2026-03-05", true),
      makeLog("day2", "2026-03-07", true),
    ];
    expect(getNextTrainingDay(days, logs)).toEqual(days[2]);
  });

  it("falls back to first day if last dayId not found", () => {
    const logs = [makeLog("deleted-day", "2026-03-07", true)];
    expect(getNextTrainingDay(days, logs)).toEqual(days[0]);
  });
});
