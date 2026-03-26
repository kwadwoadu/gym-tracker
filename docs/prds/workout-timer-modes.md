# Workout Timer Modes

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

SetFlow's current timer system only supports a single mode: fixed rest timers between sets. While this works well for traditional strength training (3x10 bench press, rest 90s, repeat), it fails to support popular training methodologies that rely on time-based protocols:

1. **AMRAP (As Many Reps As Possible)** - Used in CrossFit, conditioning finishers, and endurance blocks. User needs a countdown timer while performing max reps. Currently impossible to track in SetFlow.

2. **EMOM (Every Minute On the Minute)** - Used for power development and conditioning. User performs a prescribed movement at the start of each minute, resting for the remainder. Requires auto-starting each interval. Currently requires an external timer app.

3. **Tabata** - The classic 20s work / 10s rest protocol for 8 rounds. Extremely common for finishers and conditioning. The fixed cadence needs precise audio cues. Users currently run a separate Tabata app alongside SetFlow.

4. **Custom Intervals** - HIIT, circuit training, and sport-specific conditioning use varied work/rest ratios (30s/30s, 40s/20s, 45s/15s). No way to configure these in SetFlow.

The result: users leave SetFlow open for their main workout but switch to a separate timer app for conditioning work, breaking the session flow and losing data continuity.

---

## 2. Solution

Extend the existing rest timer system with a mode selector that supports four timer protocols:

### Mode Selector
A horizontal picker at the top of the timer screen allowing users to switch between:
- **Rest** (current default) - Standard countdown between sets
- **AMRAP** - Countdown clock for max effort
- **EMOM** - Auto-repeating minute intervals
- **Tabata** - 20/10 protocol with round counter
- **Custom** - User-defined work/rest intervals

### Unified Timer Experience
All modes share the same circular timer visualization (existing UI) but with mode-specific behavior:
- Color coding: Rest (lime), AMRAP (orange), EMOM (blue), Tabata (red), Custom (purple)
- Audio cues via existing Web Audio API system
- Mode-specific data logging to workout history

### Integration with Workout Flow
Timer modes are accessible during an active workout session. Users can:
- Use AMRAP/Tabata for finisher exercises
- Switch between Rest and EMOM within the same session
- Log results (reps completed, rounds completed) after each timed block

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Timer mode usage | 25% of workout sessions use a non-rest timer mode | Track mode selections per session |
| AMRAP adoption | 15% of finisher exercises use AMRAP mode | Track AMRAP starts on finisher exercises |
| EMOM adoption | 10% of sessions include at least one EMOM block | Track EMOM starts |
| Tabata adoption | 10% of sessions include a Tabata block | Track Tabata starts |
| External timer app usage | Reduce to near 0 (currently ~30% of sessions) | User survey before/after |
| Session continuity | 90% of conditioning work logged in SetFlow | Track timer completions vs manual skips |

---

## 4. Requirements

### Must Have
- [ ] Mode selector on timer screen: Rest, AMRAP, EMOM, Tabata, Custom
- [ ] AMRAP mode: single countdown timer (user sets duration: 1-30 minutes), rep logging after completion
- [ ] EMOM mode: repeating 60-second intervals (configurable 30s-120s), auto-start each interval, round counter
- [ ] Tabata mode: 20s work / 10s rest for 8 rounds, work/rest phase indicator, round counter
- [ ] Custom mode: user sets work duration, rest duration, and number of rounds
- [ ] Audio cues for all modes: start, transition (work-to-rest), warning (10s/5s/3s), complete
- [ ] Visual distinction per mode (color-coded timer ring)
- [ ] Results logging: reps (AMRAP), rounds completed (EMOM/Tabata/Custom)

### Should Have
- [ ] Haptic feedback on phase transitions (iOS)
- [ ] Large phase indicator text ("WORK" / "REST") visible from a distance
- [ ] Pause/resume for all modes
- [ ] Saved custom presets (user creates and reuses interval patterns)
- [ ] Timer mode suggestion based on exercise type (e.g., finisher suggests Tabata)
- [ ] Fullscreen mode for better gym visibility
- [ ] Background audio cues when screen is locked (Web Audio API + keep-alive)

