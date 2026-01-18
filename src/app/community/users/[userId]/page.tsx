"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  User,
  Flame,
  Dumbbell,
  Trophy,
  Award,
  UserPlus,
  UserMinus,
  Clock,
} from "lucide-react";
import { userProfileApi, badgesApi, followApi, activityApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.userId as string;

  // Fetch public profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => userProfileApi.getByUserId(userId),
  });

  // Check if following this user
  const { data: isFollowingUser, isLoading: followLoading } = useQuery({
    queryKey: ["is-following", userId],
    queryFn: () => followApi.isFollowing(userId),
  });

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: () => badgesApi.getUserBadges(userId),
    enabled: !!profile,
  });

  // Follow/Unfollow mutations
  const followMutation = useMutation({
    mutationFn: () => followApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const stats = profile.stats;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/60" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {profile.displayName || "Anonymous"}
            </h2>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            )}
          </div>

          {/* Follow Button */}
          <Button
            onClick={handleFollowToggle}
            disabled={isPending || followLoading}
            variant={isFollowingUser ? "outline" : "default"}
            className={cn(
              "w-40",
              !isFollowingUser && "bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isFollowingUser ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards (if shared) */}
        {stats && (
          <div className="flex gap-4 w-full">
            {profile.shareStreak && (
              <Card className="flex-1 p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.currentStreak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </Card>
            )}
            <Card className="flex-1 p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-[#CDFF00]" />
                <span className="text-2xl font-bold">{stats.totalWorkouts || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </Card>
            {profile.shareVolume && (
              <Card className="flex-1 p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats.personalRecordsCount || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">PRs</p>
              </Card>
            )}
          </div>
        )}

        {/* Badges Section */}
        {userBadges && userBadges.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#CDFF00]" />
              <h2 className="font-semibold">Badges</h2>
              <Badge variant="secondary" className="ml-auto">
                {userBadges.length}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {userBadges.filter((ub) => ub.badge).map((ub) => (
                <div
                  key={ub.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    ub.badge!.tier === "gold" ? "bg-yellow-500/20" :
                    ub.badge!.tier === "silver" ? "bg-gray-400/20" :
                    "bg-orange-600/20"
                  )}>
                    <Award className={cn(
                      "w-5 h-5",
                      ub.badge!.tier === "gold" ? "text-yellow-500" :
                      ub.badge!.tier === "silver" ? "text-gray-400" :
                      "text-orange-600"
                    )} />
                  </div>
                  <p className="text-xs font-medium text-center line-clamp-1">
                    {ub.badge!.name}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity (if workouts shared) */}
        {profile.shareWorkouts && stats?.recentWorkouts && stats.recentWorkouts.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#CDFF00]" />
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {stats.recentWorkouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{workout.dayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.duration ? `${workout.duration} min` : "Workout"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
