"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { programsApi, trainingDaysApi, type TrainingDay, type Program } from "@/lib/api-client";
import { ProgramEditorModal } from "@/components/program/program-editor-modal";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function ProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [dayToDelete, setDayToDelete] = useState<TrainingDay | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showProgramEditor, setShowProgramEditor] = useState(false);

  useEffect(() => {
    async function loadProgram() {
      try {
        // Get active program
        const programs = await programsApi.list();
        const activeProgram = programs.find((p) => p.isActive) || programs[0];
        setProgram(activeProgram || null);

        if (activeProgram) {
          // Get training days for this program
          const days = await trainingDaysApi.list(activeProgram.id);
          days.sort((a, b) => a.dayNumber - b.dayNumber);
          setTrainingDays(days);
        }
      } catch (error) {
        console.error("Failed to load program:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProgram();
  }, []);

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

  const handleAddDay = async () => {
    if (!program || isAdding) return;
    setIsAdding(true);
    try {
      const newDay = await trainingDaysApi.create({
        programId: program.id,
        name: `Day ${trainingDays.length + 1}`,
        dayNumber: trainingDays.length + 1,
        warmup: [],
        supersets: [],
        finisher: [],
      });
      // Reload training days
      const days = await trainingDaysApi.list(program.id);
      days.sort((a, b) => a.dayNumber - b.dayNumber);
      setTrainingDays(days);
      showToast("Training day added", "success");
      // Navigate to edit the new day
      router.push(`/program/${newDay.id}`);
    } catch (error) {
      console.error("Failed to add day:", error);
      showToast("Failed to add training day", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!dayToDelete || !program) return;
    const deletedName = dayToDelete.name;
    try {
      await trainingDaysApi.delete(dayToDelete.id);
      // Reload training days
      const days = await trainingDaysApi.list(program.id);
      days.sort((a, b) => a.dayNumber - b.dayNumber);
      setTrainingDays(days);
      showToast(`"${deletedName}" deleted`, "success");
    } catch (error) {
      console.error("Failed to delete day:", error);
      showToast("Failed to delete training day", "error");
    } finally {
      setDayToDelete(null);
    }
  };

  const handleSaveProgram = async (name: string, description: string) => {
    if (!program) return;
    await programsApi.update(program.id, { name, description: description || null });
    setProgram({ ...program, name, description: description || null });
    showToast("Program updated", "success");
  };

  const handleDeleteProgram = async () => {
    if (!program) return;
    await programsApi.delete(program.id);
    showToast("Program deleted", "success");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
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
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Program</h1>
            {program && (
              <p className="text-sm text-muted-foreground">{program.name}</p>
            )}
          </div>
          {program && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProgramEditor(true)}
              className="h-10 w-10 shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Program Description */}
      {program?.description && (
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{program.description}</p>
        </div>
      )}

      {/* Training Days List */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Training Days
        </h2>

        {trainingDays.map((day) => {
          const exerciseCount = day.supersets.reduce(
            (acc, ss) => acc + ss.exercises.length,
            0
          );
          const warmupCount = day.warmup?.length || 0;
          const finisherCount = day.finisher?.length || 0;

          return (
            <Card
              key={day.id}
              className={cn(
                "bg-card border-border p-4 transition-all",
                "active:scale-[0.98] touch-target"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Day Number */}
                <div
                  className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 cursor-pointer"
                  onClick={() => router.push(`/program/${day.id}`)}
                >
                  <span className="text-primary-foreground font-bold text-lg">
                    {day.dayNumber}
                  </span>
                </div>

                {/* Day Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/program/${day.id}`)}
                >
                  <h3 className="font-semibold text-lg text-foreground">
                    {day.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {day.supersets.length} supersets
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exerciseCount} exercises
                    </Badge>
                    {warmupCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {warmupCount} warmup
                      </Badge>
                    )}
                    {finisherCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {finisherCount} finisher
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDayToDelete(day);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Arrow */}
                <ChevronRight
                  className="w-5 h-5 text-muted-foreground shrink-0 cursor-pointer"
                  onClick={() => router.push(`/program/${day.id}`)}
                />
              </div>
            </Card>
          );
        })}

        {trainingDays.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No training days found</p>
          </div>
        )}

        {/* Add Day Button */}
        <Button
          variant="outline"
          className="w-full h-14 mt-4 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary"
          onClick={handleAddDay}
          disabled={isAdding || !program}
        >
          {isAdding ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          Add Training Day
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!dayToDelete} onOpenChange={() => setDayToDelete(null)}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{dayToDelete?.name}&quot; and all its
              exercises. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDay}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Program Editor Modal */}
      <ProgramEditorModal
        program={program}
        open={showProgramEditor}
        onOpenChange={setShowProgramEditor}
        onSave={handleSaveProgram}
        onDelete={handleDeleteProgram}
      />
    </div>
  );
}