### Won't Have (this version)
- Complex interval programming (pyramids, ladders)
- Group/partner timer sync
- Heart rate zone targeting during intervals
- Video overlay during timer
- Timer sharing between users

---

## 5. User Flow

### Flow 1: AMRAP Finisher
1. User reaches finisher exercise in workout
2. Timer screen shows mode selector
3. User taps "AMRAP"
4. Sets duration: 5 minutes
5. Timer ring turns orange, shows "5:00"
6. User taps "GO"
7. Countdown begins: 4:59, 4:58...
8. At 10s remaining: warning beeps
9. At 0:00: completion alarm
10. Prompt appears: "Reps completed?"
11. User enters 47 reps
12. Logged to workout: "Burpees - AMRAP 5min - 47 reps"

### Flow 2: EMOM Session
1. User selects an exercise for EMOM training
2. Taps "EMOM" on timer mode selector
3. Configures: 60s intervals, 10 rounds
4. Display shows: "Round 1/10 - 60s"
5. User taps "GO"
6. Performs reps, rests for remainder of minute
7. At 5s: "Get ready" audio cue
8. At 0s: "GO" audio cue, timer auto-resets to 60s
9. Round counter: "Round 2/10"
10. After 10 rounds: completion screen
11. Logged: "Clean & Press - EMOM 10x60s"

### Flow 3: Tabata Protocol
1. User selects finisher exercise
2. Taps "Tabata" on mode selector
3. Screen shows: "8 rounds - 20s work / 10s rest"
4. Timer ring turns red
5. User taps "GO"
6. "WORK" phase: 20s countdown with red ring
7. Audio: 3-2-1 countdown to transition
8. "REST" phase: 10s countdown with green ring
9. Round counter updates: "Round 2/8"
10. After 8 rounds: completion alarm
11. Total time: 4 minutes logged

### Flow 4: Custom Intervals
1. User taps "Custom" on mode selector
2. Configures: 40s work, 20s rest, 6 rounds
3. (Optional) saves preset: "HIIT 40/20"
4. Taps "GO"
5. Alternating work/rest phases with audio cues
6. Round counter and phase indicator
7. After 6 rounds: completion
8. Logged: "Mountain Climbers - Custom 6x40s/20s"

### Flow 5: Saved Presets
1. User taps "Custom" mode
2. Sees saved presets: "HIIT 40/20", "Circuit 30/30", "Sprint 15/45"
3. Taps "HIIT 40/20"
4. Settings auto-fill: 40s work, 20s rest, 6 rounds
5. User adjusts rounds to 8, taps "GO"

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `TimerModeSelector` | Horizontal pill selector for timer modes |
| `AMRAPTimer` | AMRAP countdown with rep logging |
| `EMOMTimer` | Auto-repeating interval timer with round counter |
| `TabataTimer` | 20/10 protocol with work/rest phases |
| `CustomIntervalTimer` | Configurable work/rest/rounds timer |
| `IntervalConfig` | Settings form for interval parameters |
| `PhaseIndicator` | Large "WORK" / "REST" text overlay |
| `RoundCounter` | Current round / total rounds display |
| `RepLogPrompt` | Post-timer rep count entry |
| `PresetManager` | Save/load custom interval presets |
| `TimerAudioController` | Mode-specific audio cue manager |

### Visual Design

**Mode Selector**:
- Horizontal scrollable pills below header
- Each pill: 80px wide, 36px height, rounded-full
- Active pill: filled with mode color, white text
- Inactive pill: `#2A2A2A` background, `#666666` text

**Color Coding per Mode**:
- Rest: `#CDFF00` (lime - existing)
- AMRAP: `#F97316` (orange)
- EMOM: `#38BDF8` (sky blue)
- Tabata: `#EF4444` (red)
- Custom: `#A855F7` (purple)

**Timer Ring**:
- Circular progress ring (existing), color changes per mode
- Ring thickness: 8px
- Ring background: `#2A2A2A`
- Center time: 72px bold, mode color
- Phase text: "WORK" or "REST", 24px bold, below timer

