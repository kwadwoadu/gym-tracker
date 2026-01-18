"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Users,
  Flame,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { leaderboardApi } from "@/lib/api-client";
import type { LeaderboardEntry } from "@/lib/api-client";

export default function LeaderboardPage() {
  const router = useRouter();
  const [metric, setMetric] = useState<"workouts" | "volume" | "streak">("workouts");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", metric],
    queryFn: () => leaderboardApi.get(metric),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  const getMetricLabel = (m: string) => {
    switch (m) {
      case "streak":
        return "day streak";
      case "volume":
        return "kg volume";
      default:
        return "workouts";
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Weekly Leaderboard</h1>
        </div>
      </header>

      {/* Metric Tabs */}
      <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="workouts" className="flex-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex-1 flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex-1 flex items-center gap-1">
              <Flame className="w-4 h-4" />
              Streak
            </TabsTrigger>
          </TabsList>
        </div>

        {["workouts", "volume", "streak"].map((m) => (
          <TabsContent key={m} value={m} className="mt-4">
            <div className="px-4">
              {leaderboard && leaderboard.length > 0 ? (
                <Card className="overflow-hidden">
                  {leaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      index={index}
                      metricLabel={getMetricLabel(m)}
                    />
                  ))}
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No data yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow friends to compete on the leaderboard
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info */}
      <div className="px-4 mt-6">
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Leaderboard shows you and your friends this week.
            <br />
            Rankings update every 5 minutes.
          </p>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  index,
  metricLabel,
}: {
  entry: LeaderboardEntry;
  index: number;
  metricLabel: string;
}) {
  const rank = entry.rank;

  return (
    <div className={`flex items-center gap-3 p-4 ${index > 0 && "border-t border-border"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
        rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
        rank === 2 ? "bg-gray-400/20 text-gray-400" :
        rank === 3 ? "bg-orange-600/20 text-orange-600" :
        "bg-white/10 text-white/60"
      }`}>
        {rank === 1 && <Trophy className="w-5 h-5" />}
        {rank !== 1 && rank}
      </div>
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
        ) : (
          <Users className="w-6 h-6 text-white/60" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{entry.displayName || "Anonymous"}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-[#CDFF00]">
          {entry.metric === "volume" ? entry.value.toLocaleString() : entry.value}
        </p>
        <p className="text-xs text-muted-foreground">{metricLabel}</p>
      </div>
    </div>
  );
}
