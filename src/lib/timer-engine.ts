/**
 * Timer engine supporting AMRAP, EMOM, Tabata, and Custom interval modes.
 * Uses wall-clock tracking for accuracy over long durations.
 */

export type TimerMode = "rest" | "amrap" | "emom" | "tabata" | "custom";
export type TimerPhase = "idle" | "work" | "rest" | "complete";

export interface TimerConfig {
  mode: TimerMode;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  totalSeconds?: number; // For AMRAP (single countdown)
}

export interface TimerState {
  phase: TimerPhase;
  currentRound: number;
  totalRounds: number;
  secondsRemaining: number;
  totalSecondsInPhase: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface TimerCallbacks {
  onTick: (state: TimerState) => void;
  onPhaseChange: (phase: TimerPhase, round: number) => void;
  onComplete: () => void;
  onWarning: (secondsLeft: number) => void;
}

const WARNING_SECONDS = [10, 5, 3, 2, 1];

export class TimerEngine {
  private config: TimerConfig;
  private state: TimerState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private phaseStartTime: number = 0;
  private phaseStartSeconds: number = 0;
  private callbacks: TimerCallbacks;
  private firedWarnings = new Set<number>();

  constructor(config: TimerConfig, callbacks: TimerCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.state = this.getInitialState();
  }

  private getInitialState(): TimerState {
    const isAMRAP = this.config.mode === "amrap";
    const seconds = isAMRAP
      ? this.config.totalSeconds || 300
      : this.config.workSeconds;
    return {
      phase: "idle",
      currentRound: 1,
      totalRounds: this.config.rounds,
      secondsRemaining: seconds,
      totalSecondsInPhase: seconds,
      isRunning: false,
      isPaused: false,
    };
  }

  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.phase = "work";
    this.firedWarnings.clear();

    this.phaseStartTime = performance.now();
    this.phaseStartSeconds = this.state.secondsRemaining;

    this.callbacks.onPhaseChange(this.state.phase, this.state.currentRound);
    this.startInterval();
  }

  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    this.clearInterval();
    this.callbacks.onTick({ ...this.state });
  }

  resume(): void {
    if (!this.state.isPaused) return;
    this.state.isPaused = false;
    this.phaseStartTime = performance.now();
    this.phaseStartSeconds = this.state.secondsRemaining;
    this.firedWarnings.clear();
    this.startInterval();
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.clearInterval();
  }

  reset(): void {
    this.stop();
    this.state = this.getInitialState();
    this.firedWarnings.clear();
    this.callbacks.onTick({ ...this.state });
  }

  getState(): TimerState {
    return { ...this.state };
  }

  private startInterval(): void {
    this.clearInterval();
    this.intervalId = setInterval(() => this.tick(), 100);
  }

  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    const elapsed = (performance.now() - this.phaseStartTime) / 1000;
    const remaining = Math.max(
      0,
      Math.ceil(this.phaseStartSeconds - elapsed)
    );

    // Only update if second changed
    if (remaining === this.state.secondsRemaining) return;

    this.state.secondsRemaining = remaining;

    // Warning cues
    for (const w of WARNING_SECONDS) {
      if (remaining === w && !this.firedWarnings.has(w)) {
        this.firedWarnings.add(w);
        this.callbacks.onWarning(w);
      }
    }

    if (remaining <= 0) {
      this.handlePhaseEnd();
    }

    this.callbacks.onTick({ ...this.state });
  }

  private handlePhaseEnd(): void {
    this.firedWarnings.clear();

    if (this.config.mode === "amrap") {
      this.state.phase = "complete";
      this.stop();
      this.callbacks.onComplete();
      return;
    }

    if (this.state.phase === "work") {
      if (this.config.restSeconds > 0) {
        this.state.phase = "rest";
        this.state.secondsRemaining = this.config.restSeconds;
        this.state.totalSecondsInPhase = this.config.restSeconds;
        this.resetPhaseTimer(this.config.restSeconds);
      } else {
        this.advanceRound();
      }
    } else if (this.state.phase === "rest") {
      this.advanceRound();
    }

    if (this.state.phase !== "complete") {
      this.callbacks.onPhaseChange(this.state.phase, this.state.currentRound);
    }
  }

  private advanceRound(): void {
    if (this.state.currentRound >= this.config.rounds) {
      this.state.phase = "complete";
      this.stop();
      this.callbacks.onComplete();
      return;
    }

    this.state.currentRound++;
    this.state.phase = "work";
    this.state.secondsRemaining = this.config.workSeconds;
    this.state.totalSecondsInPhase = this.config.workSeconds;
    this.resetPhaseTimer(this.config.workSeconds);
  }

  private resetPhaseTimer(seconds: number): void {
    this.phaseStartTime = performance.now();
    this.phaseStartSeconds = seconds;
  }

  // Factory methods
  static tabata(): TimerConfig {
    return { mode: "tabata", workSeconds: 20, restSeconds: 10, rounds: 8 };
  }

  static emom(intervalSeconds: number, rounds: number): TimerConfig {
    return { mode: "emom", workSeconds: intervalSeconds, restSeconds: 0, rounds };
  }

  static amrap(minutes: number): TimerConfig {
    return {
      mode: "amrap",
      workSeconds: 0,
      restSeconds: 0,
      rounds: 1,
      totalSeconds: minutes * 60,
    };
  }

  static custom(
    workSeconds: number,
    restSeconds: number,
    rounds: number
  ): TimerConfig {
    return { mode: "custom", workSeconds, restSeconds, rounds };
  }
}