**Phase Indicator**:
- Work phase: full-width banner at top, mode color background, "WORK" in black bold
- Rest phase: full-width banner, `#22C55E` green background, "REST" in white bold
- Framer Motion: fade + slide transition between phases

**Round Counter**:
- Below timer ring
- Format: "Round 3 / 8"
- Dots row: filled dots for completed rounds, empty for remaining
- 12px dots, 8px gap

### Wireframe - Mode Selector + AMRAP

```
+------------------------------------------+
| [< Back]  Timer                          |
+------------------------------------------+
| [Rest] [AMRAP] [EMOM] [Tabata] [Custom] |
+------------------------------------------+
|                                          |
|           AMRAP - 5 Minutes              |
|                                          |
|              .--------.                  |
|           /              \               |
|         |                  |             |
|         |      3:24        |             |
|         |                  |             |
|           \              /               |
|              '--------'                  |
|                                          |
|           [====== GO =========]          |
|                                          |
+------------------------------------------+
|  Duration: [-] 5 min [+]                |
+------------------------------------------+
```

### Wireframe - EMOM Active

```
+------------------------------------------+
| [< Back]  EMOM                   [pause] |
+==========================================+
|            *** WORK ***                  |
+==========================================+
|                                          |
|              .--------.                  |
|           /     blue     \               |
|         |                  |             |
|         |       42         |             |
|         |     seconds      |             |
|           \              /               |
|              '--------'                  |
|                                          |
|          Round 3 / 10                    |
|   [*] [*] [*] [ ] [ ] [ ] [ ] [ ] [ ] [ ] |
|                                          |
+------------------------------------------+
|  Next round in 42s                       |
+------------------------------------------+
```

### Wireframe - Tabata Active

```
+------------------------------------------+
| [< Back]  Tabata                 [pause] |
+==========================================+
|            *** REST ***                  |
+==========================================+
|                                          |
|              .--------.                  |
|           /     green    \               |
|         |                  |             |
|         |       07         |             |
|         |     seconds      |             |
|           \              /               |
|              '--------'                  |
|                                          |
|          Round 5 / 8                     |
|   [*] [*] [*] [*] [*] [ ] [ ] [ ]      |
|                                          |
|     20s work  /  10s rest                |
+------------------------------------------+
```

### Wireframe - Custom Config

```
+------------------------------------------+
| [< Back]  Custom Timer                   |
+------------------------------------------+
| Saved Presets:                           |
| [HIIT 40/20] [Circuit 30/30] [+New]     |
+------------------------------------------+
|                                          |
|  Work Duration                           |
|  [-]  40 seconds  [+]                   |
|                                          |
|  Rest Duration                           |
|  [-]  20 seconds  [+]                   |
|                                          |
|  Rounds                                  |
|  [-]  6 rounds  [+]                     |
|                                          |
|  Total: 6:00                             |
|                                          |
|  [====== Start Timer =========]          |
|  [Save as Preset]                        |
|                                          |
+------------------------------------------+
```

---

## 7. Technical Spec

### Dexie Schema Migration

```typescript
// In /src/lib/db.ts - add to next schema version
db.version(N).stores({
  // ... existing stores unchanged
  timerPresets: 'id, createdAt',
  timerResults: 'id, workoutLogId, completedAt',
});
```

### Timer Engine

