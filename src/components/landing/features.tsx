"use client";

import { motion } from "framer-motion";
import { TrendingUp, Timer, Trophy, WifiOff, Dumbbell, BarChart3 } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Progressive Overload",
    description:
      "Smart weight suggestions based on your history. Never guess your working weight again.",
  },
  {
    icon: Timer,
    title: "Smart Rest Timers",
    description:
      "Automatic rest timers between sets with audio cues. Focus on lifting, not watching the clock.",
  },
  {
    icon: Dumbbell,
    title: "Superset Support",
    description:
      "A1/B1 paired exercises with shared rest timers. Perfect for time-efficient training.",
  },
  {
    icon: Trophy,
    title: "Automatic PRs",
    description:
      "Personal records detected automatically with celebration animations. Track your gains.",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    description:
      "Full functionality without internet. Perfect for gyms with no signal.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Weekly volume charts, muscle heatmaps, and streak tracking. See your consistency.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-[#111]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="text-[#CDFF00]"> Get Stronger</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Built by lifters, for lifters. No bloat, no subscriptions, just results.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#CDFF00]/30 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CDFF00]/10 flex items-center justify-center mb-4 group-hover:bg-[#CDFF00]/20 transition-colors">
                <feature.icon className="w-6 h-6 text-[#CDFF00]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
