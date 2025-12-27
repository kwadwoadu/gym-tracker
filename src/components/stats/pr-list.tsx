"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { PersonalRecord } from "@/lib/db";

interface PRListProps {
  personalRecords: PersonalRecord[];
}

export function PRList({ personalRecords }: PRListProps) {
  if (personalRecords.length === 0) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Personal Records
          </h2>
        </div>
        <div className="py-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Complete workouts to set new PRs
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">
          Personal Records
        </h2>
        <Badge variant="secondary" className="ml-auto">
          {personalRecords.length}
        </Badge>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {personalRecords.slice(0, 10).map((pr) => (
          <div
            key={pr.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">{pr.exerciseName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(pr.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">
                {pr.weight}
                <span className="text-sm text-muted-foreground ml-1">kg</span>
              </p>
              <p className="text-xs text-muted-foreground">x {pr.reps} reps</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
