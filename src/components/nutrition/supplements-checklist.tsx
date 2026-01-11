'use client';

import { motion } from 'framer-motion';
import { Check, Pill, Coffee, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupplements } from '@/hooks/use-supplements';
import { DayType, DAY_TYPE_LABELS, SupplementBlock, SupplementItem } from '@/data/supplement-protocol';

interface SupplementsChecklistProps {
  date: string;
}

export function SupplementsChecklist({ date }: SupplementsChecklistProps) {
  const {
    dayType,
    setDayType,
    toggleSupplement,
    completeBlock,
    isCompleted,
    isBlockCompleted,
    progress,
    isLoaded,
    protocol,
  } = useSupplements(date);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Day Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#CDFF00]" />
          <h2 className="text-lg font-semibold text-white">Supplements</h2>
        </div>
        <DayTypeSelector dayType={dayType} onChange={setDayType} />
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#A0A0A0]">Progress</span>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#CDFF00] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Supplement Blocks */}
      <div className="space-y-3">
        {protocol.map((block) => (
          <SupplementBlockCard
            key={block.id}
            block={block}
            isBlockCompleted={isBlockCompleted(block.id)}
            onCompleteBlock={() => completeBlock(block.id)}
            isItemCompleted={(itemId) => isCompleted(block.id, itemId)}
            onToggleItem={(itemId) => toggleSupplement(block.id, itemId)}
          />
        ))}
      </div>
    </div>
  );
}

// Day Type Selector Component
interface DayTypeSelectorProps {
  dayType: DayType;
  onChange: (dayType: DayType) => void;
}

function DayTypeSelector({ dayType, onChange }: DayTypeSelectorProps) {
  const dayTypes: DayType[] = ['rest', 'am-training', 'pm-training'];

  return (
    <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
      {dayTypes.map((type) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            dayType === type
              ? 'bg-[#CDFF00] text-[#0A0A0A]'
              : 'text-[#A0A0A0] hover:text-white'
          )}
        >
          {DAY_TYPE_LABELS[type]}
        </motion.button>
      ))}
    </div>
  );
}

// Supplement Block Card Component
interface SupplementBlockCardProps {
  block: SupplementBlock;
  isBlockCompleted: boolean;
  onCompleteBlock: () => void;
  isItemCompleted: (itemId: string) => boolean;
  onToggleItem: (itemId: string) => void;
}

function SupplementBlockCard({
  block,
  isBlockCompleted,
  onCompleteBlock,
  isItemCompleted,
  onToggleItem,
}: SupplementBlockCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-colors',
        isBlockCompleted
          ? 'bg-[#CDFF00]/5 border-[#CDFF00]/30'
          : 'bg-[#1A1A1A] border-[#2A2A2A]'
      )}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2A2A2A]/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{block.icon}</span>
          <div>
            <p className="text-sm font-medium text-white">{block.label}</p>
            <p className="text-xs text-[#666666]">{block.timeRange}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCompleteBlock}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
            isBlockCompleted
              ? 'bg-[#CDFF00] text-[#0A0A0A]'
              : 'bg-[#2A2A2A] text-[#A0A0A0] hover:bg-[#3A3A3A]'
          )}
        >
          <Check className="w-3.5 h-3.5" />
          All
        </motion.button>
      </div>

      {/* Block Items */}
      <div className="p-2 space-y-1">
        {block.items.map((item) => (
          <SupplementItemRow
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

// Supplement Item Row Component
interface SupplementItemRowProps {
  item: SupplementItem;
  isCompleted: boolean;
  onToggle: () => void;
}

function SupplementItemRow({ item, isCompleted, onToggle }: SupplementItemRowProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left',
        isCompleted ? 'bg-[#CDFF00]/10' : 'hover:bg-[#2A2A2A]/50'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
          isCompleted ? 'bg-[#CDFF00]' : 'bg-[#2A2A2A] border border-[#3A3A3A]'
        )}
      >
        {isCompleted && <Check className="w-4 h-4 text-[#0A0A0A]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isCompleted ? 'text-[#A0A0A0] line-through' : 'text-white'
            )}
          >
            {item.name}
          </span>
          {item.smoothieMix && (
            <span className="text-sm" title="Can mix in smoothie">
              🥤
            </span>
          )}
          {item.alternatives && (
            <span className="flex items-center gap-1 text-xs text-[#666666]">
              <Coffee className="w-3 h-3" />
              {item.alternatives}
            </span>
          )}
          {item.optional && (
            <span className="text-xs text-[#666666] italic">(optional)</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#666666]">{item.dose}</span>
          {item.notes && (
            <span className="text-xs text-[#555555]">- {item.notes}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
