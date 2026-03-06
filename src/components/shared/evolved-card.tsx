"use client";

import { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { ELEVATION, type ElevationTier } from "@/lib/elevation";
import { CARD_TAP } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface EvolvedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: ElevationTier;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
}

export function EvolvedCard({
  variant = "standard",
  interactive = false,
  children,
  className,
  ...props
}: EvolvedCardProps) {
  return (
    <motion.div
      className={cn(ELEVATION[variant], className)}
      whileTap={interactive ? CARD_TAP : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
