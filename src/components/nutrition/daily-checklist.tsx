'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Target, Flame, Loader2 } from 'lucide-react';
import { useNutritionLog, useUpdateNutritionLog, useNutritionProfile } from '@/lib/queries';
import { cn } from '@/lib/utils';

interface DailyChecklistProps {
  date: string;
}

export function DailyChecklist({ date }: DailyChecklistProps) {
  const { data: log, isLoading } = useNutritionLog(date);
  const updateLog = useUpdateNutritionLog();
  const { data: profile } = useNutritionProfile();
  const [notes, setNotes] = useState(log?.notes || '');

  const proteinTarget = profile?.proteinTrainingDay ?? 200;
  const calorieTarget = profile?.caloriesTrainingDay ?? 2800;

  // Sync notes state when log data changes (e.g., date navigation)
  useEffect(() => {
    setNotes(log?.notes || '');
  }, [log?.notes]);

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            ? 'bg-primary/10 border-primary text-white'
            : 'bg-card border-border text-muted-foreground'
        )}
        disabled={updateLog.isPending}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                proteinHit ? 'bg-primary' : 'bg-secondary'
              )}
            >
              <Target
                className={cn(
                  'w-6 h-6',
                  proteinHit ? 'text-primary-foreground' : 'text-dim-foreground'
                )}
              />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Protein Goal</p>
              <p className="text-sm text-muted-foreground">Hit {proteinTarget}g+ protein today?</p>
            </div>
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              proteinHit ? 'bg-primary' : 'bg-secondary'
            )}
          >
            {proteinHit ? (
              <Check className="w-5 h-5 text-primary-foreground" />
            ) : (
              <X className="w-5 h-5 text-dim-foreground" />
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
            ? 'bg-primary/10 border-primary text-white'
            : 'bg-card border-border text-muted-foreground'
        )}
        disabled={updateLog.isPending}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                caloriesHit ? 'bg-primary' : 'bg-secondary'
              )}
            >
              <Flame
                className={cn(
                  'w-6 h-6',
                  caloriesHit ? 'text-primary-foreground' : 'text-dim-foreground'
                )}
              />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Calories On Target</p>
              <p className="text-sm text-muted-foreground">Target ~{calorieTarget} cal?</p>
            </div>
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              caloriesHit ? 'bg-primary' : 'bg-secondary'
            )}
          >
            {caloriesHit ? (
              <Check className="w-5 h-5 text-primary-foreground" />
            ) : (
              <X className="w-5 h-5 text-dim-foreground" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Notes */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Any notes about today's nutrition..."
          className="w-full bg-secondary text-white rounded-lg p-3 text-sm placeholder:text-dim-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            proteinHit && caloriesHit
              ? 'bg-gym-success/20 text-gym-success'
              : proteinHit || caloriesHit
                ? 'bg-gym-warning/20 text-gym-warning'
                : 'bg-secondary text-dim-foreground'
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
