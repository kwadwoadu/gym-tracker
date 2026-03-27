"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export interface DeloadConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedDays: number;
  totalDays: number;
  onConfirm: () => void;
}

export function DeloadConfirmDialog({
  open,
  onOpenChange,
  completedDays,
  totalDays,
  onConfirm,
}: DeloadConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[320px] rounded-2xl border-0 bg-[#1A1A1A] p-7 text-center">
        <AlertDialogHeader className="flex flex-col items-center gap-0">
          {/* Warning icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAB308]/15">
            <AlertTriangle className="h-6 w-6 text-[#EAB308]" />
          </div>

          <AlertDialogTitle className="text-lg font-bold text-white">
            End deload early?
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">
            You&apos;ve completed {completedDays} of {totalDays} days. Your
            weight memory will resume immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-col gap-2 sm:flex-col sm:space-x-0">
          <AlertDialogAction
            onClick={onConfirm}
            className="h-12 w-full rounded-xl border-0 bg-[#EAB308] text-[15px] font-bold text-black hover:bg-[#CA9A06] active:scale-[0.98]"
          >
            End Now
          </AlertDialogAction>

          <AlertDialogCancel className="h-11 w-full rounded-xl border-0 bg-transparent text-sm font-semibold text-[#A0A0A0] hover:bg-transparent hover:text-white active:scale-[0.98]">
            Keep Going
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
