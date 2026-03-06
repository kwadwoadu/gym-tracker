"use client";

import { Card } from "@/components/ui/card";
import { ArrowUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types/templates";
import { SPLIT_LABELS, DIFFICULTY_LABELS } from "@/types/templates";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onVote: (id: string) => void;
  onView: (template: WorkoutTemplate) => void;
}

export function TemplateCard({ template, onVote, onView }: TemplateCardProps) {
  return (
    <Card
      className="bg-card border-border p-4 active:scale-[0.98] transition-transform"
      onClick={() => onView(template)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{template.programName}</h3>
          <p className="text-sm text-white/50 truncate">by @{template.authorName}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
              {template.dayCount} days
            </span>
            <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
              {DIFFICULTY_LABELS[template.difficulty]}
            </span>
            <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
              {SPLIT_LABELS[template.splitType]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* Upvote */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(template.id);
            }}
            className={cn(
              "flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-colors",
              template.hasVoted
                ? "text-primary bg-primary/10"
                : "text-white/40 hover:text-white/60"
            )}
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-xs font-medium">{template.upvotes}</span>
          </button>

          {/* Import count */}
          <div className="flex items-center gap-1 text-white/30">
            <Download className="w-3 h-3" />
            <span className="text-xs">{template.imports}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
