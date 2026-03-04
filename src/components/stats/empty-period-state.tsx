"use client";

import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HEADING } from "@/lib/typography";

interface EmptyPeriodStateProps {
  periodLabel: string;
}

export function EmptyPeriodState({ periodLabel }: EmptyPeriodStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Dumbbell className="w-8 h-8 text-white/20" />
      </div>
      <h3 className={`${HEADING.h3} text-white mb-2 text-center`}>
        No workouts yet
      </h3>
      <p className="text-sm text-white/40 text-center mb-6 max-w-[260px]">
        You haven&apos;t logged any workouts{" "}
        {periodLabel !== "all time" ? `this ${periodLabel}` : "yet"}. Start
        training and your progress will show up here.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-[#CDFF00] text-black font-semibold px-8 h-12 rounded-xl hover:bg-[#CDFF00]/90 active:scale-[0.98] transition-transform"
      >
        <Dumbbell className="w-4 h-4 mr-2" />
        Start Workout
      </Button>
    </div>
  );
}
