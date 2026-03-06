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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Day Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Supplements</h2>
        </div>
        <DayTypeSelector dayType={dayType} onChange={setDayType} />
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
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
    <div className="flex gap-1 bg-card rounded-lg p-1">
      {dayTypes.map((type) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            dayType === type
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-white'
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
          ? 'bg-primary/5 border-primary/30'
          : 'bg-card border-border'
      )}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{block.icon}</span>
          <div>
            <p className="text-sm font-medium text-white">{block.label}</p>
            <p className="text-xs text-dim-foreground">{block.timeRange}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCompleteBlock}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
            isBlockCompleted
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
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
        'w-full flex items-center gap-3 bg-card rounded-xl p-3 transition-colors text-left',
        isCompleted ? 'bg-primary/10' : 'hover:bg-secondary/50'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
          isCompleted ? 'bg-primary/20 border border-primary/30' : 'bg-secondary border border-border'
        )}
      >
        {isCompleted && <Check className="w-4 h-4 text-primary" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isCompleted ? 'text-muted-foreground line-through' : 'text-white'
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
            <span className="flex items-center gap-1 text-xs text-dim-foreground">
              <Coffee className="w-3 h-3" />
              {item.alternatives}
            </span>
          )}
          {item.optional && (
            <span className="text-xs text-dim-foreground italic">(optional)</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-dim-foreground">{item.dose}</span>
          {item.notes && (
            <span className="text-xs text-dim-foreground">- {item.notes}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