```typescript
// /src/lib/timer-engine.ts
export type TimerMode = 'rest' | 'amrap' | 'emom' | 'tabata' | 'custom';
export type TimerPhase = 'idle' | 'work' | 'rest' | 'complete';

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

const TABATA_CONFIG: TimerConfig = {
  mode: 'tabata',
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
};

export class TimerEngine {
  private config: TimerConfig;
  private state: TimerState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onTick: (state: TimerState) => void;
  private onPhaseChange: (phase: TimerPhase, round: number) => void;
  private onComplete: () => void;
  private onWarning: (secondsLeft: number) => void;

  constructor(
    config: TimerConfig,
    callbacks: {
      onTick: (state: TimerState) => void;
      onPhaseChange: (phase: TimerPhase, round: number) => void;
      onComplete: () => void;
      onWarning: (secondsLeft: number) => void;
    }
  ) {
    this.config = config;
    this.onTick = callbacks.onTick;
    this.onPhaseChange = callbacks.onPhaseChange;
    this.onComplete = callbacks.onComplete;
    this.onWarning = callbacks.onWarning;

    this.state = this.getInitialState();
  }

  private getInitialState(): TimerState {
    const isAMRAP = this.config.mode === 'amrap';
    return {
      phase: 'idle',
      currentRound: 1,
      totalRounds: this.config.rounds,
      secondsRemaining: isAMRAP
        ? (this.config.totalSeconds || 300)
        : this.config.workSeconds,
      totalSecondsInPhase: isAMRAP
        ? (this.config.totalSeconds || 300)
        : this.config.workSeconds,
      isRunning: false,
      isPaused: false,
    };
  }

  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.phase = this.config.mode === 'amrap' ? 'work' : 'work';

    this.onPhaseChange(this.state.phase, this.state.currentRound);

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (!this.state.isPaused) return;
    this.state.isPaused = false;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    this.state.secondsRemaining--;

    // Warning cues
    if ([10, 5, 3, 2, 1].includes(this.state.secondsRemaining)) {
      this.onWarning(this.state.secondsRemaining);
    }

    if (this.state.secondsRemaining <= 0) {
      this.handlePhaseEnd();
    }

    this.onTick({ ...this.state });
  }

  private handlePhaseEnd(): void {
    if (this.config.mode === 'amrap') {
      this.state.phase = 'complete';
      this.stop();
      this.onComplete();
      return;
    }

    if (this.state.phase === 'work') {
      // Transition to rest (or next round if no rest)
      if (this.config.restSeconds > 0) {
        this.state.phase = 'rest';
        this.state.secondsRemaining = this.config.restSeconds;
        this.state.totalSecondsInPhase = this.config.restSeconds;
      } else {
        this.advanceRound();
      }
    } else if (this.state.phase === 'rest') {
      this.advanceRound();
    }

    if (this.state.phase !== 'complete') {
      this.onPhaseChange(this.state.phase, this.state.currentRound);
    }
  }

  private advanceRound(): void {
    if (this.state.currentRound >= this.config.rounds) {
      this.state.phase = 'complete';
      this.stop();
      this.onComplete();
      return;
    }

    this.state.currentRound++;
    this.state.phase = 'work';
    this.state.secondsRemaining = this.config.workSeconds;
    this.state.totalSecondsInPhase = this.config.workSeconds;
  }

  getState(): TimerState {
    return { ...this.state };
  }

  static createTabata(): TimerConfig {
    return { ...TABATA_CONFIG };
  }

  static createEMOM(intervalSeconds: number, rounds: number): TimerConfig {
    return {
      mode: 'emom',
      workSeconds: intervalSeconds,
      restSeconds: 0,
      rounds,
    };
  }

  static createAMRAP(minutes: number): TimerConfig {
    return {
      mode: 'amrap',
      workSeconds: 0,
      restSeconds: 0,
      rounds: 1,
      totalSeconds: minutes * 60,
    };
  }

  static createCustom(
    workSeconds: number,
    restSeconds: number,
    rounds: number
  ): TimerConfig {
    return {
      mode: 'custom',
      workSeconds,
      restSeconds,
      rounds,
    };
  }
}
```

### Timer Accuracy

- Use wall-clock tracking instead of interval counting: `elapsed = (performance.now() - startTime) / 1000`
- setInterval at 100ms (not 1000ms) for smoother countdown display
- On each tick, calculate remaining = totalSeconds - elapsed (not remaining--)
- Handle visibility changes: when app returns to foreground, recalculate elapsed from wall clock
- For AMRAP (30+ min): test timer accuracy within +/-1 second over 30 minutes

### Timer Audio Controller

