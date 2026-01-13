"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  usePrograms,
  useUpdateProgram,
  useArchiveProgram,
  useRestoreProgram,
  useCloneProgram,
  useDeleteProgramPermanent,
} from "@/lib/queries";
import { ProgramLibraryCard } from "@/components/program/program-library-card";
import { ArchivedSection } from "@/components/program/archived-section";
import { ArchiveModal, RestoreModal, DeletePermanentModal } from "@/components/program/archive-modal";
import { ActivateModal } from "@/components/program/activate-modal";
import type { Program } from "@/lib/api-client";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function ProgramsPage() {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);

  // Modal states
  const [archiveModal, setArchiveModal] = useState<{ open: boolean; program: Program | null }>({
    open: false,
    program: null,
  });
  const [restoreModal, setRestoreModal] = useState<{ open: boolean; program: Program | null }>({
    open: false,
    program: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; program: Program | null }>({
    open: false,
    program: null,
  });
  const [activateModal, setActivateModal] = useState<{ open: boolean; program: Program | null }>({
    open: false,
    program: null,
  });

  // Queries and mutations
  const { data: programs, isLoading } = usePrograms({ includeArchived: true });
  const updateProgramMutation = useUpdateProgram();
  const archiveProgramMutation = useArchiveProgram();
  const restoreProgramMutation = useRestoreProgram();
  const cloneProgramMutation = useCloneProgram();
  const deleteProgramMutation = useDeleteProgramPermanent();

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Filter programs by status
  const activePrograms = programs?.filter((p) => !p.archivedAt) || [];
  const archivedPrograms = programs?.filter((p) => p.archivedAt) || [];
  const currentActive = activePrograms.find((p) => p.isActive);

  // Handlers
  const handleView = (program: Program) => {
    router.push(`/program/${program.trainingDays?.[0]?.id || ""}`);
  };

  const handleActivate = async () => {
    if (!activateModal.program) return;
    try {
      await updateProgramMutation.mutateAsync({
        id: activateModal.program.id,
        data: { isActive: true },
      });
      showToast(`"${activateModal.program.name}" is now active`, "success");
      setActivateModal({ open: false, program: null });
    } catch (error) {
      console.error("Failed to activate program:", error);
      showToast("Failed to activate program", "error");
    }
  };

  const handleArchive = async () => {
    if (!archiveModal.program) return;
    try {
      await archiveProgramMutation.mutateAsync(archiveModal.program.id);
      showToast(`"${archiveModal.program.name}" has been archived`, "success");
      setArchiveModal({ open: false, program: null });
    } catch (error) {
      console.error("Failed to archive program:", error);
      showToast("Failed to archive program", "error");
    }
  };

  const handleRestore = async () => {
    if (!restoreModal.program) return;
    try {
      await restoreProgramMutation.mutateAsync(restoreModal.program.id);
      showToast(`"${restoreModal.program.name}" has been restored`, "success");
      setRestoreModal({ open: false, program: null });
    } catch (error) {
      console.error("Failed to restore program:", error);
      showToast("Failed to restore program", "error");
    }
  };

  const handleClone = async (program: Program) => {
    try {
      await cloneProgramMutation.mutateAsync({ id: program.id });
      showToast(`"${program.name}" has been cloned`, "success");
    } catch (error) {
      console.error("Failed to clone program:", error);
      showToast("Failed to clone program", "error");
    }
  };

  const handleDeletePermanent = async () => {
    if (!deleteModal.program) return;
    try {
      await deleteProgramMutation.mutateAsync(deleteModal.program.id);
      showToast(`"${deleteModal.program.name}" has been permanently deleted`, "success");
      setDeleteModal({ open: false, program: null });
    } catch (error) {
      console.error("Failed to delete program:", error);
      showToast("Failed to delete program", "error");
    }
  };

  const isLoading_any =
    updateProgramMutation.isPending ||
    archiveProgramMutation.isPending ||
    restoreProgramMutation.isPending ||
    cloneProgramMutation.isPending ||
    deleteProgramMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
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
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Programs</h1>
              <p className="text-sm text-muted-foreground">
                Manage your training programs
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/onboarding/plans")}
            className="bg-[#CDFF00] text-black hover:bg-[#CDFF00]/80"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Empty state */}
        {activePrograms.length === 0 && archivedPrograms.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any programs yet.
            </p>
            <Button
              onClick={() => router.push("/onboarding/plans")}
              className="bg-[#CDFF00] text-black hover:bg-[#CDFF00]/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Program
            </Button>
          </motion.div>
        )}

        {/* Active and Inactive Programs */}
        {activePrograms.length > 0 && (
          <div className="space-y-3">
            {activePrograms.map((program) => (
              <ProgramLibraryCard
                key={program.id}
                program={program}
                isLoading={isLoading_any}
                onView={() => handleView(program)}
                onActivate={
                  !program.isActive
                    ? () => setActivateModal({ open: true, program })
                    : undefined
                }
                onArchive={() => setArchiveModal({ open: true, program })}
              />
            ))}
          </div>
        )}

        {/* Archived Programs Section */}
        <ArchivedSection count={archivedPrograms.length}>
          {archivedPrograms.map((program) => (
            <ProgramLibraryCard
              key={program.id}
              program={program}
              isLoading={isLoading_any}
              onView={() => handleView(program)}
              onRestore={() => setRestoreModal({ open: true, program })}
              onClone={() => handleClone(program)}
              onDelete={() => setDeleteModal({ open: true, program })}
            />
          ))}
        </ArchivedSection>
      </div>

      {/* Modals */}
      <ActivateModal
        open={activateModal.open}
        onOpenChange={(open) => setActivateModal({ open, program: activateModal.program })}
        programName={activateModal.program?.name || ""}
        currentActiveName={currentActive?.name}
        onConfirm={handleActivate}
        isLoading={updateProgramMutation.isPending}
      />

      <ArchiveModal
        open={archiveModal.open}
        onOpenChange={(open) => setArchiveModal({ open, program: archiveModal.program })}
        programName={archiveModal.program?.name || ""}
        onConfirm={handleArchive}
        isLoading={archiveProgramMutation.isPending}
      />

      <RestoreModal
        open={restoreModal.open}
        onOpenChange={(open) => setRestoreModal({ open, program: restoreModal.program })}
        programName={restoreModal.program?.name || ""}
        onConfirm={handleRestore}
        isLoading={restoreProgramMutation.isPending}
      />

      <DeletePermanentModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, program: deleteModal.program })}
        programName={deleteModal.program?.name || ""}
        onConfirm={handleDeletePermanent}
        isLoading={deleteProgramMutation.isPending}
      />
    </div>
  );
}
