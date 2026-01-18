"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, Play } from "lucide-react";
import Link from "next/link";

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
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
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

        {/* App Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-md">
            {/* Phone frame */}
            <div className="relative rounded-[40px] bg-[#1A1A1A] p-2 shadow-2xl border border-white/10">
              <div className="rounded-[32px] bg-[#0A0A0A] overflow-hidden aspect-[9/16] flex flex-col">
                {/* Simulated app header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#CDFF00] flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">SetFlow</div>
                    <div className="text-xs text-white/40">Full Body A</div>
                  </div>
                </div>

                {/* Simulated workout content */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex gap-2">
                    {["Day 1", "Day 2", "Day 3"].map((day, i) => (
                      <div
                        key={day}
                        className={`flex-1 py-2 text-center text-xs font-medium rounded-lg ${
                          i === 0 ? "bg-[#CDFF00] text-black" : "bg-white/10 text-white/60"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="text-xl font-bold mt-4">Full Body A</div>
                  <div className="text-xs text-white/40">3 supersets - 9 exercises</div>

                  {/* Simulated exercise cards */}
                  {[
                    { label: "A1", name: "Barbell Bench Press", sets: "4x8" },
                    { label: "A2", name: "Bent Over Row", sets: "4x8" },
                    { label: "B1", name: "Leg Press", sets: "3x12" },
                  ].map((ex) => (
                    <div
                      key={ex.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#CDFF00]/20 flex items-center justify-center text-xs font-bold text-[#CDFF00]">
                        {ex.label}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{ex.name}</div>
                        <div className="text-xs text-white/40">{ex.sets}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated CTA */}
                <div className="p-4 border-t border-white/10">
                  <div className="w-full h-12 rounded-lg bg-[#CDFF00] flex items-center justify-center text-black font-semibold">
                    Start Full Body A
                  </div>
                </div>
              </div>
            </div>

            {/* Glow under phone */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#CDFF00]/20 blur-3xl pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
