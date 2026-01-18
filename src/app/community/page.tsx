"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  Target,
  UserPlus,
  ChevronRight,
  Loader2,
  Dumbbell,
  Award,
  Home,
} from "lucide-react";
import { followApi, groupsApi, challengesApi, leaderboardApi, activityApi } from "@/lib/api-client";
import type { LeaderboardEntry, ActivityItem } from "@/lib/api-client";

export default function CommunityPage() {
  const router = useRouter();
  const [tab, setTab] = useState("activity");

  // Fetch community data
  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ["following"],
    queryFn: () => followApi.getFollowing(),
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => groupsApi.list({ joined: true }),
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["challenges", "active", "joined"],
    queryFn: () => challengesApi.list({ active: true, joined: true }),
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", "workouts"],
    queryFn: () => leaderboardApi.get("workouts"),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: () => activityApi.getFeed(10),
  });

  const isLoading = followingLoading || groupsLoading || challengesLoading || leaderboardLoading || activityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <Home className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Community</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/community/profile")}
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <Link href="/community/friends">
          <Card className="p-4 text-center hover:bg-white/5 transition-colors">
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-[#CDFF00]" />
            <p className="text-2xl font-bold">{following?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </Card>
        </Link>
        <Link href="/community/groups">
          <Card className="p-4 text-center hover:bg-white/5 transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{groups?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Groups</p>
          </Card>
        </Link>
        <Link href="/community/challenges">
          <Card className="p-4 text-center hover:bg-white/5 transition-colors">
            <Target className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">{challenges?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </Card>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="px-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1">Leaderboard</TabsTrigger>
          </TabsList>
        </div>

        {/* Activity Feed */}
        <TabsContent value="activity" className="mt-4">
          <div className="px-4 space-y-3">
            {activity && activity.length > 0 ? (
              activity.map((item) => (
                <ActivityCard key={item.id} item={item} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No activity yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow friends to see their workout activity
                </p>
                <Button onClick={() => router.push("/community/friends")}>
                  Find Friends
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <div className="px-4">
            {leaderboard && leaderboard.length > 0 ? (
              <Card className="overflow-hidden">
                {leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.userId} entry={entry} isFirst={index === 0} />
                ))}
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No leaderboard data</h3>
                <p className="text-sm text-muted-foreground">
                  Follow friends to compete on the leaderboard
                </p>
              </Card>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push("/community/leaderboard")}
            >
              View Full Leaderboard
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => router.push("/community/groups")}
          >
            <Users className="w-5 h-5" />
            <span>Find Groups</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => router.push("/community/challenges")}
          >
            <Target className="w-5 h-5" />
            <span>Join Challenge</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);

  const getActivityIcon = () => {
    switch (item.type) {
      case "workout_completed":
        return <Dumbbell className="w-4 h-4 text-[#CDFF00]" />;
      case "pr_achieved":
        return <Award className="w-4 h-4 text-orange-400" />;
      default:
        return <Users className="w-4 h-4 text-blue-400" />;
    }
  };

  const getActivityText = () => {
    switch (item.type) {
      case "workout_completed":
        const workoutData = item.data as { dayName?: string; duration?: number; totalVolume?: number };
        return (
          <>
            completed <span className="text-[#CDFF00]">{workoutData.dayName}</span>
            {workoutData.duration && ` in ${workoutData.duration} min`}
          </>
        );
      case "pr_achieved":
        const prData = item.data as { exerciseName?: string; weight?: number; reps?: number; unit?: string };
        return (
          <>
            set a new PR: <span className="text-orange-400">{prData.weight}{prData.unit}</span> x{prData.reps} on {prData.exerciseName}
          </>
        );
      default:
        return "activity";
    }
  };

  const timeAgo = (date: string) => {
    if (!now) return "";
    const diff = now - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          {item.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            getActivityIcon()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{item.displayName || "Anonymous"}</span>{" "}
            {getActivityText()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo(item.createdAt)}</p>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardRow({ entry, isFirst }: { entry: LeaderboardEntry; isFirst: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 ${!isFirst && "border-t border-border"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
        entry.rank === 2 ? "bg-gray-400/20 text-gray-400" :
        entry.rank === 3 ? "bg-orange-600/20 text-orange-600" :
        "bg-white/10 text-white/60"
      }`}>
        {entry.rank}
      </div>
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <Users className="w-4 h-4 text-white/60" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.displayName || "Anonymous"}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#CDFF00]">{entry.value}</p>
        <p className="text-xs text-muted-foreground">{entry.metric}</p>
      </div>
    </div>
  );
}
