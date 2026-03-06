---
title: "React review findings batch resolution - 7 patterns"
category: logic-errors
date: 2026-03-06
severity: P2
tags: [useEffect-infinite-loop, useMemo, setTimeout-cleanup, fetchWithRetry, retry-coordination, magic-numbers, optional-props]
related:
  - docs/solutions/logic-errors/2026-02-26-flexible-meal-selection-review-findings.md
  - docs/solutions/security-issues/2026-03-06-clerk-vercel-auth-fallback.md
project: setflow
---

# React review findings batch resolution - 7 patterns

## Problem

After implementing the Superset & Quality Sprint (3 P1 bugs, 2 P2 features, Vitest setup), a 7-agent parallel review (`/review`) found 8 findings (1 P1, 7 P2). One was a false positive, leaving 7 valid findings across 5 files.

## Root Causes

| Finding | Root Cause | Pattern |
|---------|-----------|---------|
| Auto-skip infinite loop (P1) | useEffect calls setState which re-triggers effect | Missing re-entry guard + missing dep |
| IIFE in JSX re-renders | Inline function creates new bindings every render | Breaks referential equality for child props |
| setTimeout no cleanup | Timer fires after unmount | State update on unmounted component |
| fetchWithRetry incomplete | Only catches HTTP 401, not network errors | fetch() throws on network failure, not caught |
| JWT magic number | `30000` hardcoded without explanation | Security trade-off not self-documenting |
| Double retry overlap | Manual 3-attempt loop wraps fetchWithRetry (2 attempts) | Up to 6 API calls, uncoordinated |
| Optional prop always provided | `onEditSet?:` but single caller always passes it | Interface doesn't match usage |

## Solution

### 1. Auto-skip useEffect ref guard (P1)
```typescript
const lastAutoSkippedRef = useRef<string | null>(null);

useEffect(() => {
  // ...
  const key = `${exerciseData.exerciseId}-${workoutState.setNumber}`;
  if (autoSkipExercises.has(exerciseData.exerciseId) && lastAutoSkippedRef.current !== key) {
    lastAutoSkippedRef.current = key;
    handleSkipSet();
  }
}, [phase, trainingDay, workoutState.supersetIndex, ...]);
```

### 2. IIFE to useMemo
```typescript
// Before: {(() => { const mem = ...; return <SetLoggerSheet ... />; })()}
// After:
const sessionMemData = useMemo(() => {
  const sessionMem = getSessionMemoryForExercise(...);
  return { sessionMem, memSource };
}, [sheetFlatExercise?.exerciseId, sheetSetNumber, completedSets, globalSuggestion]);
```

### 3. setTimeout cleanup
```typescript
const COMPLETION_ANIMATION_MS = 600;
const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
}, []);
```

### 4. fetchWithRetry network error handling
```typescript
try {
  let response = await fetch(url, mergedOptions);
  if (response.status === 401) { /* existing retry */ }
  return response;
} catch (e) {
  console.warn("[API] Network error, retrying...", e);
  await new Promise(r => setTimeout(r, 1000));
  return fetch(url, mergedOptions);
}
```

### 5. JWT grace period constant
```typescript
const JWT_GRACE_PERIOD_MS = 30_000; // clock skew + API call latency
```

### 6. Remove double retry
```typescript
// Before: 3-attempt loop around workoutLogsApi.create() which uses fetchWithRetry
// After: const savedLog = await workoutLogsApi.create(workoutLogData);
```

### 7. Make onEditSet required
```typescript
// Before: onEditSet?: (exerciseId: string, setNumber: number) => void;
// After:  onEditSet: (exerciseId: string, setNumber: number) => void;
```

## Key Changes

| File | Changes |
|------|---------|
| `src/app/workout/[dayId]/page.tsx` | useMemo import, lastAutoSkippedRef, sessionMemData memo, removed retry loop, removed IIFE |
| `src/components/workout/set-logger.tsx` | COMPLETION_ANIMATION_MS, completionTimerRef, cleanup useEffect |
| `src/components/workout/workout-carousel.tsx` | onEditSet required, simplified disabled check |
| `src/lib/api-client.ts` | try-catch for network errors in fetchWithRetry |
| `src/lib/jwt-utils.ts` | JWT_GRACE_PERIOD_MS constant |

## Prevention

1. **CLAUDE.md rules** (LOW effort, HIGH impact):
   - "If setState in useEffect, MUST use ref guard to prevent re-entry"
   - "No IIFEs in JSX. Use useMemo for computed values"
   - "All setTimeout/setInterval MUST have cleanup via useEffect return"
   - "Single retry layer only. Never stack fetchWithRetry + manual loop"
   - "Extract magic numbers to named constants with comments"
   - "Props: if always provided by callers, make required (remove ?)"

2. **Linting** (MEDIUM effort):
   - Re-enable `react-hooks/set-state-in-effect` as warning
   - Consider `no-magic-numbers` with whitelist

3. **Tests** (MEDIUM effort):
   - Test setTimeout cleanup with unmount
   - Test fetchWithRetry with network errors (msw)
   - Test retry count doesn't exceed expected

## False Positive

REV-002 claimed duplicate `setPhase("complete")` calls but only one exists at line 941. Always verify review agent claims with `grep` before fixing.

## Related

- `docs/solutions/logic-errors/2026-02-26-flexible-meal-selection-review-findings.md` - Same useMemo/React.memo patterns
- `docs/solutions/security-issues/2026-03-06-clerk-vercel-auth-fallback.md` - JWT decode utility origin
