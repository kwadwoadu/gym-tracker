"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SetLog } from "@/lib/api-client";

interface EditSetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  set: SetLog | null;
  onSave: (updates: { weight: number; actualReps: number; rpe?: number }) => void;
}

export function EditSetDrawer({ isOpen, onClose, set, onSave }: EditSetDrawerProps) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState<number>(7);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");
  const weightInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when set changes
  useEffect(() => {
    if (set) {
      setWeight(set.weight);
      setReps(set.actualReps);
      setRpe(set.rpe || 7);
      setWeightInputValue(set.weight.toString());
    }
  }, [set]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingWeight && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [isEditingWeight]);

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, +(prev + delta).toFixed(1)));
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(0, prev + delta));
  };

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightInputValue(e.target.value);
  };

  const handleWeightInputBlur = () => {
    const parsed = parseFloat(weightInputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setWeight(parsed);
    } else {
      setWeightInputValue(weight.toString());
    }
    setIsEditingWeight(false);
  };

  const handleWeightInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleWeightInputBlur();
    } else if (e.key === "Escape") {
      setWeightInputValue(weight.toString());
      setIsEditingWeight(false);
    }
  };

  const handleSave = () => {
    onSave({ weight, actualReps: reps, rpe });
    onClose();
  };

  // Get RPE label based on value
  const getRpeLabel = (value: number) => {
    if (value <= 5) return "Easy";
    if (value === 6) return "Moderate";
    if (value === 7) return "Challenging";
    if (value === 8) return "Hard";
    if (value === 9) return "Very Hard";
    return "Max Effort";
  };

  if (!set) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card">
        <DrawerHeader className="relative">
          <DrawerTitle className="text-center">
            Edit Set
          </DrawerTitle>
          <p className="text-sm text-muted-foreground text-center">
            {set.exerciseName} - Set {set.setNumber}
          </p>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Weight input */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Weight (kg) - tap to edit
            </label>

            <div className="flex items-center justify-center mb-3">
              {isEditingWeight ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={weightInputRef}
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    value={weightInputValue}
                    onChange={handleWeightInputChange}
                    onBlur={handleWeightInputBlur}
                    onKeyDown={handleWeightInputKeyDown}
                    className="w-28 h-14 text-3xl font-bold text-center bg-input border-primary"
                  />
                  <span className="text-xl text-muted-foreground">kg</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setWeightInputValue(weight.toString());
                    setIsEditingWeight(true);
                  }}
                  className="px-4 py-2 rounded-lg transition-colors hover:bg-muted/50 active:bg-muted cursor-pointer"
                >
                  <span className="text-4xl font-bold text-foreground tabular-nums">
                    {weight}
                  </span>
                  <span className="text-xl text-muted-foreground ml-1">kg</span>
                </button>
              )}
            </div>

            {/* Quick increment buttons */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(-5)}
              >
                -5
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(-2.5)}
              >
                -2.5
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(-1)}
              >
                -1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(1)}
              >
                +1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(2.5)}
              >
                +2.5
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-sm"
                onClick={() => adjustWeight(5)}
              >
                +5
              </Button>
            </div>
          </div>

          {/* Reps input */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Reps completed
            </label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full text-xl touch-target"
                onClick={() => adjustReps(-1)}
              >
                <Minus className="w-5 h-5" />
              </Button>

              <div className="flex-1 text-center">
                <span className="text-4xl font-bold text-foreground tabular-nums">
                  {reps}
                </span>
                {set.targetReps && (
                  <span className="text-xl text-muted-foreground ml-1">
                    / {set.targetReps}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full text-xl touch-target"
                onClick={() => adjustReps(1)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* RPE slider */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              RPE (Rate of Perceived Exertion)
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  rpe <= 7 ? "text-green-500" : rpe === 8 ? "text-yellow-500" : "text-red-500"
                )}>
                  {rpe}
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  rpe <= 7 ? "text-green-500" : rpe === 8 ? "text-yellow-500" : "text-red-500"
                )}>
                  {getRpeLabel(rpe)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(parseInt(e.target.value))}
                  className={cn(
                    "w-full h-3 rounded-full appearance-none cursor-pointer",
                    "bg-muted",
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:w-7",
                    "[&::-webkit-slider-thumb]:h-7",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:cursor-pointer",
                    "[&::-webkit-slider-thumb]:shadow-md",
                    rpe <= 7
                      ? "[&::-webkit-slider-thumb]:bg-green-500"
                      : rpe === 8
                      ? "[&::-webkit-slider-thumb]:bg-yellow-500"
                      : "[&::-webkit-slider-thumb]:bg-red-500",
                    "[&::-moz-range-thumb]:w-7",
                    "[&::-moz-range-thumb]:h-7",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:cursor-pointer",
                    "[&::-moz-range-thumb]:border-0",
                    rpe <= 7
                      ? "[&::-moz-range-thumb]:bg-green-500"
                      : rpe === 8
                      ? "[&::-moz-range-thumb]:bg-yellow-500"
                      : "[&::-moz-range-thumb]:bg-red-500"
                  )}
                />
                {/* Scale markers */}
                <div className="flex justify-between mt-1 px-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "text-[10px] tabular-nums",
                        n === rpe ? "text-foreground font-bold" : "text-muted-foreground"
                      )}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
