'use client';

import { useState, useCallback } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSupplements } from '@/hooks/use-supplements';
import { useMealPlan, useUpdateMealPlan } from '@/lib/queries';
import { DayType, DAY_TYPE_LABELS } from '@/data/supplement-protocol';
import { getTimePeriodsForDayType } from '@/data/time-periods';
import { type MealSlot, type MealSlots, calculateTotalMacros } from '@/data/meal-templates';
import { TimePeriodSection } from '@/components/nutrition/time-period-section';
import { ShakeBuilderModal } from '@/components/nutrition/shake-builder-modal';

export default function NutritionLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shakeModalOpen, setShakeModalOpen] = useState(false);
  const [selectedShakeMealId, setSelectedShakeMealId] = useState<string | null>(null);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  // Supplement state
  const {
    dayType,
    setDayType,
    toggleSupplement,
    completeBlock,
    isCompleted: isSupplementCompleted,
    isBlockCompleted,
    progress: supplementProgress,
    isLoaded: supplementsLoaded,
    protocol,
  } = useSupplements(dateStr);

  // Meal plan state
  const { data: mealPlanData, isLoading: mealPlanLoading } = useMealPlan(dateStr);
  const updateMealPlan = useUpdateMealPlan();

  const slots: MealSlots = mealPlanData?.slots ?? {
    breakfast: null,
    midMorning: null,
    lunch: null,
    snack: null,
    dinner: null,
  };

  // Get time periods for current day type
  const timePeriods = getTimePeriodsForDayType(dayType);

  // Calculate overall progress (meals + supplements)
  const filledMealSlots = Object.values(slots).filter(Boolean).length;
  const totalMealSlots = 5;
  const mealProgress = Math.round((filledMealSlots / totalMealSlots) * 100);
  const overallProgress = Math.round((mealProgress + supplementProgress) / 2);

  // Calculate total macros
  const totalMacros = calculateTotalMacros(slots);

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate((current) =>
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };

  const handleSelectMeal = useCallback((slotType: MealSlot, mealId: string) => {
    const newSlots = { ...slots, [slotType]: mealId };
    updateMealPlan.mutate({ date: dateStr, slots: newSlots });
  }, [slots, dateStr, updateMealPlan]);

  const handleRemoveMeal = useCallback((slotType: MealSlot) => {
    const newSlots = { ...slots, [slotType]: null };
    updateMealPlan.mutate({ date: dateStr, slots: newSlots });
  }, [slots, dateStr, updateMealPlan]);

  const handleShakeSelected = useCallback((mealId: string) => {
    setSelectedShakeMealId(mealId);
    setShakeModalOpen(true);
  }, []);

  const handleShakeBuilderComplete = useCallback((supplementIds: string[]) => {
    // Auto-complete selected supplements
    supplementIds.forEach((fullId) => {
      const [blockId, itemId] = fullId.split('-');
      if (!isSupplementCompleted(blockId, itemId)) {
        toggleSupplement(blockId, itemId);
      }
    });
    setShakeModalOpen(false);
    setSelectedShakeMealId(null);
  }, [isSupplementCompleted, toggleSupplement]);

  // Get supplement blocks for a time period
  const getSupplementBlocksForPeriod = (supplementBlockIds: string[]) => {
    return protocol.filter((block) => supplementBlockIds.includes(block.id));
  };

  const isLoaded = supplementsLoaded && !mealPlanLoading;

  if (!isLoaded) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateDate('prev')}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#CDFF00]" />
            <span className="text-lg font-semibold text-white">
              {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </span>
          </button>
          {!isToday && (
            <p className="text-xs text-[#666666] mt-1">
              {format(selectedDate, 'EEEE')}
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateDate('next')}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A] transition-colors"
          disabled={isToday}
        >
          <ChevronRight
            className={`w-5 h-5 ${isToday ? 'opacity-30' : ''}`}
          />
        </motion.button>
      </div>

      {/* Day Type Selector */}
      <div className="flex justify-center mb-4">
        <DayTypeSelector dayType={dayType} onChange={setDayType} />
      </div>

      {/* Combined Progress Bar */}
      <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A] mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#A0A0A0]">Daily Progress</span>
          <span className="text-sm font-medium text-white">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#CDFF00] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {/* Macros Summary */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A2A]">
          <div className="text-center">
            <p className="text-xs text-[#666666]">Protein</p>
            <p className="text-sm font-semibold text-[#CDFF00]">{totalMacros.protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#666666]">Carbs</p>
            <p className="text-sm font-medium text-white">{totalMacros.carbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#666666]">Fat</p>
            <p className="text-sm font-medium text-white">{totalMacros.fat}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#666666]">Calories</p>
            <p className="text-sm font-medium text-white">{totalMacros.calories}</p>
          </div>
        </div>
      </div>

      {/* Time Period Sections */}
      <div className="space-y-3">
        {timePeriods.map((period) => (
          <TimePeriodSection
            key={period.id}
            period={period}
            mealId={slots[period.mealSlot]}
            supplementBlocks={getSupplementBlocksForPeriod(period.supplementBlocks)}
            onSelectMeal={handleSelectMeal}
            onRemoveMeal={handleRemoveMeal}
            onShakeSelected={handleShakeSelected}
            isSupplementCompleted={isSupplementCompleted}
            isBlockCompleted={isBlockCompleted}
            onToggleSupplement={toggleSupplement}
            onCompleteBlock={completeBlock}
          />
        ))}
      </div>

      {/* Shake Builder Modal */}
      <ShakeBuilderModal
        isOpen={shakeModalOpen}
        onClose={() => {
          setShakeModalOpen(false);
          setSelectedShakeMealId(null);
        }}
        mealId={selectedShakeMealId}
        dayType={dayType}
        isSupplementCompleted={isSupplementCompleted}
        onComplete={handleShakeBuilderComplete}
      />
    </div>
  );
}

// Day Type Selector Component
interface DayTypeSelectorProps {
  dayType: DayType;
  onChange: (dayType: DayType) => void;
}

function DayTypeSelector({ dayType, onChange }: DayTypeSelectorProps) {
  const dayTypes: DayType[] = ['rest', 'am-training', 'pm-training'];

  return (
    <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
      {dayTypes.map((type) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            dayType === type
              ? 'bg-[#CDFF00] text-[#0A0A0A]'
              : 'text-[#A0A0A0] hover:text-white'
          )}
        >
          {DAY_TYPE_LABELS[type]}
        </motion.button>
      ))}
    </div>
  );
}
