"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GeneratedProgram } from "@/lib/ai/validators/program-validator";
import type { Exercise } from "@/lib/api-client";

interface ProgramPreviewCardProps {
  program: GeneratedProgram;
  exercises: Exercise[];
}

export function ProgramPreviewCard({ program, exercises }: ProgramPreviewCardProps) {
  const [expandedDay, setExpandedDay] = useState<number>(0);

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  const getExerciseName = (id: string): string => {
    return exerciseMap.get(id)?.name || id;
  };

  return (
    <div className="space-y-4">
      {/* Program header */}
      <div>
        <h3 className="text-xl font-bold text-white">{program.name}</h3>
        <p className="text-sm text-white/60 mt-1">{program.description}</p>
      </div>

      {/* Program meta */}
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-[#CDFF00]/10 text-[#CDFF00] border-[#CDFF00]/20">
          {program.durationWeeks} weeks
        </Badge>
        <Badge className="bg-[#CDFF00]/10 text-[#CDFF00] border-[#CDFF00]/20">
          {program.daysPerWeek} days/week
        </Badge>
        {program.deloadWeek && (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Deload week {program.deloadWeek}
          </Badge>
        )}
      </div>

      {/* Progression */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
        <Info className="w-4 h-4 text-[#CDFF00] mt-0.5 shrink-0" />
        <p className="text-sm text-white/70">{program.progressionStrategy}</p>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {program.days.map((day, dayIdx) => {
          const isExpanded = expandedDay === dayIdx;
          const totalSets = day.supersets.reduce(
            (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets, 0),
            0
          );
          const totalExercises = day.supersets.reduce(
            (acc, s) => acc + s.exercises.length,
            0
          );

          return (
            <Card key={dayIdx} className="bg-[#1A1A1A] border-[#2A2A2A] overflow-hidden">
              {/* Day header */}
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setExpandedDay(isExpanded ? -1 : dayIdx)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#CDFF00] flex items-center justify-center">
                    <span className="text-sm font-bold text-black">{dayIdx + 1}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{day.name}</p>
                    <p className="text-xs text-white/50">
                      {totalExercises} exercises - {totalSets} sets
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {/* Day detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Warmup */}
                      {day.warmup && day.warmup.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                            Warmup
                          </p>
                          {day.warmup.map((ex, i) => (
                            <div key={i} className="flex justify-between py-1">
                              <span className="text-sm text-white/60">
                                {getExerciseName(ex.exerciseId)}
                              </span>
                              <span className="text-sm text-white/40">
                                {ex.sets}x{ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Supersets */}
                      {day.supersets.map((superset, ssIdx) => (
                        <div key={ssIdx}>
                          <p className="text-xs font-medium text-[#CDFF00]/60 uppercase tracking-wider mb-1">
                            {superset.label}
                          </p>
                          {superset.exercises.map((ex, exIdx) => {
                            const isUnknown = !exerciseMap.has(ex.exerciseId);
                            return (
                              <div
                                key={exIdx}
                                className="flex items-center justify-between py-1.5"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-xs text-white/30 w-6 shrink-0">
                                    {superset.label}{exIdx + 1}
                                  </span>
                                  <span className="text-sm text-white truncate">
                                    {getExerciseName(ex.exerciseId)}
                                  </span>
                                  {isUnknown && (
                                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <span className="text-sm text-white/50 shrink-0 ml-2">
                                  {ex.sets}x{ex.reps}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {/* Finisher */}
                      {day.finisher && day.finisher.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                            Finisher
                          </p>
                          {day.finisher.map((ex, i) => (
                            <div key={i} className="flex justify-between py-1">
                              <span className="text-sm text-white/60">
                                {getExerciseName(ex.exerciseId)}
                              </span>
                              <span className="text-sm text-white/40">
                                {ex.sets}x{ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
