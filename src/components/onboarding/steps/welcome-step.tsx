"use client";

import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, Timer, Trophy } from "lucide-react";

export function WelcomeStep() {
  const features = [
    { icon: Dumbbell, label: "Track workouts" },
    { icon: TrendingUp, label: "Progressive overload" },
    { icon: Timer, label: "Rest timers" },
    { icon: Trophy, label: "Hit PRs" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#CDFF00] to-[#9ECC00] flex items-center justify-center mb-8"
      >
        <Dumbbell className="w-12 h-12 text-black" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-white mb-3"
      >
        Welcome to SetFlow
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-lg mb-10 max-w-xs"
      >
        Let&apos;s personalize your training to help you reach your goals faster
      </motion.p>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <feature.icon className="w-5 h-5 text-[#CDFF00]" />
            <span className="text-white/80 text-sm">{feature.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Time estimate */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/40 text-sm mt-10"
      >
        Takes about 1 minute
      </motion.p>
    </div>
  );
}
