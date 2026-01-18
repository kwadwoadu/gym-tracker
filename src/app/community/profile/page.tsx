"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, User } from "lucide-react";
import { userProfileApi } from "@/lib/api-client";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userProfileApi.get(),
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
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-12 h-12 text-white/60" />
          </div>
        </div>

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
