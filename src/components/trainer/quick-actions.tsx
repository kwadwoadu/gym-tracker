"use client";

import { motion } from "framer-motion";

const QUICK_ACTIONS = [
  "What should I train today?",
  "Analyze my week",
  "Why am I stalling?",
  "Suggest a deload week",
  "Help me warm up",
  "What should I change?",
];

interface QuickActionsProps {
  onSelect: (action: string) => void;
  disabled?: boolean;
  dynamicActions?: string[];
}

export function QuickActions({ onSelect, disabled, dynamicActions }: QuickActionsProps) {
  const actions = dynamicActions?.length ? dynamicActions : QUICK_ACTIONS;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <motion.button
          key={action}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(action)}
          disabled={disabled}
          className="px-3 py-1.5 rounded-full border border-primary/30 text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {action}
        </motion.button>
      ))}
    </div>
  );
}
