'use client';

import { type MealSlots, calculateTotalMacros } from '@/data/meal-templates';
import { cn } from '@/lib/utils';
import { useNutritionProfile } from '@/lib/queries';
import { ProteinRing } from './protein-ring';

interface MacrosSummaryProps {
  slots: MealSlots;
  dayType?: 'training' | 'rest' | 'hiit';
}

// Fallback targets (used while profile loads)
const DEFAULT_TARGETS = {
  protein: 200,
  carbs: 300,
  fat: 89,
  calories: 2800,
};

// Static color config per macro type
const MACRO_COLORS = {
  protein: 'text-primary',
  carbs: 'text-gym-blue',
  fat: 'text-gym-warning',
  calories: 'text-foreground',
} as const;

const MACRO_BAR_COLORS = {
  protein: 'bg-primary',
  carbs: 'bg-gym-blue',
  fat: 'bg-gym-warning',
  calories: 'bg-foreground',
} as const;

export function MacrosSummary({ slots, dayType = 'training' }: MacrosSummaryProps) {
  const { data: profile } = useNutritionProfile();
  const totals = calculateTotalMacros(slots);

  const isTraining = dayType === 'training' || dayType === 'hiit';
  const TARGETS = profile
    ? {
        protein: isTraining ? profile.proteinTrainingDay : profile.proteinRestDay,
        carbs: isTraining ? profile.carbsTrainingDay : profile.carbsRestDay,
        fat: isTraining ? profile.fatTrainingDay : profile.fatRestDay,
        calories: isTraining ? profile.caloriesTrainingDay : profile.caloriesRestDay,
      }
    : DEFAULT_TARGETS;

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {/* Protein ring centered */}
      <div className="flex justify-center mb-4">
        <ProteinRing current={totals.protein} target={TARGETS.protein} size={120} />
      </div>

      {/* Macro grid - label above value, color-coded */}
      <div className="grid grid-cols-4 gap-3">
        <MacroItem
          label="Protein"
          current={totals.protein}
          target={TARGETS.protein}
          colorClass={MACRO_COLORS.protein}
          barClass={MACRO_BAR_COLORS.protein}
          unit="g"
        />
        <MacroItem
          label="Carbs"
          current={totals.carbs}
          target={TARGETS.carbs}
          colorClass={MACRO_COLORS.carbs}
          barClass={MACRO_BAR_COLORS.carbs}
          unit="g"
        />
        <MacroItem
          label="Fat"
          current={totals.fat}
          target={TARGETS.fat}
          colorClass={MACRO_COLORS.fat}
          barClass={MACRO_BAR_COLORS.fat}
          unit="g"
        />
        <MacroItem
          label="Calories"
          current={totals.calories}
          target={TARGETS.calories}
          colorClass={MACRO_COLORS.calories}
          barClass={MACRO_BAR_COLORS.calories}
          unit=""
        />
      </div>
    </div>
  );
}

function MacroItem({
  label,
  current,
  target,
  colorClass,
  barClass,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  colorClass: string;
  barClass: string;
  unit: string;
}) {
  const ratio = Math.min(current / target, 1);

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-lg font-semibold', colorClass)}>
        {current}{unit}
      </p>
      <p className="text-[10px] text-dim-foreground mb-1.5">/ {target}{unit}</p>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barClass)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
