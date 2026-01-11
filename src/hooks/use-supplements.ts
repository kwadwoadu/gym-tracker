'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DayType, SUPPLEMENT_PROTOCOLS, getAllSupplementIds } from '@/data/supplement-protocol';
import { useSupplementLog, useUpdateSupplementLog } from '@/lib/queries';

const STORAGE_KEY_PREFIX = 'setflow-supplements-';

/**
 * Hook to manage supplement tracking state
 * - Stores completion state in database (via React Query)
 * - Falls back to localStorage for offline support
 * - Provides toggle and complete-all functions
 */
export function useSupplements(date: string) {
  const [dayType, setDayTypeLocal] = useState<DayType>('rest');
  const [completed, setCompletedLocal] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingUpdate = useRef(false);

  // React Query hooks
  const { data: serverData, isLoading, isError } = useSupplementLog(date);
  const updateMutation = useUpdateSupplementLog();

  // Load from localStorage first (for instant display), then sync with server
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${date}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDayTypeLocal(parsed.dayType || 'rest');
        setCompletedLocal(parsed.completed || []);
      } else {
        setDayTypeLocal('rest');
        setCompletedLocal([]);
      }
    } catch {
      setDayTypeLocal('rest');
      setCompletedLocal([]);
    }
    setIsLoaded(true);
  }, [date]);

  // When server data arrives, sync it (server is source of truth)
  useEffect(() => {
    if (serverData && !pendingUpdate.current) {
      setDayTypeLocal((serverData.dayType as DayType) || 'rest');
      setCompletedLocal(serverData.completed || []);
      // Also update localStorage cache
      const storageKey = `${STORAGE_KEY_PREFIX}${date}`;
      localStorage.setItem(storageKey, JSON.stringify({
        dayType: serverData.dayType || 'rest',
        completed: serverData.completed || [],
      }));
    }
  }, [serverData, date]);

  // Save to both localStorage and server
  const saveState = useCallback((newDayType: DayType, newCompleted: string[]) => {
    // Update localStorage immediately for offline support
    const storageKey = `${STORAGE_KEY_PREFIX}${date}`;
    localStorage.setItem(storageKey, JSON.stringify({
      dayType: newDayType,
      completed: newCompleted,
    }));

    // Sync to server
    pendingUpdate.current = true;
    updateMutation.mutate(
      { date, dayType: newDayType, completed: newCompleted },
      {
        onSettled: () => {
          pendingUpdate.current = false;
        },
      }
    );
  }, [date, updateMutation]);

  // Toggle a single supplement
  const toggleSupplement = useCallback((blockId: string, itemId: string) => {
    const fullId = `${blockId}-${itemId}`;
    const newCompleted = completed.includes(fullId)
      ? completed.filter((id) => id !== fullId)
      : [...completed, fullId];

    setCompletedLocal(newCompleted);
    saveState(dayType, newCompleted);
  }, [completed, dayType, saveState]);

  // Complete all supplements in a block
  const completeBlock = useCallback(
    (blockId: string) => {
      const protocol = SUPPLEMENT_PROTOCOLS[dayType];
      const block = protocol.find((b) => b.id === blockId);
      if (!block) return;

      const blockItemIds = block.items.map((item) => `${blockId}-${item.id}`);
      const allCompleted = blockItemIds.every((id) => completed.includes(id));

      let newCompleted: string[];
      if (allCompleted) {
        // Uncomplete all
        newCompleted = completed.filter((id) => !blockItemIds.includes(id));
      } else {
        // Complete all
        newCompleted = [...new Set([...completed, ...blockItemIds])];
      }

      setCompletedLocal(newCompleted);
      saveState(dayType, newCompleted);
    },
    [dayType, completed, saveState]
  );

  // Check if a supplement is completed
  const isCompleted = useCallback(
    (blockId: string, itemId: string) => {
      return completed.includes(`${blockId}-${itemId}`);
    },
    [completed]
  );

  // Check if all items in a block are completed
  const isBlockCompleted = useCallback(
    (blockId: string) => {
      const protocol = SUPPLEMENT_PROTOCOLS[dayType];
      const block = protocol.find((b) => b.id === blockId);
      if (!block) return false;

      return block.items.every((item) => completed.includes(`${blockId}-${item.id}`));
    },
    [dayType, completed]
  );

  // Calculate progress percentage
  const progress = (() => {
    const allIds = getAllSupplementIds(dayType);
    if (allIds.length === 0) return 0;
    const completedCount = allIds.filter((id) => completed.includes(id)).length;
    return Math.round((completedCount / allIds.length) * 100);
  })();

  // Change day type
  const changeDayType = useCallback((newDayType: DayType) => {
    setDayTypeLocal(newDayType);
    saveState(newDayType, completed);
  }, [completed, saveState]);

  return {
    dayType,
    setDayType: changeDayType,
    completed,
    toggleSupplement,
    completeBlock,
    isCompleted,
    isBlockCompleted,
    progress,
    isLoaded: isLoaded && !isLoading,
    isSyncing: updateMutation.isPending,
    syncError: isError || updateMutation.isError,
    protocol: SUPPLEMENT_PROTOCOLS[dayType],
  };
}
