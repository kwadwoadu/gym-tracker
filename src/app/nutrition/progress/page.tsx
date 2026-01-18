'use client';

import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useNutritionStats } from '@/lib/queries';
import { ComplianceCard } from '@/components/nutrition/compliance-card';
import { cn } from '@/lib/utils';

const PROTEIN_TARGET = 180;

export default function NutritionProgressPage() {
  const { data: stats, isLoading } = useNutritionStats(4); // Last 4 weeks

  // Calculate this week's days
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: today,
  });

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  // Calculate weekly averages
  const thisWeekData = stats?.weekly?.[0] || { proteinHits: 0, calorieHits: 0, days: 0 };
  const proteinRate = thisWeekData.days > 0
    ? Math.round((thisWeekData.proteinHits / thisWeekData.days) * 100)
    : 0;
  const calorieRate = thisWeekData.days > 0
    ? Math.round((thisWeekData.calorieHits / thisWeekData.days) * 100)
    : 0;

  // Compare to last week
  const lastWeekData = stats?.weekly?.[1] || { proteinHits: 0, calorieHits: 0, days: 0 };
  const lastWeekProteinRate = lastWeekData.days > 0
    ? Math.round((lastWeekData.proteinHits / lastWeekData.days) * 100)
    : 0;
  const proteinTrend = proteinRate - lastWeekProteinRate;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Weekly Summary */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">This Week</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#A0A0A0]">Protein Goals</span>
              {proteinTrend > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="w-3 h-3" />
                  +{proteinTrend}%
                </div>
              )}
            </div>
            <p className={cn(
              "text-3xl font-bold",
              proteinRate >= 80 ? "text-green-500" :
              proteinRate >= 50 ? "text-yellow-500" :
              "text-[#A0A0A0]"
            )}>
              {proteinRate}%
            </p>
            <p className="text-xs text-[#666666] mt-1">
              {thisWeekData.proteinHits}/{thisWeekData.days} days hit
            </p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#A0A0A0]">Calories On Target</span>
            </div>
            <p className={cn(
              "text-3xl font-bold",
              calorieRate >= 80 ? "text-green-500" :
              calorieRate >= 50 ? "text-yellow-500" :
              "text-[#A0A0A0]"
            )}>
              {calorieRate}%
            </p>
            <p className="text-xs text-[#666666] mt-1">
              {thisWeekData.calorieHits}/{thisWeekData.days} days hit
            </p>
          </div>
        </div>
      </section>

      {/* Day-by-Day This Week */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Daily Breakdown</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="grid grid-cols-7 gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx} className="text-center text-xs text-[#666666]">
                {day}
              </div>
            ))}
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayData = stats?.daily?.find(d => d.date === dateStr);
              const hitBoth = dayData?.hitProteinGoal && dayData?.caloriesOnTarget;
              const hitOne = dayData?.hitProteinGoal || dayData?.caloriesOnTarget;
              const isToday = dateStr === format(today, 'yyyy-MM-dd');

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-xs font-medium",
                    isToday && "ring-2 ring-[#CDFF00]",
                    hitBoth ? "bg-green-500/20 text-green-500" :
                    hitOne ? "bg-yellow-500/20 text-yellow-500" :
                    dayData ? "bg-red-500/20 text-red-500" :
                    "bg-[#2A2A2A] text-[#666666]"
                  )}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
            {/* Fill remaining days to make 7 columns */}
            {Array.from({ length: 7 - weekDays.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="aspect-square rounded-lg bg-[#2A2A2A]/30"
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/20" />
              <span className="text-xs text-[#A0A0A0]">Both goals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500/20" />
              <span className="text-xs text-[#A0A0A0]">One goal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/20" />
              <span className="text-xs text-[#A0A0A0]">Missed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Compliance Chart */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">4-Week Trend</h2>
        <ComplianceCard />
      </section>

      {/* Protein Target Info */}
      <section className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Daily Protein Target</p>
            <p className="text-xs text-[#666666]">Based on your training goals</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#CDFF00]">{PROTEIN_TARGET}g</p>
          </div>
        </div>
      </section>
    </div>
  );
}
