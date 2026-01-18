"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Target,
  Flame,
  Dumbbell,
  Calendar,
  ChevronRight,
  Plus,
} from "lucide-react";
import { challengesApi } from "@/lib/api-client";
import type { Challenge, ChallengeType } from "@/lib/api-client";

const challengeTypeConfig: Record<ChallengeType, { label: string; icon: React.ReactNode; color: string }> = {
  streak: { label: "Streak", icon: <Flame className="w-4 h-4" />, color: "text-orange-400" },
  volume: { label: "Volume", icon: <Dumbbell className="w-4 h-4" />, color: "text-blue-400" },
  workouts: { label: "Workouts", icon: <Calendar className="w-4 h-4" />, color: "text-[#CDFF00]" },
  consistency: { label: "Consistency", icon: <Target className="w-4 h-4" />, color: "text-purple-400" },
};

export default function ChallengesPage() {
  const router = useRouter();
  const [tab, setTab] = useState("active");

  const { data: activeChallenges, isLoading: activeLoading } = useQuery({
    queryKey: ["challenges", "active"],
    queryFn: () => challengesApi.list({ active: true }),
  });

  const { data: myChallenges, isLoading: myLoading } = useQuery({
    queryKey: ["challenges", "joined"],
    queryFn: () => challengesApi.list({ joined: true }),
  });

  const isLoading = activeLoading || myLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Challenges</h1>
          </div>
          <Button size="sm" onClick={() => router.push("/community/challenges/create")}>
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="my-challenges" className="flex-1">
              My Challenges ({myChallenges?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Active Challenges */}
        <TabsContent value="active" className="mt-4">
          <div className="px-4 space-y-3">
            {activeChallenges && activeChallenges.length > 0 ? (
              activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No active challenges</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a challenge to get started!
                </p>
                <Button onClick={() => router.push("/community/challenges/create")}>
                  Create Challenge
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* My Challenges */}
        <TabsContent value="my-challenges" className="mt-4">
          <div className="px-4 space-y-3">
            {myChallenges && myChallenges.length > 0 ? (
              myChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} showProgress />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No challenges joined</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join a challenge to track your progress
                </p>
                <Button onClick={() => setTab("active")}>
                  Browse Challenges
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChallengeCard({ challenge, showProgress = false }: { challenge: Challenge; showProgress?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const config = challengeTypeConfig[challenge.type as ChallengeType] || challengeTypeConfig.workouts;
  const progress = showProgress ? (challenge.myProgress || 0) / challenge.target * 100 : 0;
  const daysLeft = now ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - now) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <Link href={`/community/challenges/${challenge.id}`}>
      <Card className="p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{challenge.name}</p>
              {challenge.isJoined && (
                <Badge variant="secondary" className="text-xs">Joined</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">{config.label}</Badge>
              <span>-</span>
              <span>{challenge.participantCount} participants</span>
            </div>
            {showProgress && challenge.isJoined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{challenge.myProgress || 0} / {challenge.target}</span>
                  <span className="text-muted-foreground">{daysLeft} days left</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
        {challenge.description && !showProgress && (
          <p className="text-sm text-muted-foreground mt-2 ml-15 line-clamp-1">
            {challenge.description}
          </p>
        )}
      </Card>
    </Link>
  );
}
