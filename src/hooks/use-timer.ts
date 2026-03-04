"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  TimerEngine,
  type TimerConfig,
  type TimerState,
  type TimerPhase,
} from "@/lib/timer-engine";
import { audioManager } from "@/lib/audio";

function getInitialState(config: TimerConfig): TimerState {
  const seconds =
    config.mode === "amrap"
      ? config.totalSeconds || 300
      : config.workSeconds;
  return {
    phase: "idle",
    currentRound: 1,
    totalRounds: config.rounds,
    secondsRemaining: seconds,
    totalSecondsInPhase: seconds,
    isRunning: false,
    isPaused: false,
  };
}

export function useTimer(initialConfig: TimerConfig) {
  const engineRef = useRef<TimerEngine | null>(null);
  const [state, setState] = useState<TimerState>(
    getInitialState(initialConfig)
  );

  const createEngine = useCallback((config: TimerConfig) => {
    if (engineRef.current) {
      engineRef.current.stop();
    }

    engineRef.current = new TimerEngine(config, {
      onTick: (s) => setState(s),
      onPhaseChange: (phase: TimerPhase) => {
        if (phase === "work") {
          audioManager.playSetStart();
        } else if (phase === "rest") {
          audioManager.playRestComplete();
        }
      },
      onComplete: () => {
        audioManager.playWorkoutComplete();
      },
      onWarning: (secondsLeft: number) => {
        if (secondsLeft === 10) {
          audioManager.playWarning();
        } else if (secondsLeft <= 5) {
          audioManager.playTick();
        }
      },
    });

    setState(getInitialState(config));
  }, []);

  useEffect(() => {
    createEngine(initialConfig);
    return () => {
      engineRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    audioManager.init();
    engineRef.current?.start();
  }, []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const stop = useCallback(() => {
    engineRef.current?.stop();
    setState((s) => ({ ...s, isRunning: false, isPaused: false }));
  }, []);
  const reset = useCallback(
    (config: TimerConfig) => createEngine(config),
    [createEngine]
  );

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
