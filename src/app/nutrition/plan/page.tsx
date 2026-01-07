'use client';

import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { MealPlanner } from '@/components/nutrition/meal-planner';
import { motion } from 'framer-motion';

export default function MealPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

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
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Meal Planner */}
      <MealPlanner key={dateStr} date={dateStr} />
    </div>
  );
}
