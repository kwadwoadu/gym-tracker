'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type MealSlot, type MealTemplate, getMealById, SLOT_LABELS } from '@/data/meal-templates';
import { cn } from '@/lib/utils';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealSlotProps {
  slotType: MealSlot;
  mealId: string | null;
  onRemove: (slotType: MealSlot) => void;
}

export function MealSlotComponent({ slotType, mealId, onRemove }: MealSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: slotType,
    data: { slotType },
  });

  const meal = mealId ? getMealById(mealId) : null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl transition-all duration-200',
        isOver
          ? 'border-2 border-primary border-dashed bg-primary/10'
          : meal
            ? 'border border-border bg-card'
            : 'border border-dashed border-border bg-background'
      )}
    >
      {/* Slot Header */}
      <div className="px-4 py-2 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">
          {SLOT_LABELS[slotType]}
        </span>
      </div>

      {/* Slot Content */}
      <div className="p-4 min-h-[80px] flex items-center justify-center">
        {meal ? (
          <MealSlotContent meal={meal} onRemove={() => onRemove(slotType)} />
        ) : (
          <EmptySlot isOver={isOver} />
        )}
      </div>
    </div>
  );
}

function MealSlotContent({
  meal,
  onRemove,
}: {
  meal: MealTemplate;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasIngredients = meal.ingredients && meal.ingredients.length > 0;

  const handleClick = () => {
    if (hasIngredients) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div
        onClick={handleClick}
        className={cn(
          'flex items-start justify-between gap-2',
          hasIngredients && 'cursor-pointer'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">{meal.id}</span>
            <span className="text-sm font-medium text-white">{meal.name}</span>
            {hasIngredients && (
              <span className="text-dim-foreground">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs mb-2">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-dim-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Ingredients */}
      <AnimatePresence>
        {isExpanded && hasIngredients && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Ingredients:</p>
              <ul className="space-y-1">
                {meal.ingredients!.map((ingredient, index) => (
                  <li key={index} className="text-xs text-dim-foreground flex items-start gap-2">
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

function EmptySlot({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isOver ? 'text-primary' : 'text-dim-foreground'
      )}
    >
      <Plus className={cn('w-6 h-6 mb-1', isOver && 'animate-pulse')} />
      <span className="text-xs">
        {isOver ? 'Drop here' : 'Add meal'}
      </span>
    </div>
  );
}
