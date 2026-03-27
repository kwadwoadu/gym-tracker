"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, ArrowRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPRING_BOUNCY } from "@/lib/animations";
import type { DeloadRecommendation } from "@/lib/ai/deload-detector";

export interface DeloadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: DeloadRecommendation;
  exercises: Array<{ id: string; name: string; lastWeight: number }>;
  onStartDeload: () => void;
}

export function DeloadSheet({
  open,
  onOpenChange,
  recommendation,
  exercises,
  onStartDeload,
}: DeloadSheetProps) {
  const [confirming, setConfirming] = useState(false);

  const intensityKeep = 1 - recommendation.protocol.intensityReduction / 100;

  const handleStart = useCallback(() => {
    setConfirming(true);

    // Show checkmark, then fire callback and close
    const timer = setTimeout(() => {
      onStartDeload();
      setConfirming(false);
      onOpenChange(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [onStartDeload, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] rounded-t-2xl border-0 bg-[#111111]">
        <div className="overflow-y-auto px-5 pb-8">
          {/* Header */}
          <DrawerHeader className="px-0 pt-2 pb-0 text-left">
            {/* Badge */}
            <Badge
              variant="outline"
              className="mb-4 w-fit gap-1.5 rounded-full border-[#EAB308]/30 bg-[#EAB308]/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#EAB308]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EAB308] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#EAB308]" />
              </span>
              Deload Recommended
            </Badge>

            <DrawerTitle className="text-2xl font-extrabold text-white">
              Take a Recovery Week
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Deload recommendation details
            </DrawerDescription>
          </DrawerHeader>

          {/* Why card */}
          <div className="mt-5 rounded-xl border border-[#EAB308]/20 bg-[#EAB308]/8 p-4">
            <p className="mb-3 text-[13px] font-semibold text-[#EAB308]">
              Why we recommend this:
            </p>
            <div className="space-y-2.5">
              {recommendation.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAB308]/20">
                    <Check className="h-3 w-3 text-[#EAB308]" />
                  </div>
                  <span className="text-[13px] leading-relaxed text-[#E0E0E0]">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol */}
          <div className="mt-5">
            <h3 className="text-[15px] font-bold text-white">
              Your Deload Protocol:
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#A0A0A0]">
              {recommendation.protocol.description}
            </p>

            {/* Exercise weight preview */}
            <div className="mt-4 divide-y divide-[#222222]">
              {exercises.map((ex) => {
                const deloadWeight = Math.round(ex.lastWeight * intensityKeep);
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm font-semibold text-white">
                      {ex.name}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[#666666]">
                        {ex.lastWeight}kg
                      </span>
                      <ArrowRight className="h-3 w-3 text-[#EAB308]" />
                      <span className="font-bold text-[#EAB308]">
                        {deloadWeight}kg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reassurance card */}
          <div className="mt-5 flex gap-3 rounded-xl border border-[#CDFF00]/20 bg-[#CDFF00]/6 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#CDFF00]/12">
              <Lock className="h-[18px] w-[18px] text-[#CDFF00]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#CDFF00]">
                Weight memory preserved
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#A0A0A0]">
                After your deload week, SetFlow automatically resumes from your
                normal weights. Nothing is lost.
              </p>
            </div>
          </div>

          {/* Actions */}
          <DrawerFooter className="mt-6 gap-2.5 px-0">
            <Button
              onClick={handleStart}
              disabled={confirming}
              className="relative h-14 w-full rounded-xl border-0 bg-[#EAB308] text-base font-bold text-black hover:bg-[#CA9A06] active:scale-[0.98] disabled:opacity-100"
            >
              <AnimatePresence mode="wait">
                {confirming ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={SPRING_BOUNCY}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="h-7 w-7 text-black" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Start Deload Week
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-12 w-full rounded-xl border border-[#333333] bg-transparent text-sm font-semibold text-[#A0A0A0] hover:border-[#555555] hover:bg-transparent hover:text-white active:scale-[0.98]"
            >
              Not now
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
