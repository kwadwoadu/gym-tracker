"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Play, Timer, Trophy, ChevronUp, ChevronDown } from "lucide-react";
import { SPRING_SNAPPY } from "@/lib/animations";

const SCREENS = [
  {
    id: "program",
    label: "Training Program",
    content: <ProgramScreen />,
  },
  {
    id: "workout",
    label: "Active Workout",
    content: <WorkoutScreen />,
  },
  {
    id: "timer",
    label: "Rest Timer",
    content: <TimerScreen />,
  },
  {
    id: "complete",
    label: "Completion",
    content: <CompleteScreen />,
  },
];

const CYCLE_MS = 3000;

function ProgramScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#CDFF00] flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-black" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">SetFlow</div>
          <div className="text-xs text-white/40">Full Body A</div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div className="flex gap-2">
          {["Day 1", "Day 2", "Day 3"].map((day, i) => (
            <div
              key={day}
              className={`flex-1 py-2 text-center text-xs font-medium rounded-lg ${
                i === 0 ? "bg-[#CDFF00] text-black" : "bg-white/10 text-white/60"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="text-xl font-bold mt-4 text-white">Full Body A</div>
        <div className="text-xs text-white/40">3 supersets - 9 exercises</div>

        {[
          { label: "A1", name: "Barbell Bench Press", sets: "4x8" },
          { label: "A2", name: "Bent Over Row", sets: "4x8" },
          { label: "B1", name: "Leg Press", sets: "3x12" },
        ].map((ex) => (
          <div
            key={ex.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
          >
            <div className="w-8 h-8 rounded-lg bg-[#CDFF00]/20 flex items-center justify-center text-xs font-bold text-[#CDFF00]">
              {ex.label}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{ex.name}</div>
              <div className="text-xs text-white/40">{ex.sets}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="w-full h-12 rounded-lg bg-[#CDFF00] flex items-center justify-center text-black font-semibold text-sm">
          <Play className="w-4 h-4 mr-2" />
          Start Full Body A
        </div>
      </div>
    </div>
  );
}

function WorkoutScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white">Barbell Bench Press</div>
          <div className="text-xs text-white/40">Set 3 of 4 - Superset A1</div>
        </div>
        <div className="text-xs text-[#CDFF00] font-medium">T:30A1</div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-xs text-white/40 uppercase tracking-wider">Previous</div>
          <div className="text-sm text-white/60">80kg x 8 reps</div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider">Weight</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ChevronDown className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-2xl font-bold text-white tabular-nums w-16 text-center">82.5</span>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ChevronUp className="w-4 h-4 text-white/60" />
              </div>
            </div>
            <span className="text-xs text-white/40">kg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider">Reps</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ChevronDown className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-2xl font-bold text-white tabular-nums w-16 text-center">8</span>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <ChevronUp className="w-4 h-4 text-white/60" />
              </div>
            </div>
            <span className="text-xs text-white/40">reps</span>
          </div>
        </div>

        <div className="bg-[#CDFF00]/10 border border-[#CDFF00]/20 rounded-lg p-3 flex items-center gap-2">
          <TrendingUpIcon />
          <div className="text-xs text-[#CDFF00]">
            +2.5kg from last week! Keep pushing.
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          {[1, 2, 3, 4].map((set) => (
            <div
              key={set}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-medium ${
                set < 3
                  ? "bg-[#22C55E]/20 text-[#22C55E]"
                  : set === 3
                  ? "bg-[#CDFF00] text-black"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {set < 3 ? "Done" : set === 3 ? "Current" : `Set ${set}`}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="w-full h-12 rounded-lg bg-[#CDFF00] flex items-center justify-center text-black font-semibold text-sm">
          Log Set
        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TimerScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white">Rest Time</div>
          <div className="text-xs text-white/40">Next: A2 - Bent Over Row</div>
        </div>
        <Timer className="w-5 h-5 text-[#CDFF00]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#CDFF00"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * 0.35}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white tabular-nums">1:18</span>
            <span className="text-xs text-white/40 mt-1">of 2:00</span>
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <div className="text-sm text-white/60">Set 3 of 4 completed</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-xs text-[#22C55E] font-medium">82.5kg x 8</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="text-xs text-white/40">RPE 8</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <div className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/60 font-medium">
            -30s
          </div>
          <div className="px-6 py-2 rounded-lg bg-[#CDFF00]/20 text-xs text-[#CDFF00] font-medium">
            Skip Rest
          </div>
          <div className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/60 font-medium">
            +30s
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-[#22C55E]" />
        </div>

        <div className="text-center">
          <div className="text-xl font-bold text-white">Workout Complete!</div>
          <div className="text-sm text-white/40 mt-1">Full Body A</div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white tabular-nums">47:23</div>
            <div className="text-xs text-white/40">Duration</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white tabular-nums">12,450</div>
            <div className="text-xs text-white/40">Volume (kg)</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white tabular-nums">24</div>
            <div className="text-xs text-white/40">Sets</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[#CDFF00] tabular-nums">2</div>
            <div className="text-xs text-white/40">New PRs</div>
          </div>
        </div>

        <div className="w-full bg-[#CDFF00]/10 border border-[#CDFF00]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-[#CDFF00]" />
            <span className="text-sm font-semibold text-[#CDFF00]">New PR!</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white">Bench Press</span>
            <span className="text-[#CDFF00] font-bold">85kg x 8</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#F59E0B]">
          <span className="text-2xl">&#128293;</span>
          <span className="text-sm font-medium">12 day streak!</span>
        </div>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="w-full h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-sm font-medium">
          Share Workout
        </div>
        <div className="w-full h-10 rounded-lg bg-[#CDFF00] flex items-center justify-center text-black text-sm font-semibold">
          Back to Home
        </div>
      </div>
    </div>
  );
}

export function AppWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SCREENS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(advance, CYCLE_MS);
    return () => clearInterval(interval);
  }, [advance, isPaused]);

  return (
    <div
      className="relative mx-auto max-w-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Phone frame */}
      <div className="relative rounded-[40px] bg-[#1A1A1A] p-2 shadow-2xl border border-white/10">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-2xl z-20" />

        <div className="rounded-[32px] bg-[#0A0A0A] overflow-hidden aspect-[9/16] flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={SCREENS[activeIndex].id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ ...SPRING_SNAPPY, duration: 0.35 }}
              className="absolute inset-0 flex flex-col"
            >
              {SCREENS[activeIndex].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {SCREENS.map((screen, i) => (
          <button
            key={screen.id}
            onClick={() => setActiveIndex(i)}
            aria-label={`View ${screen.label} screen`}
            className="p-1"
          >
            <motion.div
              className={`h-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-[#CDFF00]" : "bg-white/20"
              }`}
              animate={{ width: i === activeIndex ? 24 : 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </button>
        ))}
      </div>

      {/* Screen label */}
      <motion.p
        key={SCREENS[activeIndex].id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-white/40 mt-2"
      >
        {SCREENS[activeIndex].label}
      </motion.p>

      {/* Glow under phone */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#CDFF00]/20 blur-3xl pointer-events-none" />
    </div>
  );
}
