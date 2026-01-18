"use client";

import { Dumbbell } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#CDFF00] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold">SetFlow</span>
          </div>

          <p className="text-sm text-white/40">
            Built for lifters who track their gains.
          </p>
        </div>
      </div>
    </footer>
  );
}
