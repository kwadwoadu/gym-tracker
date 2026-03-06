'use client';

import { useState, useCallback, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Loader2, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSupplements } from '@/hooks/use-supplements';
import { useMealPlan, useUpdateMealPlan } from '@/lib/queries';
import { DayType, DAY_TYPE_LABELS } from '@/data/supplement-protocol';
import { getTimePeriodsForDayType } from '@/data/time-periods';
import { type MealSlot, type MealSlots, calculateTotalMacros } from '@/data/meal-templates';
import { TimePeriodSection } from '@/components/nutrition/time-period-section';
import { ShakeBuilderModal } from '@/components/nutrition/shake-builder-modal';
import { ProteinRing } from '@/components/nutrition/protein-ring';
import { Button } from '@/components/ui/button';
import { useNutritionProfile } from '@/lib/queries';

export default function NutritionTodayPage() {
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
  const { data: nutritionProfile } = useNutritionProfile();

  const slots: MealSlots = useMemo(() => mealPlanData?.slots ?? {
    breakfast: null,
    midMorning: null,
    lunch: null,
    snack: null,
    dinner: null,
  }, [mealPlanData?.slots]);

  // Get time periods for current day type
  const timePeriods = getTimePeriodsForDayType(dayType);

  // Calculate overall progress (meals + supplements)
  const filledMealSlots = Object.values(slots).filter(Boolean).length;
  const totalMealSlots = 5;
  const mealProgress = Math.round((filledMealSlots / totalMealSlots) * 100);
  const overallProgress = Math.round((mealProgress + supplementProgress) / 2);

  // Calculate total macros
  const totalMacros = calculateTotalMacros(slots);

  // Protein target based on day type + profile
  const isTraining = dayType === 'am-training' || dayType === 'pm-training';
  const proteinTarget = nutritionProfile
    ? (isTraining ? nutritionProfile.proteinTrainingDay : nutritionProfile.proteinRestDay)
    : 200;

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-card transition-colors"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-lg font-semibold text-white">
              {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </span>
          </button>
          {!isToday && (
            <p className="text-xs text-dim-foreground mt-1">
              {format(selectedDate, 'EEEE')}
            </p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateDate('next')}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
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

      {/* Protein Ring + Progress */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex items-center gap-4">
          {/* Protein ring */}
          <ProteinRing current={totalMacros.protein} target={proteinTarget} size={100} />

          {/* Right side: progress bar + quick actions */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-muted-foreground">Daily Progress</span>
              <Link href="/nutrition/plan">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80">
                  <UtensilsCrossed className="w-3 h-3 mr-1" />
                  Plan
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{overallProgress}%</span>
            </div>

            {/* Color-coded macro values */}
            <div className="grid grid-cols-4 gap-1">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Protein</p>
                <p className="text-xs font-semibold text-primary">{totalMacros.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Carbs</p>
                <p className="text-xs font-semibold text-gym-blue">{totalMacros.carbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Fat</p>
                <p className="text-xs font-semibold text-gym-warning">{totalMacros.fat}g</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Calories</p>
                <p className="text-xs font-semibold text-foreground">{totalMacros.calories}</p>
              </div>
            </div>
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
    <div className="flex gap-1 bg-card rounded-lg p-1">
      {dayTypes.map((type) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            dayType === type
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-white'
          )}
        >
          {DAY_TYPE_LABELS[type]}
        </motion.button>
      ))}
    </div>
  );
}
