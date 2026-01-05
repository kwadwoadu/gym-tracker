'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type MealTemplate } from '@/data/meal-templates';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface MealTemplateCardProps {
  meal: MealTemplate;
  isDragOverlay?: boolean;
}

export function MealTemplateCard({ meal, isDragOverlay }: MealTemplateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: { meal },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A] cursor-grab active:cursor-grabbing transition-all touch-none',
        isDragging && !isDragOverlay && 'opacity-50',
        isDragOverlay && 'shadow-xl shadow-[#CDFF00]/20 border-[#CDFF00] scale-105'
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-[#666666] flex-shrink-0 mt-1" />
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
      </div>
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
