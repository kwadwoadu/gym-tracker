"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { isSpeechAvailable, startListening, stopListening } from "@/lib/speech";
import { parseVoiceInput, type ParsedSetData } from "@/lib/ai/voice-parser";

type VoiceState = "idle" | "listening" | "processing" | "confirming";

interface UseVoiceLoggingOptions {
  lastWeight?: number;
  onParsed?: (data: ParsedSetData) => void;
}

export function useVoiceLogging({ lastWeight, onParsed }: UseVoiceLoggingOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<ParsedSetData | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [isAvailable] = useState(() => isSpeechAvailable());

  const startRecording = useCallback(() => {
    if (!isAvailable || state !== "idle") return;

    setState("listening");
    setTranscript("");

    stopRef.current = startListening(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          setState("processing");
          const parsed = parseVoiceInput(result.transcript, lastWeight);
          setParsedData(parsed);
          onParsed?.(parsed);

          if (parsed.confidence >= 80) {
            setState("confirming");
          } else {
            // Low confidence - still show what we got
            setState("confirming");
          }
        }
      },
      (error) => {
        console.warn("Speech error:", error);
        setState("idle");
      }
    );
  }, [isAvailable, state, lastWeight, onParsed]);

  const stopRecording = useCallback(() => {
    if (state === "listening") {
      stopListening();
      stopRef.current = null;
      // If we have a transcript, process it
      if (transcript) {
        setState("processing");
        const parsed = parseVoiceInput(transcript, lastWeight);
        setParsedData(parsed);
        onParsed?.(parsed);
        setState("confirming");
      } else {
        setState("idle");
      }
    }
  }, [state, transcript, lastWeight, onParsed]);

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
