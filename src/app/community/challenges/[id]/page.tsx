"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  Target,
  Flame,
  Dumbbell,
  Calendar,
  Users,
  Trophy,
} from "lucide-react";
import { challengesApi } from "@/lib/api-client";
import type { ChallengeType, ChallengeParticipant } from "@/lib/api-client";

const challengeTypeConfig: Record<ChallengeType, { label: string; icon: React.ReactNode; color: string }> = {
  streak: { label: "Streak", icon: <Flame className="w-6 h-6" />, color: "text-orange-400" },
  volume: { label: "Volume", icon: <Dumbbell className="w-6 h-6" />, color: "text-blue-400" },
  workouts: { label: "Workouts", icon: <Calendar className="w-6 h-6" />, color: "text-[#CDFF00]" },
  consistency: { label: "Consistency", icon: <Target className="w-6 h-6" />, color: "text-purple-400" },
};

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => { setNow(Date.now()); }, []);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => challengesApi.get(id),
  });

  const joinMutation = useMutation({
    mutationFn: () => challengesApi.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Challenge not found</p>
      </div>
    );
  }

  const config = challengeTypeConfig[challenge.type as ChallengeType] || challengeTypeConfig.workouts;
  const daysLeft = now ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - now) / (1000 * 60 * 60 * 24))) : 0;
  const isActive = now ? new Date(challenge.endDate).getTime() >= now : true;
  const isParticipant = challenge.participants?.some((p: ChallengeParticipant) => p.progress !== undefined);

  // Sort participants by progress
  const sortedParticipants = [...(challenge.participants || [])].sort(
    (a: ChallengeParticipant, b: ChallengeParticipant) => b.progress - a.progress
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold truncate">{challenge.name}</h1>
        </div>
      </header>

      {/* Challenge Info */}
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full bg-white/10 flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{challenge.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="secondary">{config.label}</Badge>
                <span>-</span>
                <span>Target: {challenge.target}</span>
              </div>
            </div>
          </div>
          {challenge.description && (
            <p className="text-muted-foreground mb-4">{challenge.description}</p>
          )}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#CDFF00]">{challenge.participantCount}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{challenge.target}</p>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{daysLeft}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
          </div>
        </Card>

        {/* Join/Progress */}
        {!isParticipant && isActive ? (
          <Button
            className="w-full h-12"
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Join Challenge
              </>
            )}
          </Button>
        ) : !isActive ? (
          <Card className="p-4 text-center bg-muted/50">
            <p className="text-muted-foreground">This challenge has ended</p>
          </Card>
        ) : null}

        {/* Leaderboard */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </h3>
          <Card className="divide-y divide-border">
            {sortedParticipants.length > 0 ? (
              sortedParticipants.map((participant: ChallengeParticipant, index: number) => (
                <div key={participant.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      index === 1 ? "bg-gray-400/20 text-gray-400" :
                      index === 2 ? "bg-orange-600/20 text-orange-600" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {participant.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={participant.user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <Users className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {participant.user?.displayName || "Anonymous"}
                      </p>
                      <Progress
                        value={(participant.progress / challenge.target) * 100}
                        className="h-2 mt-1"
                      />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#CDFF00]">{participant.progress}</p>
                      <p className="text-xs text-muted-foreground">/ {challenge.target}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No participants yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
