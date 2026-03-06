---
id: REV-004
severity: P2
agent: performance-oracle
status: done
file: src/components/workout/set-logger.tsx
line: 217
created: 2026-03-06
---

# setTimeout in handleComplete has no cleanup on unmount

## Description
600ms setTimeout with no cleanup. If component unmounts before timer fires, causes state update on unmounted component. Magic number not extracted to constant.

## Proposed Fix
Extract constant and add cleanup via useEffect:
```typescript
const COMPLETION_ANIMATION_MS = 600;
const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
}, []);

const handleComplete = () => {
  setIsCompleted(true);
  completionTimerRef.current = setTimeout(() => onComplete(weight, reps, rpe), COMPLETION_ANIMATION_MS);
};
```
