'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type MealTemplate } from '@/data/meal-templates';
import { cn } from '@/lib/utils';
import { GripVertical, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealTemplateCardProps {
  meal: MealTemplate;
  isDragOverlay?: boolean;
  onQuickAdd?: (meal: MealTemplate) => void;
}

export function MealTemplateCard({ meal, isDragOverlay, onQuickAdd }: MealTemplateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: { meal },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const handleCardClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd?.(meal);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={cn(
        'bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A] transition-all cursor-pointer',
        isDragging && !isDragOverlay && 'opacity-50',
        isDragOverlay && 'shadow-xl shadow-[#CDFF00]/20 border-[#CDFF00] scale-105',
        isExpanded && 'bg-[#1E1E1E]'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle - only this triggers drag */}
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-[#2A2A2A] transition-colors"
        >
          <GripVertical className="w-4 h-4 text-[#666666] flex-shrink-0" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#CDFF00]">{meal.id}</span>
            <span className="text-sm font-medium text-white truncate">{meal.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
            <span className="text-[#CDFF00] font-semibold">{meal.protein}g P</span>
            <span>{meal.carbs}g C</span>
            <span>{meal.fat}g F</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#666666]">
            <span>{meal.calories} cal</span>
            <span>-</span>
            <span>{meal.prepTime}</span>
          </div>
        </div>

        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            onClick={handleQuickAddClick}
            className="w-7 h-7 rounded-md bg-[#2A2A2A] flex items-center justify-center text-[#666666] hover:bg-[#CDFF00] hover:text-black transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Expand Indicator */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="flex-shrink-0 text-[#666666]">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {/* Expandable Ingredients */}
      <AnimatePresence>
        {isExpanded && meal.ingredients && meal.ingredients.length > 0 && (
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
                {meal.ingredients.map((ingredient, index) => (
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
    </div>
  );
}

// Simplified version for drag overlay
export function DragOverlayCard({ meal }: { meal: MealTemplate }) {
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-3 border-2 border-[#CDFF00] shadow-xl shadow-[#CDFF00]/20">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-[#CDFF00] flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#CDFF00]">{meal.id}</span>
            <span className="text-sm font-medium text-white truncate">{meal.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
            <span className="text-[#CDFF00] font-semibold">{meal.protein}g P</span>
            <span>{meal.carbs}g C</span>
            <span>{meal.fat}g F</span>
          </div>
        </div>
      </div>
    </div>
  );
}
