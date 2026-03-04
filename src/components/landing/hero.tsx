"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { HEADING } from "@/lib/typography";
import { AppWalkthrough } from "./app-walkthrough";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-[#111] pointer-events-none" />

      {/* Lime glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CDFF00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10"
        >
          <Dumbbell className="w-4 h-4 text-[#CDFF00]" />
          <span className="text-sm text-white/80">Free Workout Tracking PWA</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${HEADING.h1} mb-6`}
        >
          Track Your Lifts.
          <br />
          <span className="text-[#CDFF00]">Beat Your PRs.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          The gym tracker that helps you build strength with progressive overload,
          superset support, and automatic rest timers. Works offline.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="lg"
              className="h-14 px-8 text-lg font-medium text-white/80 hover:text-white hover:bg-white/5"
            >
              <Play className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* App Preview Walkthrough */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative"
        >
          <AppWalkthrough />
        </motion.div>
      </div>
    </section>
  );
}
