"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Lock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeloadExerciseCard } from "./DeloadExerciseCard";
import { SPRING_GENTLE } from "@/lib/animations";

export interface DeloadTrackerProps {
  currentDay: number; // 1-7
  daysRemaining: number;
  intensityReduction: number; // 0.3
  volumeReduction: number; // 0.4
  exercises: Array<{
    name: string;
    normalWeight: number;
    deloadWeight: number;
  }>;
  completedDays: number[]; // [1, 2, 3] = days with logged workouts
  onEndEarly: () => void;
  onStartWorkout: () => void;
}

// SVG ring constants
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function DeloadTracker({
  currentDay,
  daysRemaining,
  intensityReduction,
  volumeReduction,
  exercises,
  completedDays,
  onEndEarly,
  onStartWorkout,
}: DeloadTrackerProps) {
  const [weekExpanded, setWeekExpanded] = useState(false);
  const [ringAnimated, setRingAnimated] = useState(false);

  const progress = currentDay / 7;
  const progressPct = Math.round(progress * 100);
  const intensityPct = Math.round(intensityReduction * 100);
  const volumePct = Math.round(volumeReduction * 100);

  const ringOffset = useMemo(
    () => RING_CIRCUMFERENCE * (1 - progress),
    [progress]
  );

  // Animate ring on mount
  useEffect(() => {
    const timer = setTimeout(() => setRingAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Hero progress card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
        className="relative overflow-hidden rounded-2xl border-[1.5px] border-[#EAB308]/40 bg-[#1A1A1A] p-6"
      >
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#EAB308] to-transparent" />

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Deload Week</h2>
            <p className="mt-1 text-[13px] text-[#A0A0A0]">
              Reduce intensity to recover
            </p>
          </div>
          <span className="rounded-full bg-[#EAB308]/12 px-3 py-1 text-[13px] font-semibold text-[#EAB308]">
            Day {currentDay} of 7
          </span>
        </div>

        {/* Ring progress */}
        <div className="my-5 flex justify-center">
          <div className="relative h-[120px] w-[120px]">
            <svg
              className="-rotate-90"
              viewBox="0 0 120 120"
              width={120}
              height={120}
            >
              {/* Track */}
              <circle
                cx={60}
                cy={60}
                r={RING_RADIUS}
                fill="none"
                stroke="#2A2A2A"
                strokeWidth={8}
              />
              {/* Progress */}
              <circle
                cx={60}
                cy={60}
                r={RING_RADIUS}
                fill="none"
                stroke="#EAB308"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={
                  ringAnimated ? ringOffset : RING_CIRCUMFERENCE
                }
                style={{
                  transition:
                    "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-extrabold leading-none text-[#EAB308]">
                {progressPct}%
              </span>
              <span className="mt-0.5 text-[11px] text-[#666666]">
                complete
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
          <motion.div
            className="h-full rounded-full bg-[#EAB308]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-[#1A1A1A] px-3 py-4 text-center">
          <p className="text-[22px] font-extrabold leading-none text-[#EAB308]">
            -{intensityPct}%
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
            Intensity
          </p>
        </div>
        <div className="rounded-xl bg-[#1A1A1A] px-3 py-4 text-center">
          <p className="text-[22px] font-extrabold leading-none text-[#EAB308]">
            -{volumePct}%
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
            Volume
          </p>
        </div>
        <div className="rounded-xl bg-[#1A1A1A] px-3 py-4 text-center">
          <p className="text-[22px] font-extrabold leading-none text-[#EAB308]">
            {daysRemaining}d
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
            Return
          </p>
        </div>
      </div>

      {/* Weight memory card */}
      <div className="flex items-center gap-3 rounded-xl border border-[#CDFF00]/20 bg-[#CDFF00]/6 px-4 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CDFF00]/12">
          <Lock className="h-4 w-4 text-[#CDFF00]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#CDFF00]">
            Weight memory safe
          </p>
          <p className="text-xs text-[#A0A0A0]">
            Resuming normal weights in {daysRemaining} day
            {daysRemaining !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Exercise cards */}
      <div>
        <h3 className="mb-3 text-base font-bold text-white">
          Today&apos;s Exercises
        </h3>
        <div className="space-y-2.5">
          {exercises.map((ex, i) => (
            <DeloadExerciseCard
              key={i}
              name={ex.name}
              normalWeight={ex.normalWeight}
              deloadWeight={ex.deloadWeight}
              reduction={intensityReduction}
            />
          ))}
        </div>
      </div>

      {/* Week history (collapsible) */}
      <div className="mt-5">
        <button
          onClick={() => setWeekExpanded((v) => !v)}
          className="flex w-full items-center justify-between py-1"
        >
          <h3 className="text-base font-bold text-white">Week History</h3>
          <ChevronDown
            className={`h-[18px] w-[18px] text-[#666666] transition-transform duration-300 ${
              weekExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-[max-height] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            weekExpanded ? "max-h-[400px]" : "max-h-0"
          }`}
        >
          <div className="pt-3">
            {Array.from({ length: 7 }, (_, i) => {
              const day = i + 1;
              const isCompleted = completedDays.includes(day);
              const isToday = day === currentDay;

              let dotClass = "bg-[#333333]";
              let statusText = "Upcoming";
              let statusColor = "text-[#555555]";

              if (isCompleted) {
                dotClass = "bg-[#22C55E]";
                statusText = "Completed";
                statusColor = "text-[#22C55E]";
              } else if (isToday) {
                dotClass = "bg-[#EAB308] shadow-[0_0_8px_rgba(234,179,8,0.5)]";
                statusText = "Today";
                statusColor = "text-[#EAB308]";
              }

              return (
                <div
                  key={day}
                  className={`flex items-center gap-3 border-b border-[#1A1A1A] py-3 last:border-b-0`}
                >
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
                  />
                  <span className="flex-1 text-sm font-medium text-white">
                    Day {day} - {DAY_LABELS[i]}
                  </span>
                  <span className={`text-xs font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-col gap-2.5 pb-5">
        <Button
          onClick={onStartWorkout}
          className="h-14 w-full rounded-xl border-0 bg-[#EAB308] text-base font-bold text-black hover:bg-[#CA9A06] active:scale-[0.98]"
        >
          <Dumbbell className="mr-2 h-5 w-5" />
          Start Today&apos;s Workout
        </Button>

        <Button
          variant="ghost"
          onClick={onEndEarly}
          className="h-12 w-full rounded-xl border border-[#333333] bg-transparent text-sm font-semibold text-[#A0A0A0] hover:border-[#555555] hover:bg-transparent hover:text-white active:scale-[0.98]"
        >
          End Deload Early
        </Button>
      </div>
    </div>
  );
}
