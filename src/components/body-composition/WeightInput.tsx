"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Delete } from "lucide-react";

interface WeightInputProps {
  open: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  lastWeight?: number;
  unit: "kg" | "lbs";
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

export function WeightInput({
  open,
  onClose,
  onSave,
  lastWeight,
  unit,
}: WeightInputProps) {
  const [value, setValue] = useState(lastWeight?.toString() || "");

  const handleKey = (key: string) => {
    if (key === "del") {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    if (value.includes(".") && value.split(".")[1]?.length >= 1) return;
    setValue((v) => v + key);
  };

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    onSave(num);
    setValue("");
    onClose();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setValue(lastWeight?.toString() || "");
          onClose();
        }
      }}
    >
      <DrawerContent className="bg-background border-border">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg text-center text-white">
            Log Weight
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8">
          {/* Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-white tabular-nums min-h-[60px]">
              {value || "0"}
              <span className="text-lg text-white/40 ml-2">{unit}</span>
            </div>
            {lastWeight && (
              <p className="text-xs text-white/30 mt-1">
                Last: {lastWeight} {unit}
              </p>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="h-14 rounded-xl bg-card text-white text-xl font-medium active:bg-secondary transition-colors flex items-center justify-center"
              >
                {key === "del" ? (
                  <Delete className="w-5 h-5 text-white/60" />
                ) : (
                  key
                )}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!value || parseFloat(value) <= 0}
            className="w-full mt-4 h-14 rounded-xl bg-primary text-black font-semibold text-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            Save
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
