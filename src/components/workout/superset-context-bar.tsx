"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListOrdered, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupersetContextBarProps {
  supersetLabel: string;
  exercises: { id: string; name: string }[];
  activeExerciseIndex: number;
  setNumber: number;
  totalSets: number;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export function SupersetContextBar({
  supersetLabel,
  exercises,
  activeExerciseIndex,
  setNumber,
  totalSets,
  focusMode,
  onToggleFocusMode,
}: SupersetContextBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card/60 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-3">
        {/* Superset label */}
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
          Superset {supersetLabel}
        </Badge>

        {/* Exercise position indicators */}
        <div className="flex items-center gap-1.5">
          {exercises.map((ex, idx) => (
            <div
              key={ex.id}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                idx === activeExerciseIndex
                  ? "bg-primary text-black"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {supersetLabel}{idx + 1}
            </div>
          ))}
        </div>

        {/* Set progress */}
        <span className="text-xs text-muted-foreground">
          Set {setNumber}/{totalSets}
        </span>
      </div>

      {/* Focus mode toggle */}
      {exercises.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs gap-1",
            focusMode
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          )}
          onClick={onToggleFocusMode}
          title={focusMode ? "Focus mode: all sets of one exercise first" : "Normal mode: alternating exercises"}
        >
          {focusMode ? (
            <ListOrdered className="w-3.5 h-3.5" />
          ) : (
            <Repeat className="w-3.5 h-3.5" />
          )}
          {focusMode ? "Focus" : "Alternate"}
        </Button>
      )}
    </div>
  );
}
