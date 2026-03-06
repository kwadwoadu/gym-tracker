"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  generateShareCard,
  shareCard,
  downloadShareCard,
  type ShareCardData,
  type CardFormat,
} from "@/lib/share-card";
import { SPRING_SNAPPY, SLIDE_UP } from "@/lib/animations";

interface ShareCardButtonProps {
  workoutName: string;
  date: string;
  totalVolume: number;
  duration: number;
  topSets: { exercise: string; weight: number; reps: number }[];
  prs: { exercise: string; weight: number }[];
  streakDays: number;
}

export function ShareCardButton({
  workoutName,
  date,
  totalVolume,
  duration,
  topSets,
  prs,
  streakDays,
}: ShareCardButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [format, setFormat] = useState<CardFormat>("stories");
  const [showPreview, setShowPreview] = useState(false);

  const cardData: ShareCardData = useMemo(() => ({
    workoutName,
    date,
    totalVolume,
    duration,
    topSets,
    prs,
    streakDays,
  }), [workoutName, date, totalVolume, duration, topSets, prs, streakDays]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generatedBlob = await generateShareCard(cardData, format);
      setBlob(generatedBlob);
      const url = URL.createObjectURL(generatedBlob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (err) {
      console.error("Failed to generate share card:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [cardData, format]);

  const handleShare = useCallback(async () => {
    if (!blob) return;
    try {
      await shareCard(blob, `SetFlow - ${workoutName}`);
    } catch (err) {
      // User cancelled share or share failed - fall back to download
      if (err instanceof Error && err.name !== "AbortError") {
        await downloadShareCard(blob, `setflow-${workoutName.toLowerCase().replace(/\s+/g, "-")}.png`);
      }
    }
  }, [blob, workoutName]);

  const handleDownload = useCallback(async () => {
    if (!blob) return;
    await downloadShareCard(
      blob,
      `setflow-${workoutName.toLowerCase().replace(/\s+/g, "-")}.png`
    );
  }, [blob, workoutName]);

  const handleClose = useCallback(() => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setBlob(null);
  }, [previewUrl]);

  const handleFormatChange = useCallback(
    async (newFormat: CardFormat) => {
      setFormat(newFormat);
      setIsGenerating(true);
      try {
        const generatedBlob = await generateShareCard(cardData, newFormat);
        setBlob(generatedBlob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(generatedBlob));
      } catch (err) {
        console.error("Failed to regenerate share card:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    [cardData, previewUrl]
  );

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full h-14 text-base font-medium border-border hover:bg-white/5 gap-2"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
        {isGenerating ? "Generating..." : "Share Workout"}
      </Button>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              {...SLIDE_UP}
              transition={SPRING_SNAPPY}
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-card border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-base font-semibold text-white">Share Card</h3>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Close preview"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {/* Format toggle */}
                <div className="flex gap-2 p-4 pb-2">
                  {(["stories", "square"] as CardFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFormatChange(f)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        format === f
                          ? "bg-primary text-black"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {f === "stories" ? "Stories" : "Square"}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="p-4">
                  {previewUrl && (
                    <motion.img
                      key={previewUrl}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={previewUrl}
                      alt="Workout share card preview"
                      className="w-full rounded-lg"
                    />
                  )}
                  {isGenerating && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 gap-2 border-border hover:bg-white/5"
                    onClick={handleDownload}
                    disabled={!blob}
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    className="flex-1 h-12 gap-2 bg-primary text-black hover:bg-primary/90 font-semibold"
                    onClick={handleShare}
                    disabled={!blob}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
