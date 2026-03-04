---
id: REV-001
severity: P1
agent: performance-oracle
status: pending
file: src/components/workout/form-camera.tsx
line: 46-53
created: 2026-03-04
---

# Memory leak - setInterval not cleaned up on early stop

## Description
`handleStartAnalysis()` creates a setInterval that only self-clears when reps >= 8. If user calls `handleStopAnalysis()` before 8 reps or closes the modal, the interval continues running indefinitely, leaking memory and mutating state after unmount.

## Proposed Fix
Use useEffect to manage interval lifecycle:
```tsx
useEffect(() => {
  if (viewState !== "analyzing") return;
  let reps = 0;
  const interval = setInterval(() => {
    reps++;
    setRepCount(reps);
    setCurrentScore(75 + Math.floor(Math.random() * 20));
    if (reps >= 8) clearInterval(interval);
  }, 2000);
  return () => clearInterval(interval);
}, [viewState]);
```

## Context
Found during review of commit 06291ea.
