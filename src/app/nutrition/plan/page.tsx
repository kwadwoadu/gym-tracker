'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Sparkles, RefreshCw, Check, X } from 'lucide-react';
import { MealPlanner } from '@/components/nutrition/meal-planner';
import { useGenerateMealPlan, useNutritionProfile } from '@/lib/queries';
import { motion, AnimatePresence } from 'framer-motion';

export default function MealPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  const { data: profile } = useNutritionProfile();
  const generatePlan = useGenerateMealPlan();

  // Auto-dismiss feedback after 3 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleGenerateWeek = () => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    generatePlan.mutate({
      startDate: format(monday, 'yyyy-MM-dd'),
      trainingDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
      hiitDays: [3], // Wednesday
      save: true,
    }, {
      onSuccess: (data) => {
        const days = data.plans.length;
        setFeedback({ type: 'success', message: `Meal plans generated for ${days} days!` });
      },
      onError: () => {
        setFeedback({ type: 'error', message: 'Failed to generate meal plans' });
      },
    });
  };

  const handleRegenerateDay = () => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    generatePlan.mutate({
      startDate: format(monday, 'yyyy-MM-dd'),
      trainingDays: [1, 2, 4, 5],
      hiitDays: [3],
      save: true,
      regenerateDate: dateStr,
    }, {
      onSuccess: () => {
        setFeedback({ type: 'success', message: `${format(selectedDate, 'EEEE')} meal plan updated!` });
      },
      onError: () => {
        setFeedback({ type: 'error', message: 'Failed to regenerate day' });
      },
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate((current) =>
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
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
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-gym-success/15 text-gym-success border border-gym-success/20'
                : 'bg-destructive/15 text-destructive border border-destructive/20'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <X className="w-4 h-4 shrink-0" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Controls */}
      <div className="flex gap-2 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateWeek}
          disabled={generatePlan.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 transition-colors"
        >
          {generatePlan.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate Week
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRegenerateDay}
          disabled={generatePlan.isPending}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-white font-medium text-sm disabled:opacity-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Re-roll Day
        </motion.button>
      </div>

      {/* Meal Planner */}
      <MealPlanner key={dateStr} date={dateStr} />
    </div>
  );
}
