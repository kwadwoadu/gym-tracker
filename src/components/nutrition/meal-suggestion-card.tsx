"use client";

import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export interface MealSuggestion {
  type: "template" | "custom";
  templateId?: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  matchPercentage: number;
  reason: string;
}

interface MealSuggestionCardProps {
  suggestion: MealSuggestion;
  onAdd: (suggestion: MealSuggestion) => void;
}

export function MealSuggestionCard({
  suggestion,
  onAdd,
}: MealSuggestionCardProps) {
  const matchColor =
    suggestion.matchPercentage >= 80
      ? "text-green-400 bg-green-400/10"
      : suggestion.matchPercentage >= 60
        ? "text-yellow-400 bg-yellow-400/10"
        : "text-orange-400 bg-orange-400/10";

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {suggestion.type === "custom" && (
              <Sparkles className="w-3.5 h-3.5 text-[#CDFF00]" />
            )}
            <p className="text-sm font-semibold text-white">
              {suggestion.templateId && (
                <span className="text-[#CDFF00] mr-1.5">
                  {suggestion.templateId}:
                </span>
              )}
              {suggestion.name}
            </p>
          </div>
          <p className="text-xs text-[#666666] mt-1">{suggestion.reason}</p>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${matchColor}`}
        >
          {suggestion.matchPercentage}%
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-3">
          <span className="text-xs text-[#CDFF00]">
            P: {suggestion.protein}g
          </span>
          <span className="text-xs text-blue-400">
            C: {suggestion.carbs}g
          </span>
          <span className="text-xs text-orange-400">
            F: {suggestion.fat}g
          </span>
          <span className="text-xs text-[#A0A0A0]">
            {suggestion.calories}cal
          </span>
        </div>
        <Button
          onClick={() => onAdd(suggestion)}
          size="sm"
          className="h-8 bg-[#CDFF00] text-black hover:bg-[#b8e600] text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
