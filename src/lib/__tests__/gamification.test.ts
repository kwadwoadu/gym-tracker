import { describe, it, expect } from "vitest";
import {
  getXPForLevel,
  getTotalXPForLevel,
  getLevelFromXP,
  getLevelInfo,
  getTierFromLevel,
  getStreakMultiplier,
  calculateXPWithMultiplier,
  XP_REWARDS,
} from "../gamification";

describe("XP System", () => {
  describe("getXPForLevel", () => {
    it("level 1 requires 100 XP", () => {
      expect(getXPForLevel(1)).toBe(100);
    });

    it("higher levels require more XP (exponential)", () => {
      const level5 = getXPForLevel(5);
      const level10 = getXPForLevel(10);
      expect(level10).toBeGreaterThan(level5);
    });

    it("grows by ~15% per level", () => {
      const ratio = getXPForLevel(2) / getXPForLevel(1);
      expect(ratio).toBeCloseTo(1.15, 1);
    });
  });

  describe("getTotalXPForLevel", () => {
    it("level 1 requires 0 total XP", () => {
      expect(getTotalXPForLevel(1)).toBe(0);
    });

    it("level 2 requires 100 total XP", () => {
      expect(getTotalXPForLevel(2)).toBe(100);
    });

    it("total XP is cumulative", () => {
      const total3 = getTotalXPForLevel(3);
      expect(total3).toBe(getXPForLevel(1) + getXPForLevel(2));
    });
  });

  describe("getLevelFromXP", () => {
    it("0 XP is level 1", () => {
      expect(getLevelFromXP(0)).toBe(1);
    });

    it("99 XP is still level 1", () => {
      expect(getLevelFromXP(99)).toBe(1);
    });

    it("100 XP reaches level 2", () => {
      expect(getLevelFromXP(100)).toBe(2);
    });
  });

  describe("getLevelInfo", () => {
    it("returns tier info for level 1", () => {
      const info = getLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.title).toBe("Novice");
    });

    it("tracks progress within level", () => {
      const info = getLevelInfo(50);
      expect(info.level).toBe(1);
      expect(info.xpInLevel).toBe(50);
      expect(info.progress).toBeCloseTo(0.5, 1);
    });
  });

  describe("getTierFromLevel", () => {
    it("level 1 is Novice", () => {
      expect(getTierFromLevel(1).title).toBe("Novice");
    });

    it("level 10 is Regular", () => {
      expect(getTierFromLevel(10).title).toBe("Regular");
    });

    it("level 51 is Legend", () => {
      expect(getTierFromLevel(51).title).toBe("Legend");
    });
  });

  describe("getStreakMultiplier", () => {
    it("0 days streak gives 1.0x", () => {
      expect(getStreakMultiplier(0).multiplier).toBe(1.0);
    });

    it("7 day streak gives 1.2x", () => {
      expect(getStreakMultiplier(7).multiplier).toBe(1.2);
    });

    it("30 day streak gives 2.0x", () => {
      expect(getStreakMultiplier(30).multiplier).toBe(2.0);
    });

    it("60 day streak gives 2.5x", () => {
      expect(getStreakMultiplier(60).multiplier).toBe(2.5);
    });
  });

  describe("calculateXPWithMultiplier", () => {
    it("no streak gives base XP", () => {
      expect(calculateXPWithMultiplier(100, 0)).toBe(100);
    });

    it("7-day streak gives 1.2x", () => {
      expect(calculateXPWithMultiplier(100, 7)).toBe(120);
    });

    it("60-day streak gives 2.5x", () => {
      expect(calculateXPWithMultiplier(100, 60)).toBe(250);
    });
  });

  describe("XP_REWARDS constants", () => {
    it("workout complete awards 100 XP", () => {
      expect(XP_REWARDS.WORKOUT_COMPLETE).toBe(100);
    });

    it("PR set awards 50 XP", () => {
      expect(XP_REWARDS.PR_SET).toBe(50);
    });

    it("all sets complete awards 25 XP", () => {
      expect(XP_REWARDS.ALL_SETS_COMPLETE).toBe(25);
    });
  });
});
