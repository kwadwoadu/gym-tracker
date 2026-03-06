'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp, Utensils, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  type MealSlot,
  type MealTemplate,
  getMealById,
  isShakeMeal,
  MEAL_TEMPLATES,
  SLOT_LABELS,
  CATEGORY_LABELS,
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

  const handleSelectMeal = (selectedMealId: string) => {
    onSelectMeal(selectedMealId);
    setIsExpanded(false);

    // Check if it's a shake meal and trigger callback
    if (isShakeMeal(selectedMealId) && onShakeSelected) {
      onShakeSelected(selectedMealId);
    }
  };

  return (
    <div className={cn('rounded-lg transition-colors', compact ? 'bg-transparent' : 'bg-card')}>
      {meal ? (
        <SelectedMealDisplay
          meal={meal}
          onRemove={onRemoveMeal}
          compact={compact}
        />
      ) : (
        <EmptySlotSelector
          slotType={slotType}
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
        'border rounded-xl',
        isShake ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
        compact ? 'p-2' : 'p-3'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn('flex-1 min-w-0', hasIngredients && 'cursor-pointer')}
          onClick={() => hasIngredients && setShowIngredients(!showIngredients)}
        >
          <div className="flex items-center gap-2 mb-1">
            <Utensils className={cn('text-primary', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            <span className={cn('font-bold text-primary', compact ? 'text-xs' : 'text-xs')}>
              {meal.id}
            </span>
            <span className={cn('font-medium text-white truncate', compact ? 'text-xs' : 'text-sm')}>
              {meal.name}
            </span>
            {isShake && <span className="text-sm" title="Shake - can add supplements">🥤</span>}
            {hasIngredients && (
              <span className="text-dim-foreground">
                {showIngredients ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
          <div className={cn('flex items-center gap-2 mb-1.5', compact ? 'text-[10px]' : 'text-xs')}>
            <span className="text-primary font-semibold">{meal.protein}g P</span>
            <span className="text-gym-blue">{meal.carbs}g C</span>
            <span className="text-gym-warning">{meal.fat}g F</span>
            <span className="text-dim-foreground">{meal.calories} cal</span>
          </div>
          {/* Mini macro bars */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((meal.protein / 50) * 100, 100)}%` }} />
            </div>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gym-blue rounded-full" style={{ width: `${Math.min((meal.carbs / 80) * 100, 100)}%` }} />
            </div>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gym-warning rounded-full" style={{ width: `${Math.min((meal.fat / 30) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className={cn(
            'rounded-full bg-secondary flex items-center justify-center text-dim-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
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
            <div className="mt-2 pt-2 border-t border-border">
              <ul className="space-y-0.5">
                {meal.ingredients!.map((ingredient, index) => (
                  <li key={index} className="text-[10px] text-dim-foreground flex items-start gap-1.5">
                    <span className="text-primary">-</span>
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
  isExpanded: boolean;
  onToggle: () => void;
  onSelectMeal: (mealId: string) => void;
  compact: boolean;
}

function EmptySlotSelector({
  slotType,
  isExpanded,
  onToggle,
  onSelectMeal,
  compact,
}: EmptySlotSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isExpanded) setSearchQuery('');
  }, [isExpanded]);

  const filteredMeals = useMemo(() =>
    MEAL_TEMPLATES.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  const handleToggle = () => {
    if (isExpanded) {
      setSearchQuery('');
    }
    onToggle();
  };

  return (
    <div className={cn('border border-dashed rounded-xl', isExpanded ? 'border-primary/50' : 'border-border')}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between transition-colors hover:bg-card',
          compact ? 'px-2 py-1.5' : 'px-3 py-2'
        )}
      >
        <div className="flex items-center gap-2">
          <Plus className={cn('text-dim-foreground', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          <span className={cn('text-dim-foreground', compact ? 'text-xs' : 'text-sm')}>
            Add {SLOT_LABELS[slotType].toLowerCase()}
          </span>
        </div>
        <span className="text-dim-foreground">
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
            {/* Search input */}
            <div className={cn('border-t border-border', compact ? 'px-1.5 pt-1.5' : 'px-2 pt-2')}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim-foreground" />
                <input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-dim-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Meal list */}
            <div className={cn('max-h-[280px] overflow-y-auto', compact ? 'p-1.5 space-y-1' : 'p-2 space-y-1.5')}>
              {filteredMeals.length > 0 ? (
                filteredMeals.map((meal) => (
                  <MealOption
                    key={meal.id}
                    meal={meal}
                    onSelect={() => onSelectMeal(meal.id)}
                    compact={compact}
                  />
                ))
              ) : (
                <p className="text-dim-foreground text-sm text-center py-4">No meals found</p>
              )}
            </div>

            {/* View Full Library link */}
            <div className={cn('border-t border-border', compact ? 'px-1.5 py-1.5' : 'px-2 py-2')}>
              <Link
                href="/nutrition/library"
                className="flex items-center justify-center gap-1.5 text-primary text-xs font-medium hover:opacity-80 transition-opacity"
              >
                View Full Library
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
        'w-full text-left rounded-lg transition-colors hover:bg-secondary',
        isShake ? 'bg-primary/5 border border-primary/20' : 'bg-card',
        compact ? 'p-1.5' : 'p-2'
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className={cn('font-bold text-primary', compact ? 'text-[10px]' : 'text-xs')}>
          {meal.id}
        </span>
        <span className={cn('font-medium text-white truncate', compact ? 'text-xs' : 'text-sm')}>
          {meal.name}
        </span>
        {isShake && <span className="text-xs" title="Shake - can add supplements">🥤</span>}
        <span className="bg-secondary text-muted-foreground text-[9px] px-1.5 py-0.5 rounded shrink-0">
          {CATEGORY_LABELS[meal.category]}
        </span>
      </div>
      <div className={cn('flex items-center gap-2', compact ? 'text-[9px]' : 'text-[10px]')}>
        <span className="text-primary font-medium">{meal.protein}g P</span>
        <span className="text-gym-blue">{meal.carbs}g C</span>
        <span className="text-gym-warning">{meal.fat}g F</span>
        <span className="text-dim-foreground">{meal.calories} cal</span>
      </div>
    </motion.button>
  );
}
