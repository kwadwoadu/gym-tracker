"use client";

import { useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CheckCircle2, XCircle, Dumbbell } from "lucide-react";
import { getFormData } from "@/data/form-cues";

interface FormSheetProps {
  exerciseName: string | null;
  open: boolean;
  onClose: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  setup: "Setup",
  eccentric: "Lowering",
  bottom: "Bottom",
  concentric: "Lifting",
  top: "Top",
};

export function FormSheet({ exerciseName, open, onClose }: FormSheetProps) {
  const formData = useMemo(() => {
    if (!exerciseName) return null;
    return getFormData(exerciseName);
  }, [exerciseName]);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#0A0A0A] border-[#2A2A2A] max-h-[85vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white text-left">
              {exerciseName || "Form Guide"}
            </DrawerTitle>
          </DrawerHeader>

          {!formData ? (
            <div className="text-center py-8">
              <Dumbbell className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">
                No form guide available for this exercise yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Cues */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-3">
                  Key Form Cues
                </h3>
                <div className="space-y-2">
                  {formData.cues.map((cue, i) => (
                    <div
                      key={i}
                      className="flex gap-3 bg-[#1A1A1A] rounded-xl p-3.5 border-l-[3px] border-[#CDFF00]"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#CDFF00] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-white">{cue.text}</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {PHASE_LABELS[cue.phase] || cue.phase}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-3">
                  Common Mistakes
                </h3>
                <div className="space-y-2">
                  {formData.mistakes.map((mistake, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 bg-[#1A1A1A] rounded-xl p-3.5 border-l-[3px] ${
                        mistake.severity === "dangerous"
                          ? "border-[#EF4444]"
                          : "border-[#F59E0B]"
                      }`}
                    >
                      <XCircle
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          mistake.severity === "dangerous"
                            ? "text-[#EF4444]"
                            : "text-[#F59E0B]"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-white">
                          <span className="text-white/40">Avoid: </span>
                          {mistake.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Muscles Worked */}
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-3">
                  Muscles Worked
                </h3>
                <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-[#CDFF00] font-medium mb-1.5">
                      Primary
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.muscles
                        .filter((m) => m.activation === "primary")
                        .map((m) => (
                          <span
                            key={m.name}
                            className="text-xs bg-[#CDFF00]/10 text-[#CDFF00] px-2.5 py-1 rounded-full"
                          >
                            {m.name}
                          </span>
                        ))}
                    </div>
                  </div>
                  {formData.muscles.some(
                    (m) => m.activation === "secondary"
                  ) && (
                    <div>
                      <p className="text-xs text-white/40 font-medium mb-1.5">
                        Secondary
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.muscles
                          .filter((m) => m.activation === "secondary")
                          .map((m) => (
                            <span
                              key={m.name}
                              className="text-xs bg-white/5 text-white/50 px-2.5 py-1 rounded-full"
                            >
                              {m.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-white/20 text-center">
                These are general guidelines. Consult a qualified trainer for
                personalized form advice.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
