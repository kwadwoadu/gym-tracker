"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "./progress-dots";

interface OnboardingCarouselProps {
  children: React.ReactNode[];
  onSkip: () => void;
  onComplete: () => void;
  canProceed?: boolean[];
}

export function OnboardingCarousel({
  children,
  onSkip,
  onComplete,
  canProceed = [],
}: OnboardingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    watchDrag: false, // Disable swipe - use buttons only for controlled flow
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const totalSteps = children.length;
  const isLastStep = currentIndex === totalSteps - 1;
  const canProceedCurrent = canProceed[currentIndex] ?? true;

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      if (isLastStep) {
        onComplete();
      } else {
        emblaApi.scrollNext();
      }
    }
  }, [emblaApi, isLastStep, onComplete]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="w-20">
          {canScrollPrev && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={scrollPrev}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </motion.button>
          )}
        </div>
        <ProgressDots current={currentIndex} total={totalSteps} />
        <div className="w-20 flex justify-end">
          {!isLastStep && (
            <button
              onClick={onSkip}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {currentIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {child}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={scrollNext}
          disabled={!canProceedCurrent}
          className="w-full h-14 text-lg font-semibold bg-[#CDFF00] hover:bg-[#b8e600] text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastStep ? "Start Training" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
