"use client";

import { motion } from "framer-motion";
import { WifiOff, Shield, Sparkles } from "lucide-react";
import { HEADING } from "@/lib/typography";

const TRUST_SIGNALS = [
  {
    icon: Sparkles,
    label: "No Subscription",
    description: "Free forever. No premium tiers.",
  },
  {
    icon: WifiOff,
    label: "Works Offline",
    description: "Full functionality without internet.",
  },
  {
    icon: Shield,
    label: "Your Data, Your Device",
    description: "Everything stored locally. No tracking.",
  },
];

export function Credibility() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`${HEADING.h2} mb-4`}>
            Built by <span className="text-primary">Lifters</span>, for
            Lifters
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto">
            Created by someone who was tired of bloated fitness apps that
            require a subscription just to log a set. SetFlow does one thing and
            does it well.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_SIGNALS.map((signal, i) => (
            <motion.div
              key={signal.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10"
            >
              <signal.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-semibold text-white text-sm mb-1">
                {signal.label}
              </p>
              <p className="text-xs text-white/50">{signal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
