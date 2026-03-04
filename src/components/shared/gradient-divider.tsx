import { cn } from "@/lib/utils";

interface GradientDividerProps {
  className?: string;
}

export function GradientDivider({ className }: GradientDividerProps) {
  return <div className={cn("gradient-divider", className)} />;
}
