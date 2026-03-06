"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface RiskAlertProps {
  title: string;
  description: string;
  recommendation: string;
  severity: "low" | "medium" | "high";
  onAcknowledge: () => void;
  onAdjust?: () => void;
}

const severityStyles = {
  low: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    icon: "text-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400",
  },
  medium: {
    border: "border-orange-500/20",
    bg: "bg-orange-500/5",
    icon: "text-orange-400",
    badge: "bg-orange-400/10 text-orange-400",
  },
  high: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    icon: "text-red-400",
    badge: "bg-red-400/10 text-red-400",
  },
};

export function RiskAlert({
  title,
  description,
  recommendation,
  severity,
  onAcknowledge,
  onAdjust,
}: RiskAlertProps) {
  const [visible, setVisible] = useState(true);
  const styles = severityStyles[severity];

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles.badge}`}>
            {severity}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-2">{description}</p>

        <p className="text-xs text-white mb-3">
          Recommendation: {recommendation}
        </p>

        <div className="flex gap-2">
          {onAdjust && (
            <Button
              onClick={onAdjust}
              size="sm"
              className="h-8 bg-primary text-black hover:bg-primary/90 text-xs"
            >
              Adjust Program
            </Button>
          )}
          <Button
            onClick={() => {
              setVisible(false);
              onAcknowledge();
            }}
            size="sm"
            variant="outline"
            className="h-8 border-border text-muted-foreground hover:bg-card text-xs"
          >
            Acknowledge
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
