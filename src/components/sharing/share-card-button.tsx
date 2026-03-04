"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { generateShareCard, shareCard, downloadShareCard, type ShareCardData, type CardFormat } from "@/lib/share-card";

interface ShareCardButtonProps {
  data: ShareCardData;
  className?: string;
}

export function ShareCardButton({ data, className }: ShareCardButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<CardFormat>("stories");

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateShareCard(data, format);
      if (typeof navigator.share === "function") {
        try {
          await shareCard(blob, `${data.workoutName} - SetFlow`);
        } catch {
          await downloadShareCard(blob, `setflow-${data.date}.png`);
        }
      } else {
        await downloadShareCard(blob, `setflow-${data.date}.png`);
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      {/* Format selector */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setFormat("stories")}
          className={`text-xs px-2 py-1 rounded ${
            format === "stories" ? "bg-[#CDFF00] text-black" : "bg-[#1A1A1A] text-white/50"
          }`}
        >
          Stories
        </button>
        <button
          onClick={() => setFormat("square")}
          className={`text-xs px-2 py-1 rounded ${
            format === "square" ? "bg-[#CDFF00] text-black" : "bg-[#1A1A1A] text-white/50"
          }`}
        >
          Square
        </button>
      </div>
      <Button
        variant="outline"
        className="w-full h-12 border-[#CDFF00]/30 text-[#CDFF00]"
        onClick={handleShare}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Share2 className="w-5 h-5 mr-2" />
        )}
        {isGenerating ? "Generating..." : "Share Workout"}
      </Button>
    </div>
  );
}
