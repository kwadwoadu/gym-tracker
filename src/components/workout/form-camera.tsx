"use client";

import { useState } from "react";
import { Camera, X, Square, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { FormRule } from "@/data/form-rules";
import { FormReport } from "./form-report";
import type { SetFormReport, RepScore } from "@/lib/ai/form-analyzer";
import { generateSetReport } from "@/lib/ai/form-analyzer";

interface FormCameraProps {
  exerciseId: string;
  exerciseName: string;
  formRule: FormRule;
  onClose: () => void;
  onSaveReport: (report: SetFormReport) => void;
}

type ViewState = "setup" | "analyzing" | "report";

export function FormCamera({
  exerciseId,
  exerciseName,
  formRule,
  onClose,
  onSaveReport,
}: FormCameraProps) {
  const [viewState, setViewState] = useState<ViewState>("setup");
  const [repCount, setRepCount] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [report, setReport] = useState<SetFormReport | null>(null);

  const handleStartAnalysis = () => {
    // In a full implementation, this would:
    // 1. Request camera permission
    // 2. Initialize MediaPipe BlazePose
    // 3. Start processing frames
    // For now, simulate the analysis flow
    setViewState("analyzing");
    setRepCount(0);
    setCurrentScore(0);

    // Simulate rep detection over time
    let reps = 0;
    const interval = setInterval(() => {
      reps++;
      setRepCount(reps);
      setCurrentScore(75 + Math.floor(Math.random() * 20));
      if (reps >= 8) {
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleStopAnalysis = () => {
    // Generate a simulated report
    // In production, this would use actual pose data + form-analyzer
    const repScores: RepScore[] = Array.from({ length: Math.max(1, repCount) }, (_, i) => ({
      repNumber: i + 1,
      score: Math.max(60, 90 - i * 2 + Math.floor(Math.random() * 10)),
      checkpointScores: Object.fromEntries(
        formRule.checkpoints.map((cp) => [
          cp.id,
          Math.max(50, 85 - i + Math.floor(Math.random() * 15)),
        ])
      ),
      feedback: [],
    }));

    const generatedReport = generateSetReport(exerciseId, exerciseName, repScores);
    setReport(generatedReport);
    setViewState("report");
  };

  const handleSaveReport = () => {
    if (report) {
      onSaveReport(report);
    }
    onClose();
  };

  if (viewState === "report" && report) {
    return <FormReport report={report} onClose={handleSaveReport} />;
  }

  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <h3 className="text-sm font-semibold text-white">
          {viewState === "setup"
            ? `Form Analysis - ${exerciseName}`
            : `Analyzing... Rep ${repCount}`}
        </h3>
        <button
          onClick={viewState === "analyzing" ? handleStopAnalysis : onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A1A]"
        >
          {viewState === "analyzing" ? (
            <Square className="w-4 h-4 text-red-400" />
          ) : (
            <X className="w-4 h-4 text-[#A0A0A0]" />
          )}
        </button>
      </div>

      {viewState === "setup" ? (
        /* Setup View */
        <div className="p-4 space-y-4">
          {/* Camera preview placeholder */}
          <div className="aspect-[3/4] bg-[#1A1A1A] rounded-xl border-2 border-dashed border-[#2A2A2A] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            {/* Silhouette guide */}
            <div className="w-20 h-40 border-2 border-[#CDFF00]/30 rounded-lg" />
            <p className="text-sm text-[#666666] text-center px-8">
              Position your phone so your full body is visible
            </p>
            <div className="absolute top-3 right-3 bg-[#CDFF00]/10 rounded-full px-3 py-1">
              <span className="text-xs text-[#CDFF00]">
                {formRule.cameraAngle} view
              </span>
            </div>
          </div>

          {/* Setup tips */}
          <div className="space-y-2">
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">
              Setup Tips
            </p>
            {formRule.setupTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CDFF00] mt-1.5 flex-shrink-0" />
                <p className="text-xs text-[#A0A0A0]">{tip}</p>
              </div>
            ))}
          </div>

          {/* MediaPipe loading note */}
          <div className="flex items-start gap-2 bg-[#CDFF00]/5 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-[#CDFF00] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#A0A0A0]">
              Form analysis uses on-device AI. No video is uploaded or stored.
              First use downloads the pose model (~5MB).
            </p>
          </div>

          <Button
            onClick={handleStartAnalysis}
            className="w-full h-14 bg-[#CDFF00] text-black hover:bg-[#b8e600] font-semibold text-base"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Analysis
          </Button>
        </div>
      ) : (
        /* Analyzing View */
        <div className="p-4 space-y-4">
          {/* Camera feed placeholder with skeleton overlay area */}
          <div className="aspect-[3/4] bg-[#1A1A1A] rounded-xl relative overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-full bg-[#CDFF00]/20 flex items-center justify-center mx-auto"
              >
                <Camera className="w-8 h-8 text-[#CDFF00]" />
              </motion.div>
              <p className="text-sm text-[#A0A0A0]">
                Camera feed with pose overlay
              </p>
              <p className="text-xs text-[#666666]">
                (MediaPipe integration required)
              </p>
            </div>

            {/* Rep counter overlay */}
            <div className="absolute top-3 left-3 bg-black/60 rounded-lg px-3 py-2">
              <p className="text-xs text-[#A0A0A0]">Rep</p>
              <p className="text-2xl font-bold text-[#CDFF00]">{repCount}</p>
            </div>

            {/* Current score overlay */}
            {currentScore > 0 && (
              <div className="absolute top-3 right-3 bg-black/60 rounded-lg px-3 py-2">
                <p className="text-xs text-[#A0A0A0]">Score</p>
                <p className={`text-2xl font-bold ${currentScore >= 80 ? "text-green-400" : "text-yellow-400"}`}>
                  {currentScore}
                </p>
              </div>
            )}
          </div>

          {/* Checkpoints being monitored */}
          <div className="flex flex-wrap gap-2">
            {formRule.checkpoints.map((cp) => (
              <span
                key={cp.id}
                className="text-[10px] px-2 py-1 rounded-full bg-[#1A1A1A] text-[#A0A0A0] border border-[#2A2A2A]"
              >
                {cp.label}
              </span>
            ))}
          </div>

          <Button
            onClick={handleStopAnalysis}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop & View Report
          </Button>
        </div>
      )}
    </div>
  );
}