```typescript
// /src/lib/timer-audio.ts
import { playSound, SoundType } from '@/lib/audio';
import type { TimerMode, TimerPhase } from '@/lib/timer-engine';

interface TimerAudioConfig {
  mode: TimerMode;
  enableWarnings: boolean;
  enableTransitions: boolean;
}

const MODE_SOUNDS: Record<TimerPhase, SoundType | null> = {
  idle: null,
  work: 'setStart',       // Reuse existing "set started" beep
  rest: 'restStart',      // Reuse existing rest timer start
  complete: 'workoutComplete', // Reuse existing completion chime
};

export function playTimerAudio(
  event: 'phaseChange' | 'warning' | 'complete',
  config: TimerAudioConfig,
  phase?: TimerPhase,
  secondsLeft?: number
): void {
  switch (event) {
    case 'phaseChange':
      if (config.enableTransitions && phase) {
        const sound = MODE_SOUNDS[phase];
        if (sound) playSound(sound);
      }
      break;

    case 'warning':
      if (config.enableWarnings && secondsLeft !== undefined) {
        if (secondsLeft === 10) {
          playSound('tenSecondWarning');
        } else if (secondsLeft <= 3) {
          playSound('countdown');
        }
      }
      break;

    case 'complete':
      playSound('workoutComplete');
      break;
  }
}
```

### useTimer React Hook

```typescript
// /src/hooks/useTimer.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerEngine, TimerConfig, TimerState, TimerPhase } from '@/lib/timer-engine';
import { playTimerAudio } from '@/lib/timer-audio';

interface UseTimerReturn {
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (config: TimerConfig) => void;
  isActive: boolean;
}

export function useTimer(initialConfig: TimerConfig): UseTimerReturn {
  const engineRef = useRef<TimerEngine | null>(null);
  const [state, setState] = useState<TimerState>({
    phase: 'idle',
    currentRound: 1,
    totalRounds: initialConfig.rounds,
    secondsRemaining: initialConfig.totalSeconds || initialConfig.workSeconds,
    totalSecondsInPhase: initialConfig.totalSeconds || initialConfig.workSeconds,
    isRunning: false,
    isPaused: false,
  });

  const createEngine = useCallback((config: TimerConfig) => {
    if (engineRef.current) {
      engineRef.current.stop();
    }

    engineRef.current = new TimerEngine(config, {
      onTick: (newState) => setState(newState),
      onPhaseChange: (phase: TimerPhase, round: number) => {
        playTimerAudio('phaseChange', {
          mode: config.mode,
          enableWarnings: true,
          enableTransitions: true,
        }, phase);
      },
      onComplete: () => {
        playTimerAudio('complete', {
          mode: config.mode,
          enableWarnings: true,
          enableTransitions: true,
        });
      },
      onWarning: (secondsLeft: number) => {
        playTimerAudio('warning', {
          mode: config.mode,
          enableWarnings: true,
          enableTransitions: true,
        }, undefined, secondsLeft);
      },
    });
  }, []);

  useEffect(() => {
    createEngine(initialConfig);
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => engineRef.current?.start(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const stop = useCallback(() => engineRef.current?.stop(), []);
  const reset = useCallback((config: TimerConfig) => createEngine(config), [createEngine]);

  return {
    state,
    start,
    pause,
    resume,
    stop,
    reset,
    isActive: state.isRunning && !state.isPaused,
  };
}
```

### Custom Preset Storage

```typescript
// /src/lib/timer-presets.ts
import { db } from '@/lib/db';

export interface TimerPreset {
  id: string;
  name: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  createdAt: string;
}

export async function savePreset(preset: Omit<TimerPreset, 'id' | 'createdAt'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.timerPresets.add({
    id,
    ...preset,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function getPresets(): Promise<TimerPreset[]> {
  return db.timerPresets.orderBy('createdAt').reverse().toArray();
}

export async function deletePreset(id: string): Promise<void> {
  await db.timerPresets.delete(id);
}
```

### Timer Result Logging

