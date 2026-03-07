"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Users,
  Trophy,
  Loader2,
  Dumbbell,
  ArrowLeft,
  Search,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { groupsApi, challengesApi, leaderboardApi, activityApi } from "@/lib/api-client";
import type { LeaderboardEntry, ActivityItem, Group, Challenge } from "@/lib/api-client";
import { TemplateCard } from "@/components/community/template-card";
import { TemplatePreview } from "@/components/community/template-preview";
import { LeaderboardList, type LeaderboardEntryData } from "@/components/community/leaderboard-list";
import { ActivityFeed, type ActivityItemData } from "@/components/community/activity-feed";
import { GroupChallengeCard } from "@/components/community/group-challenge-card";
import type { WorkoutTemplate, SplitType } from "@/types/templates";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "activity", label: "Activity", icon: Zap },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "templates", label: "Templates", icon: Dumbbell },
  { key: "groups", label: "Groups", icon: LayoutGrid },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const SPLIT_FILTERS: { value: SplitType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ppl", label: "PPL" },
  { value: "upper_lower", label: "Upper/Lower" },
  { value: "full_body", label: "Full Body" },
  { value: "bro_split", label: "Bro Split" },
];

async function fetchTemplates(params: { splitType?: string; search?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params.splitType && params.splitType !== "all") sp.set("splitType", params.splitType);
  if (params.search) sp.set("search", params.search);
  if (params.sort) sp.set("sort", params.sort);
  const res = await fetch(`/api/templates?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("leaderboard");
  const [templateSearch, setTemplateSearch] = useState("");
  const [splitFilter, setSplitFilter] = useState<SplitType | "all">("all");
  const [templateSort, setTemplateSort] = useState<"upvotes" | "newest">("upvotes");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Templates query
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ["templates", splitFilter, templateSearch, templateSort],
    queryFn: () => fetchTemplates({ splitType: splitFilter, search: templateSearch || undefined, sort: templateSort }),
  });

  const voteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(`/api/templates/${templateId}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  const importMutation = useMutation({
    mutationFn: async (template: WorkoutTemplate) => {
      const res = await fetch(`/api/templates/${template.id}/import`, { method: "POST" });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      const programRes = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.programName,
          description: `Imported from community - by @${template.authorName}`,
          programData: data.programData,
        }),
      });
      if (!programRes.ok) throw new Error("Failed to create program");
      return programRes.json();
    },
    onSuccess: () => {
      setPreviewOpen(false);
      router.push("/programs");
    },
  });

  const handleView = useCallback((template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const handleVote = useCallback((id: string) => voteMutation.mutate(id), [voteMutation]);

  const templates: WorkoutTemplate[] = templatesData?.templates || [];

  // Fetch community data
  const { data: groups } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => groupsApi.list({ joined: true }),
  });

  const { data: challenges } = useQuery({
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

  // Map API data to component props
  const leaderboardEntries: LeaderboardEntryData[] = useMemo(() => {
    if (!leaderboard) return [];
    return leaderboard.map((entry: LeaderboardEntry) => ({
      userId: entry.userId,
      name: entry.displayName || "Anonymous",
      xp: entry.value,
      avatarUrl: entry.avatarUrl || "",
    }));
  }, [leaderboard]);

  const activityItems: ActivityItemData[] = useMemo(() => {
    if (!activity) return [];
    return activity.map((item: ActivityItem) => {
      const actionText = getActionText(item);
      return {
        id: item.id,
        userId: item.userId,
        userName: item.displayName || "Anonymous",
        avatarUrl: item.avatarUrl || "",
        action: actionText,
        type: item.type,
        timestamp: item.createdAt,
        data: item.data,
      };
    });
  }, [activity]);

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-white/60" />
          </button>
          <h1 className="text-lg font-bold text-white">Community</h1>
        </div>
        <button
          onClick={() => router.push("/community/profile")}
          className="p-2 -mr-2"
        >
          <Users className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Tab Bar + Content */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="gap-0">
        <div className="px-4 pb-4">
          <TabsList className="flex w-full gap-1 bg-card rounded-xl p-1 h-auto">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all border-0 shadow-none",
                  "data-[state=active]:bg-primary data-[state=active]:text-black",
                  "data-[state=inactive]:text-white/40 data-[state=inactive]:bg-transparent"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="px-4">
            {activityLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ActivityFeed activities={activityItems} />
            )}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <div className="px-4">
            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <LeaderboardList
                entries={leaderboardEntries}
                currentUserId={user?.id ?? ""}
              />
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="px-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SPLIT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSplitFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    splitFilter === f.value
                      ? "bg-primary text-black"
                      : "bg-card text-white/50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTemplateSort("upvotes")}
                className={cn(
                  "text-xs font-medium",
                  templateSort === "upvotes" ? "text-primary" : "text-white/40"
                )}
              >
                Popular
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => setTemplateSort("newest")}
                className={cn(
                  "text-xs font-medium",
                  templateSort === "newest" ? "text-primary" : "text-white/40"
                )}
              >
                Newest
              </button>
            </div>
            {/* List */}
            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No programs yet</p>
                <p className="text-xs text-white/30 mt-1">
                  Be the first to share a program!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((t) => (
                  <TemplateCard key={t.id} template={t} onVote={handleVote} onView={handleView} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <div className="px-4 space-y-4">
            {/* Active Challenges */}
            {challenges && challenges.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.08em] text-white/40 font-semibold mb-2">
                  Active Challenges
                </h3>
                <div className="space-y-2">
                  {challenges.map((challenge: Challenge, i: number) => (
                    <GroupChallengeCard
                      key={challenge.id || i}
                      title={challenge.name || "Challenge"}
                      description={challenge.description || ""}
                      progress={challenge.myProgress || 0}
                      memberCount={challenge.participantCount || 0}
                      gradient={
                        i % 2 === 0
                          ? "bg-gradient-to-r from-primary/20 to-gym-blue/20"
                          : "bg-gradient-to-r from-gym-warning/20 to-gym-error/20"
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {groups && groups.length > 0 ? (
              <div>
                <h3 className="text-xs uppercase tracking-[0.08em] text-white/40 font-semibold mb-2">
                  Your Groups
                </h3>
                <div className="bg-card rounded-xl overflow-hidden divide-y divide-white/5">
                  {groups.map((group: Group, i: number) => (
                    <div
                      key={group.id || i}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {group.name || "Group"}
                        </p>
                        <p className="text-xs text-white/40">
                          {group.memberCount || 0} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No groups yet</p>
                <p className="text-xs text-white/30 mt-1">
                  Join or create a group to get started
                </p>
                <button
                  onClick={() => router.push("/community/groups")}
                  className="mt-4 px-6 py-3 rounded-xl bg-primary text-black font-semibold text-sm active:scale-[0.98] transition-transform"
                >
                  Find Groups
                </button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Sheet */}
      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onImport={(t) => importMutation.mutate(t)}
        onVote={handleVote}
        isImporting={importMutation.isPending}
      />
    </div>
  );
}

/** Map ActivityItem type to human-readable action text */
function getActionText(item: ActivityItem): string {
  switch (item.type) {
    case "workout_completed": {
      const data = (item.data && typeof item.data === "object") ? item.data as Record<string, unknown> : {};
      const parts = ["completed"];
      if (typeof data.dayName === "string") parts.push(data.dayName);
      if (typeof data.duration === "number") parts.push(`in ${data.duration} min`);
      return parts.join(" ");
    }
    case "pr_achieved": {
      const data = (item.data && typeof item.data === "object") ? item.data as Record<string, unknown> : {};
      const weight = typeof data.weight === "number" ? data.weight : "";
      const unit = typeof data.unit === "string" ? data.unit : "kg";
      const reps = typeof data.reps === "number" ? data.reps : "";
      const exerciseName = typeof data.exerciseName === "string" ? data.exerciseName : "exercise";
      return `set a new PR: ${weight}${unit} x${reps} on ${exerciseName}`;
    }
    case "challenge_joined":
      return "joined a challenge";
    case "badge_earned":
      return "earned a badge";
    case "group_joined":
      return "joined a group";
    default:
      return "activity";
  }
}
