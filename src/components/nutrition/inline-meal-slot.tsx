'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type MealSlot,
  type MealTemplate,
  getMealById,
  getMealsByCategory,
  isShakeMeal,
  SLOT_LABELS,
} from '@/data/meal-templates';

interface InlineMealSlotProps {
  slotType: MealSlot;
  mealId: string | null;
  onSelectMeal: (mealId: string) => void;
  onRemoveMeal: () => void;
  onShakeSelected?: (mealId: string) => void; // Callback when a shake meal is selected
  compact?: boolean; // More compact display for time-period sections
}

export function InlineMealSlot({
  slotType,
  mealId,
  onSelectMeal,
  onRemoveMeal,
  onShakeSelected,
  compact = false,
}: InlineMealSlotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meal = mealId ? getMealById(mealId) : null;
  const categoryMeals = getMealsByCategory(slotType);

  const handleSelectMeal = (selectedMealId: string) => {
    onSelectMeal(selectedMealId);
    setIsExpanded(false);

    // Check if it's a shake meal and trigger callback
    if (isShakeMeal(selectedMealId) && onShakeSelected) {
      onShakeSelected(selectedMealId);
    }
  };

  return (
    <div className={cn('rounded-lg transition-colors', compact ? 'bg-transparent' : 'bg-[#1A1A1A]')}>
      {meal ? (
        <SelectedMealDisplay
          meal={meal}
          onRemove={onRemoveMeal}
          compact={compact}
        />
      ) : (
        <EmptySlotSelector
          slotType={slotType}
          categoryMeals={categoryMeals}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          onSelectMeal={handleSelectMeal}
          compact={compact}
        />
      )}
    </div>
  );
}

interface SelectedMealDisplayProps {
  meal: MealTemplate;
  onRemove: () => void;
  compact: boolean;
}

function SelectedMealDisplay({ meal, onRemove, compact }: SelectedMealDisplayProps) {
  const [showIngredients, setShowIngredients] = useState(false);
  const hasIngredients = meal.ingredients && meal.ingredients.length > 0;
  const isShake = meal.isShake;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'border rounded-lg',
        isShake ? 'border-[#CDFF00]/30 bg-[#CDFF00]/5' : 'border-[#2A2A2A] bg-[#1A1A1A]',
        compact ? 'p-2' : 'p-3'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn('flex-1 min-w-0', hasIngredients && 'cursor-pointer')}
          onClick={() => hasIngredients && setShowIngredients(!showIngredients)}
        >
          <div className="flex items-center gap-2 mb-1">
            <Utensils className={cn('text-[#CDFF00]', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            <span className={cn('font-bold text-[#CDFF00]', compact ? 'text-xs' : 'text-xs')}>
              {meal.id}
            </span>
            <span className={cn('font-medium text-white truncate', compact ? 'text-xs' : 'text-sm')}>
              {meal.name}
            </span>
            {isShake && <span className="text-sm" title="Shake - can add supplements">🥤</span>}
            {hasIngredients && (
              <span className="text-[#666666]">
                {showIngredients ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
          <div className={cn('flex items-center gap-2', compact ? 'text-[10px]' : 'text-xs')}>
            <span className="text-[#CDFF00] font-semibold">{meal.protein}g P</span>
            <span className="text-[#A0A0A0]">{meal.carbs}g C</span>
            <span className="text-[#A0A0A0]">{meal.fat}g F</span>
            <span className="text-[#666666]">{meal.calories} cal</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className={cn(
            'rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#666666] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors',
            compact ? 'w-6 h-6' : 'w-7 h-7'
          )}
        >
          <X className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        </motion.button>
      </div>

      {/* Expandable Ingredients */}
      <AnimatePresence>
        {showIngredients && hasIngredients && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-[#2A2A2A]">
              <ul className="space-y-0.5">
                {meal.ingredients!.map((ingredient, index) => (
                  <li key={index} className="text-[10px] text-[#888888] flex items-start gap-1.5">
                    <span className="text-[#CDFF00]">-</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface EmptySlotSelectorProps {
  slotType: MealSlot;
  categoryMeals: MealTemplate[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectMeal: (mealId: string) => void;
  compact: boolean;
}

function EmptySlotSelector({
  slotType,
  categoryMeals,
  isExpanded,
  onToggle,
  onSelectMeal,
  compact,
}: EmptySlotSelectorProps) {
  return (
    <div className={cn('border border-dashed rounded-lg', isExpanded ? 'border-[#CDFF00]/50' : 'border-[#3A3A3A]')}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between transition-colors hover:bg-[#1A1A1A]',
          compact ? 'px-2 py-1.5' : 'px-3 py-2'
        )}
      >
        <div className="flex items-center gap-2">
          <Plus className={cn('text-[#666666]', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          <span className={cn('text-[#666666]', compact ? 'text-xs' : 'text-sm')}>
            Add {SLOT_LABELS[slotType].toLowerCase()}
          </span>
        </div>
        <span className="text-[#555555]">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn('border-t border-[#2A2A2A]', compact ? 'p-1.5 space-y-1' : 'p-2 space-y-1.5')}>
              {categoryMeals.map((meal) => (
                <MealOption
                  key={meal.id}
                  meal={meal}
                  onSelect={() => onSelectMeal(meal.id)}
                  compact={compact}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MealOptionProps {
  meal: MealTemplate;
  onSelect: () => void;
  compact: boolean;
}

function MealOption({ meal, onSelect, compact }: MealOptionProps) {
  const isShake = meal.isShake;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg transition-colors hover:bg-[#2A2A2A]',
        isShake ? 'bg-[#CDFF00]/5 border border-[#CDFF00]/20' : 'bg-[#1A1A1A]',
        compact ? 'p-1.5' : 'p-2'
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className={cn('font-bold text-[#CDFF00]', compact ? 'text-[10px]' : 'text-xs')}>
          {meal.id}
        </span>
        <span className={cn('font-medium text-white truncate', compact ? 'text-xs' : 'text-sm')}>
          {meal.name}
        </span>
        {isShake && <span className="text-xs" title="Shake - can add supplements">🥤</span>}
      </div>
      <div className={cn('flex items-center gap-2', compact ? 'text-[9px]' : 'text-[10px]')}>
        <span className="text-[#CDFF00] font-medium">{meal.protein}g P</span>
        <span className="text-[#888888]">{meal.carbs}g C</span>
        <span className="text-[#888888]">{meal.fat}g F</span>
        <span className="text-[#666666]">{meal.calories} cal</span>
      </div>
    </motion.button>
  );
}
