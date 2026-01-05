'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Target, Flame, Loader2 } from 'lucide-react';
import { useNutritionLog, useUpdateNutritionLog } from '@/lib/queries';
import { cn } from '@/lib/utils';

interface DailyChecklistProps {
  date: string;
}

export function DailyChecklist({ date }: DailyChecklistProps) {
  const { data: log, isLoading } = useNutritionLog(date);
  const updateLog = useUpdateNutritionLog();
  const [notes, setNotes] = useState(log?.notes || '');

  const handleToggle = (field: 'hitProteinGoal' | 'caloriesOnTarget') => {
    const currentValue = log?.[field] ?? false;
    updateLog.mutate({
      date,
      [field]: !currentValue,
    });
  };

  const handleNotesBlur = () => {
    if (notes !== log?.notes) {
      updateLog.mutate({
        date,
        notes: notes || null,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  const proteinHit = log?.hitProteinGoal ?? false;
  const caloriesHit = log?.caloriesOnTarget ?? false;

  return (
    <div className="space-y-6">
      {/* Protein Goal Toggle */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => handleToggle('hitProteinGoal')}
        className={cn(
          'w-full p-6 rounded-2xl border-2 transition-all duration-200',
          proteinHit
            ? 'bg-[#CDFF00]/10 border-[#CDFF00] text-white'
            : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0]'
        )}
        disabled={updateLog.isPending}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                proteinHit ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A]'
              )}
            >
              <Target
                className={cn(
                  'w-6 h-6',
                  proteinHit ? 'text-[#0A0A0A]' : 'text-[#666666]'
                )}
              />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Protein Goal</p>
              <p className="text-sm text-[#A0A0A0]">Hit 180g+ protein today?</p>
            </div>
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              proteinHit ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A]'
            )}
          >
            {proteinHit ? (
              <Check className="w-5 h-5 text-[#0A0A0A]" />
            ) : (
              <X className="w-5 h-5 text-[#666666]" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Calories Toggle */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => handleToggle('caloriesOnTarget')}
        className={cn(
          'w-full p-6 rounded-2xl border-2 transition-all duration-200',
          caloriesHit
            ? 'bg-[#CDFF00]/10 border-[#CDFF00] text-white'
            : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0]'
        )}
        disabled={updateLog.isPending}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                caloriesHit ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A]'
              )}
            >
              <Flame
                className={cn(
                  'w-6 h-6',
                  caloriesHit ? 'text-[#0A0A0A]' : 'text-[#666666]'
                )}
              />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Calories On Target</p>
              <p className="text-sm text-[#A0A0A0]">Maintenance ~2500 cal?</p>
            </div>
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              caloriesHit ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A]'
            )}
          >
            {caloriesHit ? (
              <Check className="w-5 h-5 text-[#0A0A0A]" />
            ) : (
              <X className="w-5 h-5 text-[#666666]" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Notes */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Any notes about today's nutrition..."
          className="w-full bg-[#2A2A2A] text-white rounded-lg p-3 text-sm placeholder:text-[#666666] border-none focus:outline-none focus:ring-2 focus:ring-[#CDFF00] resize-none"
          rows={3}
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            proteinHit && caloriesHit
              ? 'bg-[#22C55E]/20 text-[#22C55E]'
              : proteinHit || caloriesHit
                ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                : 'bg-[#2A2A2A] text-[#666666]'
          )}
        >
          {proteinHit && caloriesHit
            ? 'Perfect day!'
            : proteinHit || caloriesHit
              ? 'Partial compliance'
              : 'Not logged yet'}
        </div>
      </div>
    </div>
  );
}
