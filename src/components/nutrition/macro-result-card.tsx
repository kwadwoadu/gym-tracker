"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, Minus, Plus, Pencil } from "lucide-react";

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
  const [adjusting, setAdjusting] = useState(false);
  const [adjProtein, setAdjProtein] = useState(analysis.totalProtein);
  const [adjCarbs, setAdjCarbs] = useState(analysis.totalCarbs);
  const [adjFat, setAdjFat] = useState(analysis.totalFat);

  const adjCalories = Math.round(adjProtein * 4 + adjCarbs * 4 + adjFat * 9);

  const handleSave = useCallback(() => {
    if (adjusting) {
      // Create updated analysis with adjusted values
      const updated = {
        ...analysis,
        totalProtein: adjProtein,
        totalCarbs: adjCarbs,
        totalFat: adjFat,
        totalCalories: adjCalories,
      };
      void updated; // adjusted values available for future persistence
    }
    onSave();
  }, [adjusting, adjProtein, adjCarbs, adjFat, adjCalories, analysis, onSave]);

  return (
    <div className="space-y-4">
      {/* Photo thumbnail + time */}
      {imagePreview && (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
            <img
              src={imagePreview}
              alt="Meal"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Meal Analysis</p>
            <p className="text-xs text-dim-foreground">
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
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Detected Foods
        </p>
        {analysis.foods.map((food, i) => (
          <div
            key={i}
            className="bg-card rounded-lg p-3 border border-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{food.name}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-primary">
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

      {/* Totals with optional adjustment */}
      <div className="bg-card rounded-xl p-4 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Totals</p>
          <button
            onClick={() => setAdjusting(!adjusting)}
            className="flex items-center gap-1 text-xs text-primary"
          >
            <Pencil className="w-3 h-3" />
            {adjusting ? "Done" : "Adjust"}
          </button>
        </div>

        {adjusting ? (
          <div className="space-y-3">
            <MacroAdjustRow label="Protein" value={adjProtein} onChange={setAdjProtein} color="text-primary" step={5} />
            <MacroAdjustRow label="Carbs" value={adjCarbs} onChange={setAdjCarbs} color="text-blue-400" step={5} />
            <MacroAdjustRow label="Fat" value={adjFat} onChange={setAdjFat} color="text-orange-400" step={2} />
            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-dim-foreground">Calories</p>
              <p className="text-lg font-bold text-white">{adjCalories}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-dim-foreground">Protein</p>
              <p className="text-lg font-bold text-primary">
                {analysis.totalProtein}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Carbs</p>
              <p className="text-lg font-bold text-blue-400">
                {analysis.totalCarbs}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Fat</p>
              <p className="text-lg font-bold text-orange-400">
                {analysis.totalFat}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Calories</p>
              <p className="text-lg font-bold text-white">
                {analysis.totalCalories}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {analysis.notes && (
        <p className="text-xs text-muted-foreground italic">{analysis.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 h-12 bg-primary text-black hover:bg-primary/90 font-semibold"
        >
          <Check className="w-5 h-5 mr-2" />
          Save Meal
        </Button>
        <Button
          onClick={onRetake}
          variant="outline"
          className="h-12 border-border text-white hover:bg-card"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function MacroAdjustRow({
  label,
  value,
  onChange,
  color,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  step: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:bg-muted"
        >
          <Minus className="w-3.5 h-3.5 text-white/60" />
        </button>
        <span className={`text-sm font-bold w-12 text-center tabular-nums ${color}`}>
          {value}g
        </span>
        <button
          onClick={() => onChange(value + step)}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:bg-muted"
        >
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>
    </div>
  );
}
