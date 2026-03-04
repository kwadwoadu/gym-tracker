"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { isSpeechAvailable, startListening, stopListening } from "@/lib/speech";
import { parseVoiceInput, type ParsedSetData } from "@/lib/ai/voice-parser";

type VoiceState = "idle" | "listening" | "processing" | "confirming";

interface UseVoiceLoggingOptions {
  lastWeight?: number;
  lastReps?: number;
  exerciseName?: string;
  onParsed?: (data: ParsedSetData) => void;
}

export function useVoiceLogging({ lastWeight, lastReps, exerciseName, onParsed }: UseVoiceLoggingOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<ParsedSetData | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [isAvailable] = useState(() => isSpeechAvailable());

  const fetchAIFallback = useCallback(async (transcript: string, localParsed: ParsedSetData) => {
    try {
      const res = await fetch("/api/ai/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, exerciseName, lastWeight, lastReps }),
      });
      if (!res.ok) return localParsed;
      const { parsed: aiResult } = await res.json();
      if (!aiResult) return localParsed;

      // Merge AI results into local parse, preferring AI for missing fields
      const merged: ParsedSetData = {
        ...localParsed,
        weight: localParsed.weight ?? aiResult.weight,
        reps: localParsed.reps ?? aiResult.reps,
        rpe: localParsed.rpe ?? aiResult.rpe,
        confidence: Math.max(localParsed.confidence, 80),
      };
      return merged;
    } catch {
      return localParsed;
    }
  }, [exerciseName, lastWeight, lastReps]);

  const startRecording = useCallback(() => {
    if (!isAvailable || state !== "idle") return;

    setState("listening");
    setTranscript("");

    stopRef.current = startListening(
      async (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          setState("processing");
          let parsed = parseVoiceInput(result.transcript, lastWeight);

          // AI fallback for low-confidence parses
          if (parsed.confidence < 80) {
            parsed = await fetchAIFallback(result.transcript, parsed);
          }

          setParsedData(parsed);
          onParsed?.(parsed);
          setState("confirming");
        }
      },
      (error) => {
        console.warn("Speech error:", error);
        setState("idle");
      }
    );
  }, [isAvailable, state, lastWeight, onParsed, fetchAIFallback]);

  const stopRecording = useCallback(async () => {
    if (state === "listening") {
      stopListening();
      stopRef.current = null;
      if (transcript) {
        setState("processing");
        let parsed = parseVoiceInput(transcript, lastWeight);
        if (parsed.confidence < 80) {
          parsed = await fetchAIFallback(transcript, parsed);
        }
        setParsedData(parsed);
        onParsed?.(parsed);
        setState("confirming");
      } else {
        setState("idle");
      }
    }
  }, [state, transcript, lastWeight, onParsed, fetchAIFallback]);

  const reset = useCallback(() => {
    stopListening();
    stopRef.current = null;
    setState("idle");
    setTranscript("");
    setParsedData(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    state,
    transcript,
    parsedData,
    isAvailable,
    startRecording,
    stopRecording,
    reset,
    isListening: state === "listening",
    isProcessing: state === "processing",
    isConfirming: state === "confirming",
  };
}
