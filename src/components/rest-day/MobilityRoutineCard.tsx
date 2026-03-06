"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import type { MobilityRoutine } from "@/data/mobility-routines";

interface MobilityRoutineCardProps {
  routine: MobilityRoutine;
  onStart: (routine: MobilityRoutine) => void;
}

export function MobilityRoutineCard({
  routine,
  onStart,
}: MobilityRoutineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card border-border p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-white">
              {routine.name}
            </h4>
            <p className="text-xs text-white/40 mt-0.5 capitalize">
              Targets: {routine.targetMuscles.join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-1 text-white/40 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{routine.durationMinutes} min</span>
          </div>
        </div>

        <div className="text-xs text-white/30 mb-4">
          {routine.movements.length} movements
        </div>

        <Button
          className="w-full h-12 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-black font-semibold"
          onClick={() => onStart(routine)}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Routine
        </Button>
      </Card>
    </motion.div>
  );
}
