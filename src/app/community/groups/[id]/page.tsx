"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Users,
  Target,
  Dumbbell,
  Heart,
  Zap,
  LogOut,
  Settings,
  UserPlus,
} from "lucide-react";
import { groupsApi } from "@/lib/api-client";
import type { GroupGoalType, GroupMember } from "@/lib/api-client";

const goalTypeConfig: Record<GroupGoalType, { label: string; icon: React.ReactNode; color: string }> = {
  strength: { label: "Strength", icon: <Dumbbell className="w-5 h-5" />, color: "text-red-400" },
  weight_loss: { label: "Weight Loss", icon: <Heart className="w-5 h-5" />, color: "text-pink-400" },
  muscle_building: { label: "Muscle Building", icon: <Target className="w-5 h-5" />, color: "text-orange-400" },
  endurance: { label: "Endurance", icon: <Zap className="w-5 h-5" />, color: "text-blue-400" },
  general: { label: "General", icon: <Users className="w-5 h-5" />, color: "text-[#CDFF00]" },
};

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupsApi.get(id),
  });

  const joinMutation = useMutation({
    mutationFn: () => groupsApi.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Group not found</p>
      </div>
    );
  }

  const config = goalTypeConfig[group.goalType as GroupGoalType] || goalTypeConfig.general;
  const isMember = group.members?.some((m: GroupMember) => m.role);
  const isAdmin = group.members?.some((m: GroupMember) => m.role === "admin");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold truncate">{group.name}</h1>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Group Info */}
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full bg-white/10 flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{group.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="secondary">{config.label}</Badge>
                <span>-</span>
                <span>{group.memberCount} members</span>
              </div>
            </div>
          </div>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </Card>

        {/* Actions */}
        {!isMember ? (
          <Button
            className="w-full h-12"
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Join Group
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => leaveMutation.mutate()}
            disabled={leaveMutation.isPending}
          >
            {leaveMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-2" />
                Leave Group
              </>
            )}
          </Button>
        )}

        {/* Members */}
        <div className="space-y-3">
          <h3 className="font-semibold">Members ({group.members?.length || 0})</h3>
          <Card className="divide-y divide-border">
            {group.members?.map((member: GroupMember) => (
              <div key={member.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  {member.user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <Users className="w-5 h-5 text-white/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.user?.displayName || "Anonymous"}
                  </p>
                </div>
                {member.role === "admin" && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
