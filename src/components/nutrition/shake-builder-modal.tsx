'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMealById } from '@/data/meal-templates';
import { DayType, SUPPLEMENT_PROTOCOLS, type SupplementItem } from '@/data/supplement-protocol';

interface ShakeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId: string | null;
  dayType: DayType;
  isSupplementCompleted: (blockId: string, itemId: string) => boolean;
  onComplete: (supplementIds: string[]) => void;
}

export function ShakeBuilderModal({
  isOpen,
  onClose,
  mealId,
  dayType,
  isSupplementCompleted,
  onComplete,
}: ShakeBuilderModalProps) {
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);

  const meal = mealId ? getMealById(mealId) : null;

  // Get all smoothieMix supplements for the current day type
  const smoothieMixSupplements = useMemo(() => {
    const protocol = SUPPLEMENT_PROTOCOLS[dayType];
    const supplements: { blockId: string; item: SupplementItem }[] = [];

    protocol.forEach((block) => {
      block.items.forEach((item) => {
        if (item.smoothieMix) {
          supplements.push({ blockId: block.id, item });
        }
      });
    });

    return supplements;
  }, [dayType]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      // Pre-select supplements that are already completed
      const preSelected = smoothieMixSupplements
        .filter(({ blockId, item }) => isSupplementCompleted(blockId, item.id))
        .map(({ blockId, item }) => `${blockId}-${item.id}`);
      setSelectedSupplements(preSelected);
    }
  }, [isOpen, smoothieMixSupplements, isSupplementCompleted]);

  const toggleSupplement = (fullId: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(fullId) ? prev.filter((id) => id !== fullId) : [...prev, fullId]
    );
  };

  const handleBuildShake = () => {
    onComplete(selectedSupplements);
  };

  if (!isOpen || !meal) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 max-w-md mx-auto"
          >
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#CDFF00]" />
                  <h2 className="text-lg font-semibold text-white">Build Your Shake</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#666666] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Base Shake Info */}
              <div className="p-4 bg-[#CDFF00]/5 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🥤</span>
                  <div>
                    <p className="text-sm font-bold text-[#CDFF00]">{meal.id}</p>
                    <p className="text-sm font-medium text-white">{meal.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#CDFF00] font-semibold">{meal.protein}g protein</span>
                  <span className="text-[#A0A0A0]">{meal.carbs}g carbs</span>
                  <span className="text-[#A0A0A0]">{meal.fat}g fat</span>
                  <span className="text-[#666666]">{meal.calories} cal</span>
                </div>
              </div>

              {/* Supplement Selection */}
              <div className="p-4">
                <p className="text-sm text-[#A0A0A0] mb-3">
                  Add supplements to your shake:
                </p>

                {smoothieMixSupplements.length === 0 ? (
                  <p className="text-sm text-[#666666] italic py-4 text-center">
                    No mixable supplements available for this day type.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {smoothieMixSupplements.map(({ blockId, item }) => {
                      const fullId = `${blockId}-${item.id}`;
                      const isSelected = selectedSupplements.includes(fullId);
                      const isAlreadyCompleted = isSupplementCompleted(blockId, item.id);

                      return (
                        <motion.button
                          key={fullId}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSupplement(fullId)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                            isSelected
                              ? 'bg-[#CDFF00]/10 border border-[#CDFF00]/30'
                              : 'bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#3A3A3A]'
                          )}
                        >
                          {/* Checkbox */}
                          <div
                            className={cn(
                              'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                              isSelected ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A] border border-[#3A3A3A]'
                            )}
                          >
                            {isSelected && <Check className="w-4 h-4 text-[#0A0A0A]" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-[#A0A0A0]')}>
                                {item.name}
                              </span>
                              {isAlreadyCompleted && !isSelected && (
                                <span className="text-[10px] text-[#666666] italic">(already taken)</span>
                              )}
                            </div>
                            <span className="text-xs text-[#666666]">{item.dose}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#2A2A2A]">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuildShake}
                  className="w-full py-3 rounded-xl bg-[#CDFF00] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B8E600] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Build Shake
                  {selectedSupplements.length > 0 && (
                    <span className="bg-[#0A0A0A] text-[#CDFF00] px-2 py-0.5 rounded-full text-xs">
                      +{selectedSupplements.length}
                    </span>
                  )}
                </motion.button>
                <p className="text-[10px] text-[#666666] text-center mt-2">
                  Selected supplements will be marked as complete
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
