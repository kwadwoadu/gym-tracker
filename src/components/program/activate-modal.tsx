"use client";

import { PlayCircle } from "lucide-react";
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

interface ActivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  currentActiveName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ActivateModal({
  open,
  onOpenChange,
  programName,
  currentActiveName,
  onConfirm,
  isLoading = false,
}: ActivateModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[#CDFF00]/20">
              <PlayCircle className="w-5 h-5 text-[#CDFF00]" />
            </div>
            <AlertDialogTitle className="text-white">
              Activate Program?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/60">
            {currentActiveName ? (
              <>
                &quot;{programName}&quot; will become your active program.
                &quot;{currentActiveName}&quot; will be deactivated but remain
                available in your library.
              </>
            ) : (
              <>
                &quot;{programName}&quot; will become your active program. You
                can switch programs anytime from your library.
              </>
            )}
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
            className="bg-[#CDFF00] text-black hover:bg-[#CDFF00]/80"
            disabled={isLoading}
          >
            {isLoading ? "Activating..." : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
