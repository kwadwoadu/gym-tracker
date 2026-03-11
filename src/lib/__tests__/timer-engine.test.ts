import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TimerEngine, type TimerConfig, type TimerCallbacks } from "../timer-engine";

function makeCallbacks(): TimerCallbacks {
  return {
    onTick: vi.fn(),
    onPhaseChange: vi.fn(),
    onComplete: vi.fn(),
    onWarning: vi.fn(),
  };
}

describe("TimerEngine", () => {
  let engine: TimerEngine | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    engine?.stop();
    engine = null;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("factory methods", () => {
    it("tabata returns 20s work / 10s rest / 8 rounds", () => {
      const config = TimerEngine.tabata();
      expect(config).toEqual({ mode: "tabata", workSeconds: 20, restSeconds: 10, rounds: 8 });
    });

    it("emom returns correct config", () => {
      const config = TimerEngine.emom(60, 10);
      expect(config).toEqual({ mode: "emom", workSeconds: 60, restSeconds: 0, rounds: 10 });
    });

    it("amrap converts minutes to seconds", () => {
      const config = TimerEngine.amrap(12);
      expect(config.totalSeconds).toBe(720);
      expect(config.mode).toBe("amrap");
    });

    it("custom returns provided values", () => {
      const config = TimerEngine.custom(45, 15, 5);
      expect(config).toEqual({ mode: "custom", workSeconds: 45, restSeconds: 15, rounds: 5 });
    });
  });

  describe("initial state", () => {
    it("starts in idle phase", () => {
      const engine = new TimerEngine(TimerEngine.tabata(), makeCallbacks());
      const state = engine.getState();
      expect(state.phase).toBe("idle");
      expect(state.isRunning).toBe(false);
      expect(state.currentRound).toBe(1);
    });

    it("AMRAP uses totalSeconds for initial countdown", () => {
      const engine = new TimerEngine(TimerEngine.amrap(5), makeCallbacks());
      expect(engine.getState().secondsRemaining).toBe(300);
    });

    it("non-AMRAP uses workSeconds for initial countdown", () => {
      const engine = new TimerEngine(TimerEngine.tabata(), makeCallbacks());
      expect(engine.getState().secondsRemaining).toBe(20);
    });
  });

  describe("start", () => {
    it("transitions to work phase", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.tabata(), cb);
      engine.start();
      expect(engine.getState().phase).toBe("work");
      expect(engine.getState().isRunning).toBe(true);
      expect(cb.onPhaseChange).toHaveBeenCalledWith("work", 1);
    });

    it("does nothing if already running", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.tabata(), cb);
      engine.start();
      engine.start(); // second call
      expect(cb.onPhaseChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("pause and resume", () => {
    it("pause stops ticking", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.custom(60, 0, 1), cb);
      engine.start();
      engine.pause();
      expect(engine.getState().isPaused).toBe(true);
    });

    it("resume continues from paused state", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.custom(60, 0, 1), cb);
      engine.start();
      engine.pause();
      engine.resume();
      expect(engine.getState().isPaused).toBe(false);
      expect(engine.getState().isRunning).toBe(true);
    });

    it("resume does nothing if not paused", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.custom(60, 0, 1), cb);
      engine.start();
      const tickCountBefore = cb.onTick.mock.calls.length;
      engine.resume(); // not paused
      expect(cb.onTick.mock.calls.length).toBe(tickCountBefore);
    });
  });

  describe("reset", () => {
    it("returns to initial state", () => {
      const cb = makeCallbacks();
      engine = new TimerEngine(TimerEngine.tabata(), cb);
      engine.start();
      engine.reset();
      const state = engine.getState();
      expect(state.phase).toBe("idle");
      expect(state.isRunning).toBe(false);
      expect(state.currentRound).toBe(1);
      expect(state.secondsRemaining).toBe(20);
    });
  });

  describe("stop", () => {
    it("stops the timer without resetting", () => {
      engine = new TimerEngine(TimerEngine.tabata(), makeCallbacks());
      engine.start();
      engine.stop();
      expect(engine.getState().isRunning).toBe(false);
      expect(engine.getState().phase).toBe("work"); // phase preserved
    });
  });
});
