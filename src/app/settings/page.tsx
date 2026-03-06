"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Flame,
  Dumbbell,
  Trophy,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<Toast | null>(null);

  // Privacy state
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

  // Update privacy mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<{
      shareStreak: boolean;
      shareVolume: boolean;
      shareWorkouts: boolean;
    }>) =>
      userProfileApi.update({
        shareStreak: data.shareStreak ?? shareStreak,
        shareVolume: data.shareVolume ?? shareVolume,
        shareWorkouts: data.shareWorkouts ?? shareWorkouts,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showToast("Saved!", "success");
    },
    onError: () => {
      showToast("Failed to save", "error");
    },
  });

  // Initialize privacy state when profile loads
  useEffect(() => {
    if (profile && !profileInitialized) {
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
      <Card className="bg-card border-border p-4">
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
          <div className="flex justify-around mt-4 pt-4 border-t border-border">
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

      {/* Profile Info - navigate to sub-page */}
      <Card
        className="bg-card border-border p-4 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => router.push("/settings/profile")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-white">Edit Profile</p>
              <p className="text-sm text-white/40">Name, handle, bio</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
      </Card>

      {/* Notifications */}
      <Card
        className="bg-card border-border p-4 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => router.push("/settings/notifications")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-white">Notifications</p>
              <p className="text-sm text-white/40">Reminders, alerts, digest</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
      </Card>

      {/* Privacy */}
      <Card className="bg-card border-border">
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
