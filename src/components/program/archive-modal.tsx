"use client";

import { Archive, RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ArchiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ArchiveModal({
  open,
  onOpenChange,
  programName,
  onConfirm,
  isLoading = false,
}: ArchiveModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/20">
              <Archive className="w-5 h-5 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-white">
              Archive Program?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/60">
            &quot;{programName}&quot; will be moved to your archive. All workout
            history will be preserved. You can restore it anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-500 text-black hover:bg-amber-400"
            disabled={isLoading}
          >
            {isLoading ? "Archiving..." : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface RestoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RestoreModal({
  open,
  onOpenChange,
  programName,
  onConfirm,
  isLoading = false,
}: RestoreModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-green-500/20">
              <RotateCcw className="w-5 h-5 text-green-500" />
            </div>
            <AlertDialogTitle className="text-white">
              Restore Program?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/60">
            &quot;{programName}&quot; will be restored from your archive. It
            will become available in your program list but won&apos;t be
            activated automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-500 text-black hover:bg-green-400"
            disabled={isLoading}
          >
            {isLoading ? "Restoring..." : "Restore"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeletePermanentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeletePermanentModal({
  open,
  onOpenChange,
  programName,
  onConfirm,
  isLoading = false,
}: DeletePermanentModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-500/20">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-white">
              Delete Permanently?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/60">
            &quot;{programName}&quot; will be permanently deleted. This action
            cannot be undone. Your workout history will be preserved but no
            longer linked to this program.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-400"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
