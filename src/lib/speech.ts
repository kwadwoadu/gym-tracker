/**
 * Web Speech API wrapper with browser compatibility handling.
 * Works on Chrome, Safari, Edge. Falls back gracefully when unavailable.
 */

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

type SpeechCallback = (result: SpeechResult) => void;
type ErrorCallback = (error: string) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recognition: any = null;

/**
 * Check if Web Speech API is available.
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

/**
 * Start listening for speech input.
 */
export function startListening(
  onResult: SpeechCallback,
  onError: ErrorCallback,
  options: { language?: string; continuous?: boolean } = {}
): () => void {
  if (!isSpeechAvailable()) {
    onError("Speech recognition not supported");
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = options.language || "en-US";
  recognition.continuous = options.continuous || false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    onResult({
      transcript: result[0].transcript,
      confidence: result[0].confidence,
      isFinal: result.isFinal,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    recognition = null;
  };

  recognition.start();

  return () => {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  };
}

/**
 * Stop any active speech recognition.
 */
export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

