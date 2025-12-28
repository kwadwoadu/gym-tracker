"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ChevronRight, Loader2 } from "lucide-react";
import db from "@/lib/db";
import type { TrainingDay, Program } from "@/lib/db";
import { cn } from "@/lib/utils";

export default function ProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);

  useEffect(() => {
    async function loadProgram() {
      try {
        // Get active program
        const programs = await db.programs.toArray();
        const activeProgram = programs.find((p) => p.isActive) || programs[0];
        setProgram(activeProgram || null);

        if (activeProgram) {
          // Get training days for this program
          const days = await db.trainingDays
            .where("programId")
            .equals(activeProgram.id)
            .toArray();
          days.sort((a, b) => a.dayNumber - b.dayNumber);
          setTrainingDays(days);
        }
      } catch (error) {
        console.error("Failed to load program:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProgram();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Program</h1>
            {program && (
              <p className="text-sm text-muted-foreground">{program.name}</p>
            )}
          </div>
        </div>
      </header>

      {/* Program Description */}
      {program?.description && (
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{program.description}</p>
        </div>
      )}

      {/* Training Days List */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Training Days
        </h2>

        {trainingDays.map((day) => {
          const exerciseCount = day.supersets.reduce(
            (acc, ss) => acc + ss.exercises.length,
            0
          );
          const warmupCount = day.warmup?.length || 0;
          const finisherCount = day.finisher?.length || 0;

          return (
            <Card
              key={day.id}
              className={cn(
                "bg-card border-border p-4 cursor-pointer transition-all",
                "active:scale-[0.98] touch-target"
              )}
              onClick={() => router.push(`/program/${day.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Day Number */}
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-lg">
                    {day.dayNumber}
                  </span>
                </div>

                {/* Day Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground">
                    {day.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {day.supersets.length} supersets
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exerciseCount} exercises
                    </Badge>
                    {warmupCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {warmupCount} warmup
                      </Badge>
                    )}
                    {finisherCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {finisherCount} finisher
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
          );
        })}

        {trainingDays.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No training days found</p>
          </div>
        )}
      </div>
    </div>
  );
}
