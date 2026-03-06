"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Program } from "@/lib/api-client";

interface ProgramSelectorProps {
  programs: Program[];
  activeProgram: Program | null;
  onSelect: (program: Program) => void;
}

export function ProgramSelector({
  programs,
  activeProgram,
  onSelect,
}: ProgramSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (programs.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card rounded-xl p-3 flex items-center justify-between border border-border transition-colors active:scale-[0.98]"
      >
        <div className="text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {activeProgram?.name || "Select Program"}
          </p>
          {activeProgram?.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {activeProgram.description}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 ml-2 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {programs.map((program) => {
            const isActive = program.id === activeProgram?.id;
            return (
              <button
                key={program.id}
                onClick={() => {
                  onSelect(program);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-3 text-left flex items-center gap-3 transition-colors",
                  isActive
                    ? "bg-primary/10"
                    : "hover:bg-secondary/50 active:bg-secondary"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {program.name}
                  </p>
                  {program.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {program.description}
                    </p>
                  )}
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
