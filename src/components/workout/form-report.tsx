"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetFormReport } from "@/lib/ai/form-analyzer";

interface FormReportProps {
  report: SetFormReport;
  previousScore?: number | null;
  onClose: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 85) return "bg-green-400";
  if (score >= 70) return "bg-yellow-400";
  if (score >= 50) return "bg-orange-400";
  return "bg-red-400";
}

export function FormReport({ report, previousScore, onClose }: FormReportProps) {
  const scoreDiff = previousScore ? report.averageScore - previousScore : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-white">
          Form Report - {report.exerciseName}
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Score */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#2A2A2A"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={
                  report.averageScore >= 85
                    ? "#22C55E"
                    : report.averageScore >= 70
                      ? "#F59E0B"
                      : "#EF4444"
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(report.averageScore / 100) * 264} 264`}
              />
            </svg>
            <span
              className={`absolute text-2xl font-bold ${getScoreColor(report.averageScore)}`}
            >
              {report.averageScore}
            </span>
          </div>

          {scoreDiff !== null && (
            <div
              className={`inline-flex items-center gap-1 text-xs ${
                scoreDiff >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {scoreDiff >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {scoreDiff >= 0 ? "+" : ""}
              {scoreDiff} pts vs last session
            </div>
          )}
        </div>

        {/* Rep breakdown */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Rep Breakdown
          </p>
          <div className="flex gap-1">
            {report.repScores.map((rep) => (
              <div key={rep.repNumber} className="flex-1 text-center">
                <div className="h-12 bg-card rounded relative overflow-hidden mb-1">
                  <div
                    className={`absolute bottom-0 left-0 right-0 ${getScoreBg(rep.score)} transition-all`}
                    style={{ height: `${rep.score}%` }}
                  />
                </div>
                <span className="text-[10px] text-dim-foreground">
                  R{rep.repNumber}
                </span>
                <p className={`text-[10px] font-medium ${getScoreColor(rep.score)}`}>
                  {rep.score}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {report.strengths.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Strengths
            </p>
            <div className="space-y-1.5">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white capitalize">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {report.improvements.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Areas to Improve
            </p>
            <div className="space-y-1.5">
              {report.improvements.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white capitalize">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <Button
          onClick={onClose}
          className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-semibold"
        >
          Save & Continue
        </Button>
      </div>
    </motion.div>
  );
}
