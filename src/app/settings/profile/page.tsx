"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileApi } from "@/lib/api-client";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<Toast | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userProfileApi.get(),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: () =>
      userProfileApi.update({
        displayName: displayName || null,
        bio: bio || null,
        handle: handle || null,
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
    <div className="min-h-screen bg-background">
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

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pb-3 border-b border-border">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white">Edit Profile</h1>
      </header>

      <div className="p-4">
        <Card className="bg-card border-border">
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="handle"
                  placeholder="yourhandle"
                  value={handle}
                  onChange={(e) =>
                    setHandle(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
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
              onClick={() => updateProfileMutation.mutate()}
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
      </div>
    </div>
  );
}
