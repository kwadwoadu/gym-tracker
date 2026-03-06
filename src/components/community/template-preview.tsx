"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Download, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, SerializedTrainingDay } from "@/types/templates";
import { SPLIT_LABELS, DIFFICULTY_LABELS } from "@/types/templates";

interface TemplatePreviewProps {
  template: WorkoutTemplate | null;
  open: boolean;
  onClose: () => void;
  onImport: (template: WorkoutTemplate) => void;
  onVote: (id: string) => void;
  isImporting: boolean;
}

export function TemplatePreview({
  template,
  open,
  onClose,
  onImport,
  onVote,
  isImporting,
}: TemplatePreviewProps) {
  const [expandedDay, setExpandedDay] = useState<number>(0);

  if (!template) return null;

  const days = template.programData?.days || [];

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-background border-border max-h-[85vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white text-left">{template.programName}</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/50">by @{template.authorName}</span>
              <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                {DIFFICULTY_LABELS[template.difficulty]}
              </span>
              <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                {SPLIT_LABELS[template.splitType]}
              </span>
              <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                {template.dayCount} days
              </span>
            </div>

            {template.description && (
              <p className="text-sm text-white/60">{template.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onVote(template.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                  template.hasVoted
                    ? "text-primary bg-primary/10"
                    : "text-white/40 bg-card"
                )}
              >
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm font-medium">{template.upvotes}</span>
              </button>
              <div className="flex items-center gap-1.5 text-white/40">
                <Download className="w-4 h-4" />
                <span className="text-sm">{template.imports} imports</span>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">
                Program Overview
              </h3>
              {days.map((day: SerializedTrainingDay, i: number) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-white">{day.name}</span>
                    <span className="text-xs text-white/40">
                      {day.supersets.reduce((acc, s) => acc + s.exercises.length, 0)} exercises
                    </span>
                  </button>
                  {expandedDay === i && (
                    <div className="px-4 pb-4 space-y-2">
                      {day.supersets.map((superset, si) => (
                        <div key={si}>
                          <p className="text-xs text-primary font-medium mb-1">
                            Superset {superset.label}
                          </p>
                          {superset.exercises.map((ex, ei) => (
                            <div key={ei} className="flex items-center justify-between py-1">
                              <span className="text-sm text-white/80">{ex.exerciseName}</span>
                              <span className="text-xs text-white/40">
                                {ex.sets}x{ex.reps}
                                {ex.tempo ? ` T:${ex.tempo}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Import Button */}
            <Button
              className="w-full h-14 text-base font-semibold bg-primary text-black hover:bg-primary/90"
              onClick={() => onImport(template)}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {isImporting ? "Importing..." : "Import Program"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
