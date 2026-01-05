'use client';

import { type MealSlots, calculateTotalMacros } from '@/data/meal-templates';
import { cn } from '@/lib/utils';
import { Target, Flame, Dumbbell, Droplets } from 'lucide-react';

interface MacrosSummaryProps {
  slots: MealSlots;
}

// Targets from the recomp protocol
const TARGETS = {
  protein: 180,
  carbs: 200, // training day average
  fat: 75,
  calories: 2500,
};

export function MacrosSummary({ slots }: MacrosSummaryProps) {
  const totals = calculateTotalMacros(slots);

  const getProgressColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.95) return 'text-[#22C55E]';
    if (ratio >= 0.7) return 'text-[#F59E0B]';
    return 'text-[#A0A0A0]';
  };

  const proteinRatio = totals.protein / TARGETS.protein;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
      {/* Main protein display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#CDFF00]/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#CDFF00]" />
          </div>
          <div>
            <p className="text-sm text-[#A0A0A0]">Protein</p>
            <p className={cn('text-2xl font-bold', getProgressColor(totals.protein, TARGETS.protein))}>
              {totals.protein}g <span className="text-sm text-[#666666]">/ {TARGETS.protein}g</span>
            </p>
          </div>
        </div>
        <div
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            proteinRatio >= 1
              ? 'bg-[#22C55E]/20 text-[#22C55E]'
              : proteinRatio >= 0.8
                ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                : 'bg-[#2A2A2A] text-[#666666]'
          )}
        >
          {Math.round(proteinRatio * 100)}%
        </div>
      </div>

      {/* Other macros */}
      <div className="grid grid-cols-3 gap-4">
        <MacroItem
          icon={Dumbbell}
          label="Carbs"
          current={totals.carbs}
          target={TARGETS.carbs}
        />
        <MacroItem
          icon={Droplets}
          label="Fat"
          current={totals.fat}
          target={TARGETS.fat}
        />
        <MacroItem
          icon={Flame}
          label="Calories"
          current={totals.calories}
          target={TARGETS.calories}
          unit=""
        />
      </div>
    </div>
  );
}

function MacroItem({
  icon: Icon,
  label,
  current,
  target,
  unit = 'g',
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  target: number;
  unit?: string;
}) {
  const ratio = current / target;
  const getColor = () => {
    if (ratio >= 0.95) return 'text-[#22C55E]';
    if (ratio >= 0.7) return 'text-[#F59E0B]';
    return 'text-[#A0A0A0]';
  };

  return (
    <div className="text-center">
      <Icon className="w-4 h-4 text-[#666666] mx-auto mb-1" />
      <p className={cn('text-lg font-semibold', getColor())}>
        {current}{unit}
      </p>
      <p className="text-xs text-[#666666]">{label}</p>
    </div>
  );
}
