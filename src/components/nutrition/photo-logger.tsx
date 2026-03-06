"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MacroResultCard, type FoodAnalysis } from "./macro-result-card";

interface PhotoLoggerProps {
  onSave: (analysis: FoodAnalysis) => void;
  onClose: () => void;
}

export function PhotoLogger({ onSave, onClose }: PhotoLoggerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    // Compress if > 1MB
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const analyzePhoto = useCallback(async () => {
    if (!imageBase64) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: "image/jpeg" }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const { data } = await res.json();
      setAnalysis(data);
    } catch {
      setError("Could not analyze the photo. Try again or log manually.");
    } finally {
      setAnalyzing(false);
    }
  }, [imageBase64]);

  const handleRetake = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Log with Photo</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-card"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {!imagePreview ? (
        /* Capture buttons */
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-card rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3">
            <Camera className="w-10 h-10 text-dim-foreground" />
            <p className="text-sm text-dim-foreground">
              Center your plate in the frame
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 h-12 bg-primary text-black hover:bg-primary/90 font-semibold"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1 h-12 border-border text-white hover:bg-card"
            >
              <ImagePlus className="w-5 h-5 mr-2" />
              Gallery
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : !analysis ? (
        /* Preview + analyze */
        <div className="space-y-3">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-card">
            <img
              src={imagePreview}
              alt="Meal photo"
              className="w-full h-full object-cover"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-white">Analyzing your meal...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={analyzePhoto}
              disabled={analyzing}
              className="flex-1 h-12 bg-primary text-black hover:bg-primary/90 font-semibold"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Meal"
              )}
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="h-12 border-border text-white hover:bg-card"
            >
              Retake
            </Button>
          </div>
        </div>
      ) : (
        /* Results */
        <MacroResultCard
          analysis={analysis}
          imagePreview={imagePreview}
          onSave={() => onSave(analysis)}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}
