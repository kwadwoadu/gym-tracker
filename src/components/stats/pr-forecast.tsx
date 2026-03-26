"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";
import { HEADING } from "@/lib/typography";
import {
  getTopPRPredictions,
  type PRPrediction,
} from "@/lib/ai/pr-predictor";
import type { WorkoutLog, Exercise } from "@/lib/api-client";

interface PRForecastProps {
  workoutLogs: WorkoutLog[];
  exercises: Map<string, Exercise>;
}

const confidenceColors = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-red-500",
};

const confidenceTextColors = {
  high: "text-green-500",
  medium: "text-yellow-500",
  low: "text-red-500",
};

export function PRForecast({ workoutLogs, exercises }: PRForecastProps) {
  const predictions = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) return [];

    const exerciseMap = new Map<string, { id: string; name: string }>();
    exercises.forEach((ex, id) => {
      exerciseMap.set(id, { id, name: ex.name });
    });

    return getTopPRPredictions(workoutLogs as never[], exerciseMap, 3);
  }, [workoutLogs, exercises]);

  if (predictions.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className={`${HEADING.h3} text-foreground`}>PR Forecast</h2>
        </div>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground text-center py-4">
            Train for 2+ weeks to unlock PR predictions
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h2 className={`${HEADING.h3} text-foreground`}>PR Forecast</h2>
      </div>
      <div className="space-y-3">
        {predictions.map((prediction) => (
          <PRPredictionCard key={prediction.exerciseId} prediction={prediction} />
        ))}
      </div>
    </section>
  );
}

function PRPredictionCard({ prediction }: { prediction: PRPrediction }) {
  const progressPercent = Math.min(
    100,
    Math.round(
      (prediction.currentBest.weight / prediction.targetWeight) * 100
    )
  );

  const estimatedDate = new Date(prediction.estimatedDate);
  const dateLabel = estimatedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const weeksLabel =
    prediction.estimatedWeeks <= 1
      ? "~1 week"
      : `~${Math.round(prediction.estimatedWeeks)} weeks`;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground truncate">
              {prediction.exerciseName}
            </p>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                confidenceColors[prediction.confidence]
              } text-black`}
            >
              {prediction.confidence}
            </span>
          </div>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {prediction.targetWeight}kg
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{weeksLabel}</p>
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{prediction.currentBest.weight}kg current</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          +{prediction.weeklyProgressionRate}kg/week
        </span>
        <span className={confidenceTextColors[prediction.confidence]}>
          R\u00B2: {prediction.rSquared}
        </span>
        <span>{prediction.dataPoints} data points</span>
      </div>
    </Card>
  );
}
