"use client";

import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";

export interface FoodItem {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  confidence: "high" | "medium" | "low";
}

export interface FoodAnalysis {
  foods: FoodItem[];
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  notes?: string;
}

interface MacroResultCardProps {
  analysis: FoodAnalysis;
  imagePreview?: string | null;
  onSave: () => void;
  onRetake: () => void;
}

const confidenceColor = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-orange-400",
};

export function MacroResultCard({
  analysis,
  imagePreview,
  onSave,
  onRetake,
}: MacroResultCardProps) {
  return (
    <div className="space-y-4">
      {/* Photo thumbnail + time */}
      {imagePreview && (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
            <img
              src={imagePreview}
              alt="Meal"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Meal Analysis</p>
            <p className="text-xs text-[#666666]">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Detected foods */}
      <div className="space-y-1">
        <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">
          Detected Foods
        </p>
        {analysis.foods.map((food, i) => (
          <div
            key={i}
            className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{food.name}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-[#CDFF00]">
                    P: {food.protein}g
                  </span>
                  <span className="text-xs text-blue-400">
                    C: {food.carbs}g
                  </span>
                  <span className="text-xs text-orange-400">
                    F: {food.fat}g
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] ${confidenceColor[food.confidence]}`}
              >
                {food.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#CDFF00]/20">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xs text-[#666666]">Protein</p>
            <p className="text-lg font-bold text-[#CDFF00]">
              {analysis.totalProtein}g
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666666]">Carbs</p>
            <p className="text-lg font-bold text-blue-400">
              {analysis.totalCarbs}g
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666666]">Fat</p>
            <p className="text-lg font-bold text-orange-400">
              {analysis.totalFat}g
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666666]">Calories</p>
            <p className="text-lg font-bold text-white">
              {analysis.totalCalories}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {analysis.notes && (
        <p className="text-xs text-[#A0A0A0] italic">{analysis.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onSave}
          className="flex-1 h-12 bg-[#CDFF00] text-black hover:bg-[#b8e600] font-semibold"
        >
          <Check className="w-5 h-5 mr-2" />
          Save Meal
        </Button>
        <Button
          onClick={onRetake}
          variant="outline"
          className="h-12 border-[#2A2A2A] text-white hover:bg-[#1A1A1A]"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
