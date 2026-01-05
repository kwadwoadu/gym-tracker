'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ComplianceCard } from '@/components/nutrition/compliance-card';
import { useNutritionLog, useMealPlan } from '@/lib/queries';
import { calculateTotalMacros, type MealSlots } from '@/data/meal-templates';
import {
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  ClipboardList,
  ChevronRight,
  Target,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PROTEIN_TARGET = 180;

export default function NutritionDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLog, isLoading: logLoading } = useNutritionLog(today);
  const { data: todayPlan, isLoading: planLoading } = useMealPlan(today);

  const isLoading = logLoading || planLoading;

  // Calculate today's planned macros
  const slots: MealSlots = todayPlan?.slots ?? {
    breakfast: null,
    midMorning: null,
    lunch: null,
    snack: null,
    dinner: null,
  };
  const todayMacros = calculateTotalMacros(slots);
  const filledSlots = Object.values(slots).filter(Boolean).length;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Today's Status */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Today&apos;s Status</h2>

        {isLoading ? (
          <div className="bg-[#1A1A1A] rounded-xl p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#CDFF00]" />
          </div>
        ) : (
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] space-y-4">
            {/* Protein Goal Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  todayLog?.hitProteinGoal ? 'bg-[#22C55E]/20' : 'bg-[#2A2A2A]'
                )}>
                  {todayLog?.hitProteinGoal ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#666666]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Protein Goal</p>
                  <p className="text-xs text-[#666666]">
                    {todayLog?.hitProteinGoal ? 'Hit 180g today!' : 'Not logged yet'}
                  </p>
                </div>
              </div>
              <Link
                href="/nutrition/log"
                className="text-[#CDFF00] text-sm hover:underline"
              >
                Log
              </Link>
            </div>

            {/* Calories Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  todayLog?.caloriesOnTarget ? 'bg-[#22C55E]/20' : 'bg-[#2A2A2A]'
                )}>
                  {todayLog?.caloriesOnTarget ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#666666]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Calories On Target</p>
                  <p className="text-xs text-[#666666]">
                    {todayLog?.caloriesOnTarget ? 'Maintenance ~2500 cal' : 'Not logged yet'}
                  </p>
                </div>
              </div>
              <Link
                href="/nutrition/log"
                className="text-[#CDFF00] text-sm hover:underline"
              >
                Log
              </Link>
            </div>

            {/* Planned Protein */}
            <div className="pt-2 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#CDFF00]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#CDFF00]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Planned Protein</p>
                    <p className="text-xs text-[#666666]">
                      {filledSlots > 0 ? `${filledSlots} meals planned` : 'No meals planned'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-lg font-bold',
                    todayMacros.protein >= PROTEIN_TARGET ? 'text-[#22C55E]' :
                    todayMacros.protein >= PROTEIN_TARGET * 0.8 ? 'text-[#F59E0B]' :
                    'text-[#A0A0A0]'
                  )}>
                    {todayMacros.protein}g
                  </p>
                  <p className="text-xs text-[#666666]">/ {PROTEIN_TARGET}g</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Weekly Compliance */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Weekly Compliance</h2>
        <ComplianceCard />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <QuickActionCard
            href="/nutrition/log"
            icon={ClipboardList}
            title="Daily Checklist"
            description="Log protein and calorie compliance"
          />
          <QuickActionCard
            href="/nutrition/plan"
            icon={UtensilsCrossed}
            title="Meal Planner"
            description="Drag & drop meals for today"
          />
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] flex items-center justify-between hover:bg-[#2A2A2A] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#CDFF00]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-[#666666]">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#666666]" />
      </motion.div>
    </Link>
  );
}
