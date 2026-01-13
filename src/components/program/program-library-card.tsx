"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Dumbbell,
  Archive,
  RotateCcw,
  Copy,
  Trash2,
  Eye,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ProgramLibraryCardProps {
  program: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    archivedAt: string | null;
    createdAt: string;
    trainingDays?: { id: string; name: string }[];
    workoutCount?: number;
    lastWorkoutDate?: string | null;
  };
  onView: () => void;
  onActivate?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function ProgramLibraryCard({
  program,
  onView,
  onActivate,
  onArchive,
  onRestore,
  onClone,
  onDelete,
  isLoading = false,
}: ProgramLibraryCardProps) {
  const isArchived = !!program.archivedAt;
  const isActive = program.isActive;

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#CDFF00] text-black">
          ACTIVE
        </span>
      );
    }
    if (isArchived) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60">
          ARCHIVED
        </span>
      );
    }
    return null;
  };

  const getLastUsedText = () => {
    if (!program.lastWorkoutDate) {
      return "Never used";
    }
    return `Last used ${formatDistanceToNow(new Date(program.lastWorkoutDate), { addSuffix: true })}`;
  };

  return (
    <motion.div
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-colors",
        "border-2",
        isActive
          ? "border-[#CDFF00] bg-[#CDFF00]/5"
          : isArchived
            ? "border-white/5 bg-[#1A1A1A]/60 opacity-60"
            : "border-white/10 bg-[#1A1A1A]"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with name and status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {program.name}
            </h3>
            {getStatusBadge()}
          </div>
          {program.description && (
            <p className="text-white/50 text-sm line-clamp-1">
              {program.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        <div className="flex items-center gap-2 text-white/60">
          <Calendar className="w-4 h-4" />
          <span>{program.trainingDays?.length ?? 0} days/week</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Dumbbell className="w-4 h-4" />
          <span>
            {program.workoutCount ?? 0} workout{(program.workoutCount ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-white/40 text-xs">{getLastUsedText()}</div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* View button - always shown */}
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          disabled={isLoading}
          className="bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          View
        </Button>

        {/* Activate button - shown for inactive, non-archived programs */}
        {!isActive && !isArchived && onActivate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onActivate}
            disabled={isLoading}
            className="bg-[#CDFF00]/10 border-[#CDFF00]/30 text-[#CDFF00] hover:bg-[#CDFF00]/20"
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            Activate
          </Button>
        )}

        {/* Archive button - shown for active and inactive (non-archived) programs */}
        {!isArchived && onArchive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            disabled={isLoading}
            className="bg-transparent border-white/20 text-amber-500 hover:bg-amber-500/10"
          >
            <Archive className="w-4 h-4 mr-1.5" />
            Archive
          </Button>
        )}

        {/* Restore button - shown for archived programs */}
        {isArchived && onRestore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            disabled={isLoading}
            className="bg-transparent border-white/20 text-green-500 hover:bg-green-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Restore
          </Button>
        )}

        {/* Clone button - shown for archived programs */}
        {isArchived && onClone && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClone}
            disabled={isLoading}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Clone
          </Button>
        )}

        {/* Delete button - shown for archived programs */}
        {isArchived && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="bg-transparent border-white/20 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
}
