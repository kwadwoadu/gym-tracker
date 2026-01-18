"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Smartphone } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0A0A0A] pointer-events-none" />

      {/* Lime accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#CDFF00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* PWA Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10">
            <Smartphone className="w-4 h-4 text-[#CDFF00]" />
            <span className="text-sm text-white/80">Install as app on any device</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Track Your
            <span className="text-[#CDFF00]"> Progress?</span>
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join thousands of lifters using SetFlow to build strength.
            No credit card required. Free forever.
          </p>

          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors"
            >
              Start Tracking Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="mt-4 text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#CDFF00] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
