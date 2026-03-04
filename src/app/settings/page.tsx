"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Save,
  Flame,
  Dumbbell,
  Trophy,
} from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileApi, statsApi } from "@/lib/api-client";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<Toast | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [shareStreak, setShareStreak] = useState(true);
  const [shareVolume, setShareVolume] = useState(false);
  const [shareWorkouts, setShareWorkouts] = useState(true);
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userProfileApi.get(),
  });

  // Fetch stats for display
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => statsApi.get(),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data?: Partial<{
      displayName: string | null;
      bio: string | null;
      handle: string | null;
      shareStreak: boolean;
      shareVolume: boolean;
      shareWorkouts: boolean;
    }>) =>
      userProfileApi.update({
        displayName: data?.displayName ?? (displayName || null),
        bio: data?.bio ?? (bio || null),
        handle: data?.handle ?? (handle || null),
        shareStreak: data?.shareStreak ?? shareStreak,
        shareVolume: data?.shareVolume ?? shareVolume,
        shareWorkouts: data?.shareWorkouts ?? shareWorkouts,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showToast("Profile saved!", "success");
    },
    onError: () => {
      showToast("Failed to save profile", "error");
    },
  });

  // Initialize profile form when data loads
  useEffect(() => {
    if (profile && !profileInitialized) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setHandle(profile.handle || "");
      setShareStreak(profile.shareStreak);
      setShareVolume(profile.shareVolume);
      setShareWorkouts(profile.shareWorkouts);
      setProfileInitialized(true);
    }
  }, [profile, profileInitialized]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <h2 className="text-[28px] font-bold tracking-tight text-white">Profile</h2>

      {/* Account Card */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
        <div className="flex items-center gap-3">
          {user?.imageUrl && (
            <Image
              src={user.imageUrl}
              alt={user.fullName || "User"}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {stats && (
          <div className="flex justify-around mt-4 pt-4 border-t border-[#2A2A2A]">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.currentStreak}</span>
              </div>
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-primary">
                <Dumbbell className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.totalWorkouts}</span>
              </div>
              <span className="text-xs text-muted-foreground">Workouts</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Trophy className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.personalRecordsCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">PRs</span>
            </div>
          </div>
        )}

        <SignOutButton>
          <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SignOutButton>
      </Card>

      {/* Profile Info */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Your community profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handle">Handle</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="handle"
                placeholder="yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              placeholder="Tell others about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <Button
            onClick={() => updateProfileMutation.mutate({})}
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Privacy</CardTitle>
          <CardDescription>Choose what to share with followers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Share Streak</p>
              <p className="text-sm text-muted-foreground">Show your workout streak</p>
            </div>
            <Switch
              checked={shareStreak}
              onCheckedChange={(checked) => {
                setShareStreak(checked);
                updateProfileMutation.mutate({ shareStreak: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Share Volume</p>
              <p className="text-sm text-muted-foreground">Show total volume</p>
            </div>
            <Switch
              checked={shareVolume}
              onCheckedChange={(checked) => {
                setShareVolume(checked);
                updateProfileMutation.mutate({ shareVolume: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Share Workouts</p>
              <p className="text-sm text-muted-foreground">Show workout activity</p>
            </div>
            <Switch
              checked={shareWorkouts}
              onCheckedChange={(checked) => {
                setShareWorkouts(checked);
                updateProfileMutation.mutate({ shareWorkouts: checked });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
