"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_PROMPT_DISMISSED_KEY = "setflow-pwa-prompt-dismissed";
const PWA_PROMPT_DELAY_MS = 3000; // Show after 3 seconds

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if already dismissed
    const dismissed = localStorage.getItem(PWA_PROMPT_DISMISSED_KEY);
    if (dismissed) return;

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after delay
      setTimeout(() => {
        setShowPrompt(true);
      }, PWA_PROMPT_DELAY_MS);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show custom instructions after delay
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, PWA_PROMPT_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(PWA_PROMPT_DISMISSED_KEY, "true");
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">Install SetFlow</h3>

                {isIOS ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Tap the share button <span className="inline-block w-4 h-4 align-middle">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 2l3 3h-2v6h-2V5H9l3-3zm-7 9v10h14V11h-2v8H7v-8H5z"/>
                      </svg>
                    </span> then &quot;Add to Home Screen&quot; for the best experience.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Add SetFlow to your home screen for quick access and offline workouts.
                  </p>
                )}

                {!isIOS && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                    >
                      Not now
                    </Button>
                  </div>
                )}

                {isIOS && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="mt-3"
                  >
                    Got it
                  </Button>
                )}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="shrink-0 h-8 w-8 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
