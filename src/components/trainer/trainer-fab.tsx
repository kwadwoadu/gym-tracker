"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

/**
 * Floating Action Button for quick access to the AI Trainer.
 * Positioned bottom-right, above the tab bar.
 * Hidden on the trainer page itself and during active workouts.
 */
export function TrainerFAB() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on trainer page, workout session, onboarding, and auth pages
  const hiddenRoutes = ["/trainer", "/workout", "/onboarding", "/sign-in", "/sign-up", "/landing", "/focus-session"];
  const shouldHide = hiddenRoutes.some((route) => pathname?.startsWith(route));

  if (shouldHide) return null;

  return (
    <motion.button
      onClick={() => router.push("/trainer")}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center lg:hidden"
      style={{
        bottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
        right: "16px",
      }}
      aria-label="Open AI Trainer"
    >
      <Bot className="w-6 h-6 text-black" />
    </motion.button>
  );
}
