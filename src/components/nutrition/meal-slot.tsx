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
        'rounded-xl border-2 border-dashed transition-all duration-200',
        isOver
          ? 'border-[#CDFF00] bg-[#CDFF00]/10'
          : meal
            ? 'border-[#2A2A2A] bg-[#1A1A1A]'
            : 'border-[#2A2A2A] bg-[#0A0A0A]'
      )}
    >
      {/* Slot Header */}
      <div className="px-4 py-2 border-b border-[#2A2A2A]">
        <span className="text-sm font-medium text-[#A0A0A0]">
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
            <span className="text-xs font-bold text-[#CDFF00]">{meal.id}</span>
            <span className="text-sm font-medium text-white">{meal.name}</span>
            {hasIngredients && (
              <span className="text-[#666666]">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#CDFF00] font-semibold">{meal.protein}g P</span>
            <span className="text-[#A0A0A0]">{meal.carbs}g C</span>
            <span className="text-[#A0A0A0]">{meal.fat}g F</span>
            <span className="text-[#666666]">{meal.calories} cal</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#666666] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
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
            <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
              <p className="text-xs font-medium text-[#A0A0A0] mb-2">Ingredients:</p>
              <ul className="space-y-1">
                {meal.ingredients!.map((ingredient, index) => (
                  <li key={index} className="text-xs text-[#888888] flex items-start gap-2">
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

function EmptySlot({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isOver ? 'text-[#CDFF00]' : 'text-[#666666]'
      )}
    >
      <Plus className={cn('w-6 h-6 mb-1', isOver && 'animate-pulse')} />
      <span className="text-xs">
        {isOver ? 'Drop here' : 'Drag a meal here'}
      </span>
    </div>
  );
}
