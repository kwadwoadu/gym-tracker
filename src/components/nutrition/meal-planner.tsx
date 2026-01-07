'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  getMealsByCategory,
  type MealSlots,
  type MealSlot,
  type MealTemplate,
  type MealCategory,
  CATEGORY_LABELS,
  SLOT_LABELS,
} from '@/data/meal-templates';
import { MealTemplateCard, DragOverlayCard } from './meal-template-card';
import { MealSlotComponent } from './meal-slot';
import { MacrosSummary } from './macros-summary';
import { useMealPlan, useUpdateMealPlan, useCopyMealPlan } from '@/lib/queries';
import { Loader2, ChevronDown, ChevronUp, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';

type ToastType = 'success' | 'error';
interface Toast {
  message: string;
  type: ToastType;
}

interface MealPlannerProps {
  date: string;
}

const SLOT_ORDER: MealSlot[] = ['breakfast', 'midMorning', 'lunch', 'snack', 'dinner'];
const CATEGORY_ORDER: MealCategory[] = ['breakfast', 'midMorning', 'lunch', 'snack', 'dinner'];

export function MealPlanner({ date }: MealPlannerProps) {
  const { data: plan, isLoading } = useMealPlan(date);
  const updatePlan = useUpdateMealPlan();
  const copyPlan = useCopyMealPlan();
  const [activeDragMeal, setActiveDragMeal] = useState<MealTemplate | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<MealCategory>>(
    new Set(['breakfast', 'lunch', 'dinner'])
  );
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-hide toast after 2.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const slots: MealSlots = plan?.slots ?? {
    breakfast: null,
    midMorning: null,
    lunch: null,
    snack: null,
    dinner: null,
  };

  const handleDragStart = (event: DragStartEvent) => {
    const meal = event.active.data.current?.meal as MealTemplate;
    setActiveDragMeal(meal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragMeal(null);

    const { active, over } = event;
    if (!over) return;

    const meal = active.data.current?.meal as MealTemplate;
    const slotType = over.id as MealSlot;

    if (!meal || !SLOT_ORDER.includes(slotType)) return;

    // Update the slot
    const newSlots = { ...slots, [slotType]: meal.id };
    updatePlan.mutate({ date, slots: newSlots });
  };

  const handleRemoveMeal = (slotType: MealSlot) => {
    const newSlots = { ...slots, [slotType]: null };
    updatePlan.mutate({ date, slots: newSlots });
  };

  const handleQuickAdd = (meal: MealTemplate) => {
    // Map meal category to corresponding slot type
    const slotType = meal.category as MealSlot;

    // Only add if the slot is empty
    if (slots[slotType] === null) {
      const newSlots = { ...slots, [slotType]: meal.id };
      updatePlan.mutate({ date, slots: newSlots });
      setToast({ message: `Added ${meal.name} to ${SLOT_LABELS[slotType]}`, type: 'success' });
    } else {
      setToast({ message: `${SLOT_LABELS[slotType]} already has a meal`, type: 'error' });
    }
  };

  const handleCopyYesterday = () => {
    const yesterday = format(subDays(new Date(date), 1), 'yyyy-MM-dd');
    copyPlan.mutate({ sourceDate: yesterday, targetDate: date });
  };

  const toggleCategory = (category: MealCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-4 right-4 z-50 p-3 rounded-lg flex items-center gap-3 shadow-lg ${
              toast.type === 'success'
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#EF4444] text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Copy Yesterday Button */}
        <button
          onClick={handleCopyYesterday}
          disabled={copyPlan.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A] transition-colors"
        >
          {copyPlan.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          Copy yesterday&apos;s plan
        </button>

        {/* Layout: Desktop side-by-side, Mobile stacked */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Templates - Left side on desktop, accordion on mobile */}
          <div className="space-y-2 lg:order-1 mb-6 lg:mb-0">
            <h2 className="text-lg font-semibold text-white mb-3">Meal Templates</h2>
            {CATEGORY_ORDER.map((category) => {
              const meals = getMealsByCategory(category);
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2A2A2A] transition-colors"
                  >
                    <span className="text-sm font-medium text-white">
                      {CATEGORY_LABELS[category]} ({meals.length})
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#A0A0A0]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {meals.map((meal) => (
                            <MealTemplateCard
                              key={meal.id}
                              meal={meal}
                              onQuickAdd={handleQuickAdd}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Slots - Right side on desktop */}
          <div className="lg:order-2">
            <h2 className="text-lg font-semibold text-white mb-3">Today&apos;s Plan</h2>
            <div className="space-y-3 mb-6">
              {SLOT_ORDER.map((slotType) => (
                <MealSlotComponent
                  key={slotType}
                  slotType={slotType}
                  mealId={slots[slotType]}
                  onRemove={handleRemoveMeal}
                />
              ))}
            </div>

            {/* Macros Summary */}
            <MacrosSummary slots={slots} />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragMeal && <DragOverlayCard meal={activeDragMeal} />}
      </DragOverlay>
    </DndContext>
  );
}
