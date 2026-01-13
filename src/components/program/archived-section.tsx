"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchivedSectionProps {
  children: React.ReactNode;
  count: number;
  defaultOpen?: boolean;
}

export function ArchivedSection({
  children,
  count,
  defaultOpen = false,
}: ArchivedSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Section header / toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-3 px-4",
          "bg-white/5 rounded-xl",
          "text-white/60 hover:text-white/80 transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4" />
          <span className="text-sm font-medium">
            Archived ({count})
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
