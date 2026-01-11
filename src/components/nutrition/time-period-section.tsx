'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type TimePeriod } from '@/data/time-periods';
import { type SupplementBlock, type SupplementItem } from '@/data/supplement-protocol';
import { type MealSlot } from '@/data/meal-templates';
import { InlineMealSlot } from './inline-meal-slot';

interface TimePeriodSectionProps {
  period: TimePeriod;
  mealId: string | null;
  supplementBlocks: SupplementBlock[];
  onSelectMeal: (slotType: MealSlot, mealId: string) => void;
  onRemoveMeal: (slotType: MealSlot) => void;
  onShakeSelected?: (mealId: string) => void;
  isSupplementCompleted: (blockId: string, itemId: string) => boolean;
  isBlockCompleted: (blockId: string) => boolean;
  onToggleSupplement: (blockId: string, itemId: string) => void;
  onCompleteBlock: (blockId: string) => void;
}

export function TimePeriodSection({
  period,
  mealId,
  supplementBlocks,
  onSelectMeal,
  onRemoveMeal,
  onShakeSelected,
  isSupplementCompleted,
  isBlockCompleted,
  onToggleSupplement,
  onCompleteBlock,
}: TimePeriodSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate completion stats
  const totalItems = supplementBlocks.reduce((acc, block) => acc + block.items.length, 0) + (mealId ? 1 : 0);
  const completedSupplements = supplementBlocks.reduce((acc, block) => {
    return acc + block.items.filter((item) => isSupplementCompleted(block.id, item.id)).length;
  }, 0);
  const completedItems = completedSupplements + (mealId ? 1 : 0);
  const isAllComplete = totalItems > 0 && completedItems === totalItems;
  const hasContent = supplementBlocks.length > 0 || period.mealSlot;

  if (!hasContent) return null;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isAllComplete
          ? 'bg-[#CDFF00]/5 border-[#CDFF00]/30'
          : 'bg-[#1A1A1A] border-[#2A2A2A]'
      )}
    >
      {/* Section Header */}
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-[#2A2A2A]/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{period.icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{period.label}</p>
            <p className="text-xs text-[#666666]">{period.timeRange}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isAllComplete
                  ? 'bg-[#CDFF00] text-[#0A0A0A]'
                  : 'bg-[#2A2A2A] text-[#A0A0A0]'
              )}
            >
              {completedItems}/{totalItems}
            </span>
          )}
          <span className="text-[#666666]">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </div>
      </motion.button>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Meal Slot */}
              <InlineMealSlot
                slotType={period.mealSlot}
                mealId={mealId}
                onSelectMeal={(newMealId) => onSelectMeal(period.mealSlot, newMealId)}
                onRemoveMeal={() => onRemoveMeal(period.mealSlot)}
                onShakeSelected={onShakeSelected}
                compact
              />

              {/* Supplements for this period */}
              {supplementBlocks.map((block) => (
                <SupplementBlockInline
                  key={block.id}
                  block={block}
                  isBlockCompleted={isBlockCompleted(block.id)}
                  onCompleteBlock={() => onCompleteBlock(block.id)}
                  isItemCompleted={(itemId) => isSupplementCompleted(block.id, itemId)}
                  onToggleItem={(itemId) => onToggleSupplement(block.id, itemId)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline Supplement Block for Time Period Section
interface SupplementBlockInlineProps {
  block: SupplementBlock;
  isBlockCompleted: boolean;
  onCompleteBlock: () => void;
  isItemCompleted: (itemId: string) => boolean;
  onToggleItem: (itemId: string) => void;
}

function SupplementBlockInline({
  block,
  isBlockCompleted,
  onCompleteBlock,
  isItemCompleted,
  onToggleItem,
}: SupplementBlockInlineProps) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isBlockCompleted
          ? 'bg-[#CDFF00]/5 border-[#CDFF00]/20'
          : 'bg-[#0A0A0A]/50 border-[#2A2A2A]'
      )}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#2A2A2A]/50">
        <span className="text-xs font-medium text-[#A0A0A0]">Supplements</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCompleteBlock}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
            isBlockCompleted
              ? 'bg-[#CDFF00] text-[#0A0A0A]'
              : 'bg-[#2A2A2A] text-[#A0A0A0] hover:bg-[#3A3A3A]'
          )}
        >
          <Check className="w-3 h-3" />
          All
        </motion.button>
      </div>

      {/* Block Items */}
      <div className="p-1.5 space-y-0.5">
        {block.items.map((item) => (
          <SupplementItemCompact
            key={item.id}
            item={item}
            isCompleted={isItemCompleted(item.id)}
            onToggle={() => onToggleItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Compact Supplement Item for Time Period Section
interface SupplementItemCompactProps {
  item: SupplementItem;
  isCompleted: boolean;
  onToggle: () => void;
}

function SupplementItemCompact({ item, isCompleted, onToggle }: SupplementItemCompactProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-2 p-1.5 rounded transition-colors text-left',
        isCompleted ? 'bg-[#CDFF00]/10' : 'hover:bg-[#2A2A2A]/50'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
          isCompleted ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A] border border-[#3A3A3A]'
        )}
      >
        {isCompleted && <Check className="w-3 h-3 text-[#0A0A0A]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-xs font-medium',
              isCompleted ? 'text-[#A0A0A0] line-through' : 'text-white'
            )}
          >
            {item.name}
          </span>
          {item.smoothieMix && (
            <span className="text-xs" title="Can mix in smoothie">
              🥤
            </span>
          )}
          {item.optional && (
            <span className="text-[10px] text-[#666666] italic">(opt)</span>
          )}
        </div>
        <span className="text-[10px] text-[#666666]">{item.dose}</span>
      </div>
    </motion.button>
  );
}
