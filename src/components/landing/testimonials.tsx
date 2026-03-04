"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { HEADING } from "@/lib/typography";

interface Testimonial {
  name: string;
  context: string;
  quote: string;
  rating: number;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Alex M.",
    context: "Powerlifter, 8 months on SetFlow",
    quote:
      "I switched from a spreadsheet and never looked back. The progressive overload suggestions are spot on and the rest timer audio cues are a game changer.",
    rating: 5,
    initials: "AM",
  },
  {
    name: "Sarah K.",
    context: "Gym-goer, 4 months on SetFlow",
    quote:
      "Finally a gym app that works offline. My gym has terrible signal and I was constantly losing data. SetFlow just works, every time.",
    rating: 5,
    initials: "SK",
  },
  {
    name: "Marcus T.",
    context: "Bodybuilder, 6 months on SetFlow",
    quote:
      "The superset support and PR tracking are exactly what I needed. I can see my progress week over week and it keeps me motivated to push harder.",
    rating: 5,
    initials: "MT",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-[#111]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className={`${HEADING.h2} mb-4`}>
            Trusted by <span className="text-[#CDFF00]">Real Lifters</span>
          </h2>
          <p className="text-lg text-white/60">
            Hear from people who track their gains with SetFlow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-[#CDFF00] text-[#CDFF00]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CDFF00]/20 flex items-center justify-center text-xs font-bold text-[#CDFF00]">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
