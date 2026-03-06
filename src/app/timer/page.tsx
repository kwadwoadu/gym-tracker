"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import {
  TimerEngine,
  type TimerMode,
  type TimerConfig,
} from "@/lib/timer-engine";

const MODES: { id: TimerMode; label: string; color: string }[] = [
  { id: "amrap", label: "AMRAP", color: "#F97316" },
  { id: "emom", label: "EMOM", color: "#38BDF8" },
  { id: "tabata", label: "Tabata", color: "#EF4444" },
  { id: "custom", label: "Custom", color: "#A855F7" },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TimerPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<TimerMode>("tabata");

  // Config state
  const [amrapMinutes, setAmrapMinutes] = useState(5);
  const [emomInterval, setEmomInterval] = useState(60);
  const [emomRounds, setEmomRounds] = useState(10);
  const [customWork, setCustomWork] = useState(40);
  const [customRest, setCustomRest] = useState(20);
  const [customRounds, setCustomRounds] = useState(6);

  const config = useMemo((): TimerConfig => {
    switch (selectedMode) {
      case "amrap":
        return TimerEngine.amrap(amrapMinutes);
      case "emom":
        return TimerEngine.emom(emomInterval, emomRounds);
      case "tabata":
        return TimerEngine.tabata();
      case "custom":
        return TimerEngine.custom(customWork, customRest, customRounds);
      default:
        return TimerEngine.tabata();
    }
  }, [
    selectedMode,
    amrapMinutes,
    emomInterval,
    emomRounds,
    customWork,
    customRest,
    customRounds,
  ]);

  const { state, start, pause, resume, stop, reset } = useTimer(config);

  const modeColor =
    MODES.find((m) => m.id === selectedMode)?.color || "#CDFF00";

  const isIdle = state.phase === "idle";
  const isComplete = state.phase === "complete";

  // Calculate ring progress
  const ringProgress =
    state.totalSecondsInPhase > 0
      ? (state.totalSecondsInPhase - state.secondsRemaining) /
        state.totalSecondsInPhase
      : 0;

  const circumference = 2 * Math.PI * 54;

  const handleModeSwitch = (mode: TimerMode) => {
    if (state.isRunning) {
      stop();
    }
    setSelectedMode(mode);
    // Reset will happen via the useEffect in useTimer when config changes
    const newConfig = (() => {
      switch (mode) {
        case "amrap":
          return TimerEngine.amrap(amrapMinutes);
        case "emom":
          return TimerEngine.emom(emomInterval, emomRounds);
        case "tabata":
          return TimerEngine.tabata();
        case "custom":
          return TimerEngine.custom(customWork, customRest, customRounds);
        default:
          return TimerEngine.tabata();
      }
    })();
    reset(newConfig);
  };

  const handleReset = () => {
    stop();
    reset(config);
  };

  const totalTime = useMemo(() => {
    switch (selectedMode) {
      case "amrap":
        return amrapMinutes * 60;
      case "emom":
        return emomInterval * emomRounds;
      case "tabata":
        return (20 + 10) * 8;
      case "custom":
        return (customWork + customRest) * customRounds;
      default:
        return 0;
    }
  }, [
    selectedMode,
    amrapMinutes,
    emomInterval,
    emomRounds,
    customWork,
    customRest,
    customRounds,
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white">Timer</h1>
        <div className="w-10" />
      </header>

      {/* Mode Selector */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSwitch(mode.id)}
              className="px-5 py-2 rounded-full text-sm font-medium shrink-0 transition-all min-h-[36px]"
              style={{
                backgroundColor:
                  selectedMode === mode.id ? mode.color : "#2A2A2A",
                color: selectedMode === mode.id ? "#000" : "#666",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Banner */}
      <AnimatePresence mode="wait">
        {state.isRunning && !isComplete && (
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-4 py-3 rounded-xl text-center font-bold text-lg"
            style={{
              backgroundColor:
                state.phase === "work"
                  ? `${modeColor}20`
                  : "rgba(34, 197, 94, 0.15)",
              color: state.phase === "work" ? modeColor : "#22C55E",
            }}
          >
            {state.phase === "work" ? "WORK" : "REST"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Timer Ring */}
        <div className="relative w-56 h-56 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                state.phase === "rest"
                  ? "#22C55E"
                  : isComplete
                    ? "#22C55E"
                    : modeColor
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ringProgress)}
              className="transition-all duration-200 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold tabular-nums"
              style={{
                color: isComplete ? "#22C55E" : "#fff",
              }}
            >
              {isComplete ? "Done!" : formatTime(state.secondsRemaining)}
            </span>
            {!isComplete && state.isRunning && (
              <span className="text-xs text-white/40 mt-1">
                {state.phase === "rest" ? "rest" : "remaining"}
              </span>
            )}
          </div>
        </div>

        {/* Round Counter */}
        {selectedMode !== "amrap" && state.totalRounds > 1 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-white/50 mb-2">
              Round {state.currentRound} / {state.totalRounds}
            </p>
            <div className="flex gap-1.5 justify-center flex-wrap max-w-xs">
              {Array.from({ length: state.totalRounds }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      i < state.currentRound ? modeColor : "#2A2A2A",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mode-specific info */}
        {isIdle && !isComplete && (
          <div className="text-center text-sm text-white/40 mb-6">
            {selectedMode === "tabata" && "8 rounds - 20s work / 10s rest"}
            {selectedMode === "amrap" && `${amrapMinutes} min - max effort`}
            {selectedMode === "emom" && `${emomRounds}x${emomInterval}s intervals`}
            {selectedMode === "custom" &&
              `${customRounds}x ${customWork}s/${customRest}s`}
            {" - "}Total: {formatTime(totalTime)}
          </div>
        )}
      </div>

      {/* Config (only when idle) */}
      {isIdle && !isComplete && (
        <div className="px-6 pb-4 space-y-4">
          {selectedMode === "amrap" && (
            <ConfigRow
              label="Duration"
              value={`${amrapMinutes} min`}
              onMinus={() => setAmrapMinutes(Math.max(1, amrapMinutes - 1))}
              onPlus={() => setAmrapMinutes(Math.min(60, amrapMinutes + 1))}
            />
          )}
          {selectedMode === "emom" && (
            <>
              <ConfigRow
                label="Interval"
                value={`${emomInterval}s`}
                onMinus={() =>
                  setEmomInterval(Math.max(30, emomInterval - 10))
                }
                onPlus={() =>
                  setEmomInterval(Math.min(120, emomInterval + 10))
                }
              />
              <ConfigRow
                label="Rounds"
                value={`${emomRounds}`}
                onMinus={() => setEmomRounds(Math.max(1, emomRounds - 1))}
                onPlus={() => setEmomRounds(Math.min(30, emomRounds + 1))}
              />
            </>
          )}
          {selectedMode === "custom" && (
            <>
              <ConfigRow
                label="Work"
                value={`${customWork}s`}
                onMinus={() => setCustomWork(Math.max(5, customWork - 5))}
                onPlus={() => setCustomWork(Math.min(120, customWork + 5))}
              />
              <ConfigRow
                label="Rest"
                value={`${customRest}s`}
                onMinus={() => setCustomRest(Math.max(0, customRest - 5))}
                onPlus={() => setCustomRest(Math.min(120, customRest + 5))}
              />
              <ConfigRow
                label="Rounds"
                value={`${customRounds}`}
                onMinus={() =>
                  setCustomRounds(Math.max(1, customRounds - 1))
                }
                onPlus={() =>
                  setCustomRounds(Math.min(30, customRounds + 1))
                }
              />
            </>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="px-6 pb-safe-bottom pb-6">
        {isIdle && !isComplete && (
          <Button
            className="w-full h-14 text-lg font-bold text-black"
            style={{ backgroundColor: modeColor }}
            onClick={() => {
              reset(config);
              setTimeout(start, 50);
            }}
          >
            <Play className="w-5 h-5 mr-2" />
            GO
          </Button>
        )}

        {state.isRunning && !isComplete && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 border-border text-white"
              onClick={state.isPaused ? resume : pause}
            >
              {state.isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-14 px-6 border-border text-white/50"
              onClick={handleReset}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        )}

        {isComplete && (
          <div className="space-y-3">
            <Button
              className="w-full h-14 text-lg font-bold text-black"
              style={{ backgroundColor: modeColor }}
              onClick={handleReset}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Again
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-border text-white/60"
              onClick={() => router.back()}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigRow({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={onMinus}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:bg-muted"
        >
          <Minus className="w-4 h-4 text-white/60" />
        </button>
        <span className="text-white font-medium w-12 text-center tabular-nums">
          {value}
        </span>
        <button
          onClick={onPlus}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:bg-muted"
        >
          <Plus className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  );
}
