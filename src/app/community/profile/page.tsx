"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, User, Flame, Dumbbell, Trophy, Award } from "lucide-react";
import { userProfileApi, statsApi, badgesApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userProfileApi.get(),
  });

  // Fetch stats for streak and workout count
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => statsApi.get(),
  });

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ["user-badges"],
    queryFn: () => badgesApi.getUserBadges(),
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [shareStreak, setShareStreak] = useState(true);
  const [shareVolume, setShareVolume] = useState(false);
  const [shareWorkouts, setShareWorkouts] = useState(true);
  const [hasChanged, setHasChanged] = useState(false);

  // Initialize form when profile loads
  const initializeForm = () => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setShareStreak(profile.shareStreak);
      setShareVolume(profile.shareVolume);
      setShareWorkouts(profile.shareWorkouts);
    }
  };

  // Initialize on first load
  if (profile && !hasChanged && displayName === "" && profile.displayName) {
    initializeForm();
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      userProfileApi.update({
        displayName: displayName || null,
        bio: bio || null,
        shareStreak,
        shareVolume,
        shareWorkouts,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setHasChanged(false);
      router.push("/community");
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  const handleChange = () => {
    setHasChanged(true);
  };

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Avatar and Stats */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-12 h-12 text-white/60" />
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="flex gap-4 w-full">
              <Card className="flex-1 p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </Card>
              <Card className="flex-1 p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Dumbbell className="w-4 h-4 text-[#CDFF00]" />
                  <span className="text-2xl font-bold">{stats.totalWorkouts}</span>
                </div>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </Card>
              <Card className="flex-1 p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats.personalRecordsCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">PRs</p>
              </Card>
            </div>
          )}
        </div>

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

        {/* Profile Form */}
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                handleChange();
              }}
            />
            <p className="text-xs text-muted-foreground">
              This is how others will see you in the community
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              placeholder="Tell others about yourself"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                handleChange();
              }}
            />
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">Privacy Settings</h2>
          <p className="text-sm text-muted-foreground">
            Choose what to share with your followers
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Streak</p>
                <p className="text-sm text-muted-foreground">Show your workout streak</p>
              </div>
              <Switch
                checked={shareStreak}
                onCheckedChange={(checked) => {
                  setShareStreak(checked);
                  handleChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Volume</p>
                <p className="text-sm text-muted-foreground">Show your total workout volume</p>
              </div>
              <Switch
                checked={shareVolume}
                onCheckedChange={(checked) => {
                  setShareVolume(checked);
                  handleChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Workouts</p>
                <p className="text-sm text-muted-foreground">Show workout activity to followers</p>
              </div>
              <Switch
                checked={shareWorkouts}
                onCheckedChange={(checked) => {
                  setShareWorkouts(checked);
                  handleChange();
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
