'use client';

import { useNutritionStats } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Target, Flame, TrendingUp, Loader2 } from 'lucide-react';

interface ComplianceCardProps {
  className?: string;
}

export function ComplianceCard({ className }: ComplianceCardProps) {
  const { data: stats, isLoading } = useNutritionStats();

  if (isLoading) {
    return (
      <div className={cn('bg-card rounded-xl p-6 border border-border', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const proteinPercentage = stats?.overall?.proteinCompliance ?? 0;
  const caloriesPercentage = stats?.overall?.calorieCompliance ?? 0;
  const daysLogged = stats?.overall?.proteinDays ?? 0;
  const totalDays = stats?.overall?.totalDays ?? 7;

  return (
    <div className={cn('bg-card rounded-xl p-6 border border-border', className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">This Week&apos;s Compliance</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Protein Compliance */}
        <div className="bg-background rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Protein Goal</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'text-3xl font-bold',
              proteinPercentage >= 80 ? 'text-gym-success' :
              proteinPercentage >= 50 ? 'text-gym-warning' :
              'text-muted-foreground'
            )}>
              {Math.round(proteinPercentage)}
            </span>
            <span className="text-sm text-dim-foreground">%</span>
          </div>
          <ComplianceBar percentage={proteinPercentage} />
        </div>

        {/* Calories Compliance */}
        <div className="bg-background rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-gym-warning" />
            <span className="text-xs text-muted-foreground">Calories On Target</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'text-3xl font-bold',
              caloriesPercentage >= 80 ? 'text-gym-success' :
              caloriesPercentage >= 50 ? 'text-gym-warning' :
              'text-muted-foreground'
            )}>
              {Math.round(caloriesPercentage)}
            </span>
            <span className="text-sm text-dim-foreground">%</span>
          </div>
          <ComplianceBar percentage={caloriesPercentage} color="warning" />
        </div>
      </div>

      {/* Days Logged */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-dim-foreground" />
          <span className="text-sm text-muted-foreground">Days Logged</span>
        </div>
        <span className="text-sm font-medium text-white">
          {daysLogged} / {totalDays}
        </span>
      </div>
    </div>
  );
}

function ComplianceBar({
  percentage,
  color = 'primary'
}: {
  percentage: number;
  color?: 'primary' | 'warning';
}) {
  const barColor = color === 'primary' ? 'bg-primary' : 'bg-gym-warning';

  return (
    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', barColor)}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}
