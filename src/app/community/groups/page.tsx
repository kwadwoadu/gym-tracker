"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Users,
  Plus,
  Target,
  Dumbbell,
  Heart,
  Zap,
  ChevronRight,
} from "lucide-react";
import { groupsApi } from "@/lib/api-client";
import type { Group, GroupGoalType } from "@/lib/api-client";

const goalTypeConfig: Record<GroupGoalType, { label: string; icon: React.ReactNode; color: string }> = {
  strength: { label: "Strength", icon: <Dumbbell className="w-4 h-4" />, color: "text-red-400" },
  weight_loss: { label: "Weight Loss", icon: <Heart className="w-4 h-4" />, color: "text-pink-400" },
  muscle_building: { label: "Muscle Building", icon: <Target className="w-4 h-4" />, color: "text-orange-400" },
  endurance: { label: "Endurance", icon: <Zap className="w-4 h-4" />, color: "text-blue-400" },
  general: { label: "General", icon: <Users className="w-4 h-4" />, color: "text-[#CDFF00]" },
};

export default function GroupsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("discover");
  const [filterGoal, setFilterGoal] = useState<GroupGoalType | null>(null);

  const { data: allGroups, isLoading: allLoading } = useQuery({
    queryKey: ["groups", "all", filterGoal],
    queryFn: () => groupsApi.list(filterGoal ? { goalType: filterGoal } : undefined),
  });

  const { data: myGroups, isLoading: myLoading } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => groupsApi.list({ joined: true }),
  });

  const isLoading = allLoading || myLoading;

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
            <h1 className="text-xl font-bold">Groups</h1>
          </div>
          <Button size="sm" onClick={() => router.push("/community/groups/create")}>
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
            <TabsTrigger value="my-groups" className="flex-1">
              My Groups ({myGroups?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Discover Groups */}
        <TabsContent value="discover" className="mt-4">
          {/* Goal Filter */}
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
            <Badge
              variant={filterGoal === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilterGoal(null)}
            >
              All
            </Badge>
            {Object.entries(goalTypeConfig).map(([key, config]) => (
              <Badge
                key={key}
                variant={filterGoal === key ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilterGoal(key as GroupGoalType)}
              >
                {config.label}
              </Badge>
            ))}
          </div>

          <div className="px-4 space-y-3">
            {allGroups && allGroups.length > 0 ? (
              allGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No groups found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to create a group!
                </p>
                <Button onClick={() => router.push("/community/groups/create")}>
                  Create Group
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* My Groups */}
        <TabsContent value="my-groups" className="mt-4">
          <div className="px-4 space-y-3">
            {myGroups && myGroups.length > 0 ? (
              myGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join or create a group to connect with others
                </p>
                <Button onClick={() => setTab("discover")}>
                  Discover Groups
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  const config = goalTypeConfig[group.goalType as GroupGoalType] || goalTypeConfig.general;

  return (
    <Link href={`/community/groups/${group.id}`}>
      <Card className="p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{group.name}</p>
              {group.isJoined && (
                <Badge variant="secondary" className="text-xs">Joined</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{config.label}</span>
              <span>-</span>
              <span>{group.memberCount} members</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {group.description}
          </p>
        )}
      </Card>
    </Link>
  );
}
