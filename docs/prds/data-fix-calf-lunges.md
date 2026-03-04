# Data Fix: Calf Raise Swap + Walking Lunges Weight Correction

> **Status:** Complete
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P0
> **Type:** Data Migration

---

## Problem

Two data issues in workout history:
1. **Seated Calf Raise** was tracked but the actual exercise performed was **Standing Calf Raise** - exercise ID needs swapping in all historical logs and PRs
2. **Walking Lunges** weights were logged per-dumbbell instead of total weight - all weights need doubling

## Solution

Script at `/domains/health/scripts/fix-calf-lunges.cjs` performs:
1. Swap exerciseId from Seated Calf Raise to Standing Calf Raise in `WorkoutLog.sets` JSON
2. Swap exerciseId in `PersonalRecord` table for calf raise entries
3. Double weight values for Walking Lunges in `WorkoutLog.sets` JSON
4. Double weight values in `PersonalRecord` table for Walking Lunges

## Impact

| Fix | Workout Logs | Sets | Personal Records |
|-----|-------------|------|-----------------|
| Calf Raise Swap | 3 | 10 | 2 |
| Lunges Doubled | 3 | 12 | 3 |

## Execution Log

- **Dry run**: 2026-03-04 - Verified changes preview, all correct
- **Applied**: 2026-03-04 - Committed to production Neon PostgreSQL

## Script

`domains/health/scripts/fix-calf-lunges.cjs` - Transaction-wrapped, supports dry-run and apply modes.
