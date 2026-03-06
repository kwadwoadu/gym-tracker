"use client";

import { cn } from "@/lib/utils";

interface ChipFilterProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function ChipFilter({ options, selected, onSelect, className }: ChipFilterProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto no-scrollbar", className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target",
            selected === option
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