```typescript
// /src/lib/timer-log.ts
import { db } from '@/lib/db';
import type { TimerMode } from '@/lib/timer-engine';

export interface TimerResult {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  mode: TimerMode;
  config: {
    workSeconds: number;
    restSeconds: number;
    rounds: number;
    totalSeconds?: number;
  };
  result: {
    roundsCompleted: number;
    repsLogged?: number;       // For AMRAP
    totalDurationSeconds: number;
    completedAt: string;
  };
}

export async function logTimerResult(result: Omit<TimerResult, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.timerResults.add({ id, ...result });
  return id;
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/timer-engine.ts` | Core timer engine with all modes |
| `src/lib/timer-audio.ts` | Mode-specific audio cue controller |
| `src/lib/timer-presets.ts` | Custom preset CRUD with Dexie |
| `src/lib/timer-log.ts` | Timer result logging to workout history |
| `src/hooks/useTimer.ts` | React hook wrapping TimerEngine |
| `src/components/timer/TimerModeSelector.tsx` | Horizontal mode pill selector |
| `src/components/timer/AMRAPTimer.tsx` | AMRAP countdown UI |
| `src/components/timer/EMOMTimer.tsx` | EMOM interval UI with auto-start |
| `src/components/timer/TabataTimer.tsx` | 20/10 protocol UI |
| `src/components/timer/CustomIntervalTimer.tsx` | Configurable interval UI |
| `src/components/timer/IntervalConfig.tsx` | Work/rest/rounds settings form |
| `src/components/timer/PhaseIndicator.tsx` | "WORK" / "REST" banner |
| `src/components/timer/RoundCounter.tsx` | Round dots progress indicator |
| `src/components/timer/RepLogPrompt.tsx` | Post-AMRAP rep count entry |
| `src/components/timer/PresetManager.tsx` | Save/load custom presets |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/RestTimer.tsx` | Add mode selector, render mode-specific timer component |
| `src/lib/db.ts` | Add timerPresets and timerResults tables to Dexie schema |
| `src/lib/audio.ts` | Add new sound types if needed (countdown, phase transition) |
| `src/components/workout/SessionSummary.tsx` | Display timer mode results in workout summary |
| `src/components/stats/WorkoutHistory.tsx` | Show timer mode indicators on logged sessions |

---

## 8. Implementation Plan

### Dependencies
- [ ] Web Audio API system (already exists in `src/lib/audio.ts`)
- [ ] Dexie.js for preset and result storage (already integrated)
- [ ] Framer Motion for phase transition animations (already integrated)
- [ ] No new external dependencies

### Build Order

1. [ ] **TimerEngine class** - Core timer logic with all 4 modes
2. [ ] **Timer audio controller** - Mode-specific audio cues using existing sound system
3. [ ] **useTimer hook** - React hook wrapping TimerEngine with state management
4. [ ] **TimerModeSelector component** - Horizontal pill picker
5. [ ] **PhaseIndicator component** - "WORK" / "REST" animated banner
6. [ ] **RoundCounter component** - Dot-based round progress
7. [ ] **AMRAPTimer component** - Countdown with duration config + rep logging
8. [ ] **EMOMTimer component** - Auto-repeating intervals with round counter
9. [ ] **TabataTimer component** - Fixed 20/10 protocol
10. [ ] **IntervalConfig component** - Work/rest/rounds settings form
11. [ ] **CustomIntervalTimer component** - Configurable intervals
12. [ ] **PresetManager component** - Save/load presets with Dexie
13. [ ] **RepLogPrompt component** - Post-timer rep entry
14. [ ] **Timer result logging** - Save timer results to workout history
15. [ ] **RestTimer integration** - Add mode selector to existing rest timer screen
16. [ ] **Dexie schema update** - Add timerPresets and timerResults tables
17. [ ] **Session summary update** - Show timer mode results
18. [ ] **Test** - All modes, audio cues, pause/resume, background behavior, offline

### Agents to Consult
- **Audio Engineer** - Audio cue design for phase transitions, background audio on iOS
- **Frontend Specialist** - Framer Motion animations for phase transitions
- **PWA Specialist** - Background timer behavior on iOS Safari PWA (screen lock)
- **Periodization Specialist** - Validate EMOM/Tabata/AMRAP protocol accuracy

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User locks phone during timer | Web Audio API continues playing cues; timer state persisted, visual resumes on unlock |
| User navigates away mid-timer | Warn "Timer is active - leave?" confirmation dialog |
| Battery saver mode throttles setInterval | Use requestAnimationFrame fallback, track wall clock time not intervals |
| EMOM with 0s rest (all work) | Valid config - each interval is pure work with auto-start |
| Custom with 0s work (only rest) | Prevent - validate minimum 5s work duration |
| User starts Tabata then switches mode | Stop current timer, confirm with dialog, reset to new mode |
| Timer completes while app is in background | Audio cue plays (Web Audio), state updates on foreground return |
| Very long AMRAP (30 minutes) | Support up to 60 minutes, display hours:minutes:seconds format |
| Preset with same name already exists | Allow duplicates, show creation date to distinguish |
| User skips rep logging after AMRAP | Log as "AMRAP completed" without rep count, show optional entry later |
| App crashes mid-timer | Persist timer state to Dexie every 5 seconds, offer "Resume timer?" on next open |
| User double-taps GO button | Disable button immediately on first tap, prevent duplicate timer starts |

---

## 10. Testing

### Functional Tests
- [ ] AMRAP countdown from configured duration to zero, triggers complete
- [ ] EMOM auto-starts each interval, counts rounds correctly
- [ ] Tabata alternates 20s work / 10s rest for exactly 8 rounds (4 minutes total)
- [ ] Custom intervals respect configured work/rest/rounds
- [ ] Pause freezes timer, resume continues from same second
- [ ] Audio cues fire at correct moments (start, 10s warning, 3-2-1, transition, complete)
- [ ] Rep logging after AMRAP saves correct value to workout log
- [ ] Round counter accurate for all modes
- [ ] Timer presets save to Dexie and load correctly
- [ ] Timer results appear in session summary
- [ ] Mode selector switches cleanly between modes
- [ ] Timer continues when phone screen dims (Web Audio keep-alive)
- [ ] All timer modes work offline

### UI Verification
- [ ] Mode selector pills scroll horizontally on narrow screens
- [ ] Timer digits readable from 1 meter distance (72px font)
- [ ] "WORK" / "REST" phase banner highly visible (full-width, bold)
- [ ] Color coding clear: lime (rest), orange (AMRAP), blue (EMOM), red (Tabata), purple (custom)
- [ ] Round counter dots render correctly for 1-20 rounds
- [ ] Phase transition animation smooth at 60fps
- [ ] Pause/resume buttons 44px+ touch targets
- [ ] IntervalConfig increment/decrement buttons easy to tap
- [ ] Dark theme colors correct across all timer modes
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome
- [ ] Test on iPhone SE (smallest viewport)

---

## 11. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested (especially background audio)
- [ ] All 4 timer modes tested end-to-end
- [ ] Audio cues verified on iOS and Android
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari kills background timers | Timer stops when phone locks | Use Web Audio API oscillator as keep-alive (proven pattern in existing rest timer) |
| setInterval drift over long durations | Timer inaccurate after 10+ minutes | Track start timestamp, calculate remaining from wall clock, not interval count |
| Too many timer modes overwhelm users | Analysis paralysis, users stick to Rest only | Default to Rest, surface mode suggestions contextually (finisher -> suggest Tabata) |
| Audio cue latency on phase transitions | Cue fires late, confusing timing | Pre-buffer next audio cue 500ms before transition |
| Complex UI for custom intervals | Users confused by configuration | Provide common presets (30/30, 40/20, 45/15), custom is secondary |
| Timer state lost on app crash | User loses mid-workout timer progress | Persist timer state to Dexie every 5 seconds, offer resume on next open |

---

## 13. Dependencies

- Web Audio API system (existing in `src/lib/audio.ts`) - audio cues for all modes
- Dexie.js (existing) - preset and timer result storage
- Framer Motion (existing) - phase transition animations
- Existing circular timer UI component (RestTimer) - reused and extended
- No server-side dependencies (fully offline-capable)
- Should be implemented after `hero-workout-action.md` (P0) as timer modes build on the workout session flow

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: renumbered all 14 sections to match standard, added 2 edge cases (crash recovery, double-tap prevention) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
