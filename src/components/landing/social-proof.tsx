"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Dumbbell, Trophy, Target } from "lucide-react";
import { DATA, LABEL } from "@/lib/typography";

const STATS = [
  { icon: Users, label: "Active Lifters", value: 2847 },
  { icon: Dumbbell, label: "Workouts Tracked", value: 48320 },
  { icon: Trophy, label: "PRs Crushed", value: 12450 },
  { icon: Target, label: "Sets Logged", value: 387500 },
];

function useCountUp(target: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function CounterCard({
  icon: Icon,
  label,
  value,
  inView,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  inView: boolean;
}) {
  const count = useCountUp(value, 2000, inView);

  return (
    <div className="text-center">
      <Icon className="w-5 h-5 text-primary/60 mx-auto mb-2" />
      <div className={`${DATA.large} text-primary`}>
        {formatNumber(count)}
      </div>
      <div className={`${LABEL.caption} text-white/50 mt-1`}>
        {label}
      </div>
    </div>
  );
}

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <CounterCard key={stat.label} {...stat} inView={inView} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
