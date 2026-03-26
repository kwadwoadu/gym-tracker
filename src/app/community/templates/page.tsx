"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Loader2,
  Dumbbell,
  Plus,
  SlidersHorizontal,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateCard } from "@/components/community/template-card";
import { TemplatePreview } from "@/components/community/template-preview";
import { TemplateBuilder } from "@/components/sharing/TemplateBuilder";
import type { WorkoutTemplate, SplitType, Difficulty } from "@/types/templates";
import { importTemplate } from "@/lib/templates";

// ============================================================
// Filter Configs
// ============================================================

const SPLIT_FILTERS: { value: SplitType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ppl", label: "PPL" },
  { value: "upper_lower", label: "Upper/Lower" },
  { value: "full_body", label: "Full Body" },
  { value: "bro_split", label: "Bro Split" },
  { value: "other", label: "Other" },
];

const DIFFICULTY_FILTERS: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DAYS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "3", label: "3 days" },
  { value: "4", label: "4 days" },
  { value: "5", label: "5 days" },
  { value: "6", label: "6 days" },
];

// ============================================================
// Fetch
// ============================================================

interface TemplateFilters {
  splitType?: string;
  difficulty?: string;
  dayCount?: string;
  search?: string;
  sort?: string;
}

async function fetchTemplates(filters: TemplateFilters) {
  const sp = new URLSearchParams();
  if (filters.splitType && filters.splitType !== "all")
    sp.set("splitType", filters.splitType);
  if (filters.difficulty && filters.difficulty !== "all")
    sp.set("difficulty", filters.difficulty);
  if (filters.dayCount && filters.dayCount !== "all")
    sp.set("dayCount", filters.dayCount);
  if (filters.search) sp.set("search", filters.search);
  if (filters.sort) sp.set("sort", filters.sort);

  const res = await fetch(`/api/templates?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

// ============================================================
// Page
// ============================================================

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter state
  const [search, setSearch] = useState("");
  const [splitFilter, setSplitFilter] = useState<SplitType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [daysFilter, setDaysFilter] = useState("all");
  const [sort, setSort] = useState<"upvotes" | "newest">("upvotes");
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: [
      "templates",
      splitFilter,
      difficultyFilter,
      daysFilter,
      search,
      sort,
    ],
    queryFn: () =>
      fetchTemplates({
        splitType: splitFilter,
        difficulty: difficultyFilter,
        dayCount: daysFilter,
        search: search || undefined,
        sort,
      }),
  });

  const templates: WorkoutTemplate[] = templatesData?.templates || [];

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(`/api/templates/${templateId}/vote`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: importTemplate,
    onSuccess: () => {
      setPreviewOpen(false);
      showToast("Program imported successfully!", "success");
      // Navigate after a brief delay to show toast
      setTimeout(() => router.push("/programs"), 1500);
    },
    onError: () => {
      showToast("Failed to import program. Try again.", "error");
    },
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleView = useCallback((template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const handleVote = useCallback(
    (id: string) => voteMutation.mutate(id),
    [voteMutation]
  );

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 left-4 right-4 z-50 p-4 rounded-lg flex items-center gap-3 shadow-lg",
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          )}
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
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center justify-between px-4 pt-safe-top pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/community")}
              className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-white/60" />
            </button>
            <h1 className="text-lg font-bold text-white">Template Library</h1>
          </div>
          <Button
            size="sm"
            className="bg-primary text-black hover:bg-primary/80"
            onClick={() => setBuilderOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        {/* Split type chips */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SPLIT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSplitFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px]",
                splitFilter === f.value
                  ? "bg-primary text-black"
                  : "bg-card text-white/50"
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 min-h-[32px]",
              showFilters ? "bg-primary/20 text-primary" : "bg-card text-white/50"
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3">
            {/* Difficulty */}
            <div>
              <p className="text-xs text-white/40 mb-1.5 font-medium">Level</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {DIFFICULTY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setDifficultyFilter(f.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px]",
                      difficultyFilter === f.value
                        ? "bg-primary text-black"
                        : "bg-card text-white/50"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div>
              <p className="text-xs text-white/40 mb-1.5 font-medium">
                Days per week
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {DAYS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setDaysFilter(f.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px]",
                      daysFilter === f.value
                        ? "bg-primary text-black"
                        : "bg-card text-white/50"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <button
            onClick={() => setSort("upvotes")}
            className={cn(
              "text-xs font-medium",
              sort === "upvotes" ? "text-primary" : "text-white/40"
            )}
          >
            Popular
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setSort("newest")}
            className={cn(
              "text-xs font-medium",
              sort === "newest" ? "text-primary" : "text-white/40"
            )}
          >
            Newest
          </button>
          <span className="flex-1" />
          <span className="text-xs text-white/30">
            {templates.length} template{templates.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {/* Template List */}
      <div className="px-4 pt-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">No templates found</p>
            <p className="text-xs text-white/30 mt-1">
              {search || splitFilter !== "all" || difficultyFilter !== "all"
                ? "Try adjusting your filters"
                : "Be the first to share a program!"}
            </p>
            {!search && splitFilter === "all" && (
              <Button
                size="sm"
                className="mt-4 bg-primary text-black hover:bg-primary/80"
                onClick={() => setBuilderOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Share Your Program
              </Button>
            )}
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onVote={handleVote}
              onView={handleView}
            />
          ))
        )}
      </div>

      {/* Template Preview Drawer */}
      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onImport={(t) => importMutation.mutate(t)}
        onVote={handleVote}
        isImporting={importMutation.isPending}
      />

      {/* Template Builder Drawer */}
      <TemplateBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
      />
    </div>
  );
}
