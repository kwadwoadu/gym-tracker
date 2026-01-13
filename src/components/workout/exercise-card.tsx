"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { cn, getYouTubeThumbnail, isYouTubeUrl } from "@/lib/utils";
import { MuscleMap } from "@/components/shared/MuscleMap";

interface ExerciseCardProps {
  name: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
  videoUrl?: string | null;
  muscleGroups: string[];
  muscles?: {
    primary: string[];
    secondary: string[];
  };
  supersetLabel: string;
  exerciseLabel: string; // "1" or "2" for A1, A2
  lastWeekWeight?: number;
  lastWeekReps?: number;
}

export function ExerciseCard({
  name,
  sets,
  reps,
  tempo,
  restSeconds,
  videoUrl,
  muscleGroups,
  muscles,
  supersetLabel,
  exerciseLabel,
  lastWeekWeight,
  lastWeekReps,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTempo = (tempo: string) => {
    // T:30A1 -> "3s down, controlled up, 1s hold"
    if (!tempo.startsWith("T:")) return tempo;
    const parts = tempo.slice(2);
    if (parts.length !== 4) return tempo;

    const eccentric = parts[0];
    const pauseBottom = parts[1];
    const concentric = parts[2];
    const pauseTop = parts[3];

    const descriptions: string[] = [];
    if (eccentric !== "0") descriptions.push(`${eccentric}s down`);
    if (pauseBottom !== "0") descriptions.push(`${pauseBottom}s pause`);
    if (concentric === "X") descriptions.push("explosive up");
    else if (concentric === "A") descriptions.push("controlled up");
    else if (concentric !== "0") descriptions.push(`${concentric}s up`);
    if (pauseTop !== "0") descriptions.push(`${pauseTop}s hold`);

    return descriptions.join(", ");
  };

  return (
    <Card
      className={cn(
        "bg-card border-border p-4 cursor-pointer transition-all",
        "active:scale-[0.98] touch-target"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        {/* Superset badge */}
        <div className="flex flex-col items-center">
          <Badge
            variant="default"
            className="bg-primary text-primary-foreground font-bold text-sm px-2 py-1"
          >
            {supersetLabel}
            {exerciseLabel}
          </Badge>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {sets} sets x {reps} reps
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {tempo && (
              <Badge variant="secondary" className="text-xs">
                {tempo}
              </Badge>
            )}
            {restSeconds !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {restSeconds}s rest
              </Badge>
            )}
          </div>
          {lastWeekWeight && lastWeekReps && (
            <p className="text-xs text-muted-foreground mt-2">
              Last week: {lastWeekWeight}kg x {lastWeekReps}
            </p>
          )}
        </div>

        {/* Expand indicator */}
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="space-y-3">
            {/* Tempo explanation */}
            {tempo && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Tempo
                </p>
                <p className="text-sm text-foreground">{formatTempo(tempo)}</p>
              </div>
            )}

            {/* Muscle visualization */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Muscles Targeted
              </p>
              {muscles ? (
                <MuscleMap
                  muscles={muscles}
                  showBothViews={true}
                  showLegend={true}
                  size="sm"
                />
              ) : (
                <div className="flex gap-1 flex-wrap">
                  {muscleGroups.map((muscle) => (
                    <Badge key={muscle} variant="outline" className="text-xs capitalize">
                      {muscle.replace("-", " ").replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Video thumbnail or link */}
            {videoUrl && (
              <>
                {isYouTubeUrl(videoUrl) ? (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block touch-target"
                  >
                    <div className="relative rounded-lg overflow-hidden group">
                      <img
                        src={getYouTubeThumbnail(videoUrl) || ""}
                        alt={`${name} demonstration`}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 text-xs text-white/90 bg-black/60 px-2 py-1 rounded">
                        Watch demo
                      </span>
                    </div>
                  </a>
                ) : (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-primary hover:underline text-sm touch-target"
                  >
                    <Play className="w-4 h-4" />
                    Watch demonstration
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
