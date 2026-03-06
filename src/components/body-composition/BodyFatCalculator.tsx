"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  calculateNavyBodyFat,
  getBodyFatCategory,
} from "@/lib/body-composition/body-fat";

interface BodyFatCalculatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (percentage: number) => void;
}

export function BodyFatCalculator({
  open,
  onClose,
  onSave,
}: BodyFatCalculatorProps) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const bf = calculateNavyBodyFat({
      gender,
      heightCm: parseFloat(height),
      neckCm: parseFloat(neck),
      waistCm: parseFloat(waist),
      hipCm: gender === "female" ? parseFloat(hip) : undefined,
    });
    setResult(bf);
  };

  const handleSave = () => {
    if (result === null) return;
    onSave(result);
    onClose();
  };

  const category = result !== null ? getBodyFatCategory(result, gender) : null;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-background border-border max-h-[85vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white text-left">
              Body Fat Calculator (Navy Method)
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4">
            {/* Gender Toggle */}
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    setResult(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    gender === g
                      ? "bg-primary text-black"
                      : "bg-card text-white/50"
                  }`}
                >
                  {g === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-card rounded-xl p-3">
                <span className="text-sm text-white/70 w-20 shrink-0">
                  Height
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setResult(null);
                  }}
                  placeholder="175"
                  className="bg-secondary border-none text-white text-right h-10"
                />
                <span className="text-xs text-white/30 w-6">cm</span>
              </div>

              <div className="flex items-center gap-3 bg-card rounded-xl p-3">
                <span className="text-sm text-white/70 w-20 shrink-0">
                  Neck
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={neck}
                  onChange={(e) => {
                    setNeck(e.target.value);
                    setResult(null);
                  }}
                  placeholder="38"
                  className="bg-secondary border-none text-white text-right h-10"
                />
                <span className="text-xs text-white/30 w-6">cm</span>
              </div>

              <div className="flex items-center gap-3 bg-card rounded-xl p-3">
                <span className="text-sm text-white/70 w-20 shrink-0">
                  Waist
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={waist}
                  onChange={(e) => {
                    setWaist(e.target.value);
                    setResult(null);
                  }}
                  placeholder="82"
                  className="bg-secondary border-none text-white text-right h-10"
                />
                <span className="text-xs text-white/30 w-6">cm</span>
              </div>

              {gender === "female" && (
                <div className="flex items-center gap-3 bg-card rounded-xl p-3">
                  <span className="text-sm text-white/70 w-20 shrink-0">
                    Hip
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={hip}
                    onChange={(e) => {
                      setHip(e.target.value);
                      setResult(null);
                    }}
                    placeholder="96"
                    className="bg-secondary border-none text-white text-right h-10"
                  />
                  <span className="text-xs text-white/30 w-6">cm</span>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculate}
              className="w-full h-12 rounded-xl bg-card text-white font-medium border border-border active:scale-[0.98] transition-transform"
            >
              Calculate
            </button>

            {/* Result */}
            {result !== null && category && (
              <div className="bg-card rounded-xl p-5 text-center space-y-2">
                <p className="text-4xl font-bold text-white">{result}%</p>
                <p className="text-sm font-medium" style={{ color: category.color }}>
                  {category.label}
                </p>
                <p className="text-[10px] text-white/20 mt-3">
                  Estimate only. Consult a professional for accurate measurement.
                </p>
              </div>
            )}

            {/* Save */}
            {result !== null && (
              <button
                onClick={handleSave}
                className="w-full h-14 rounded-xl bg-primary text-black font-semibold text-lg active:scale-[0.98] transition-transform"
              >
                Save Result
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
