---
id: REV-003
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/components/workout/exercise-card.tsx, src/components/workout/set-logger.tsx
line: 242, 451
created: 2026-03-04
---

# onSaveReport callback discards report data

## Description
FormCamera's onSaveReport passes a SetFormReport object but the callbacks ignore it: `onSaveReport={() => setShowFormAnalysis(false)}`. Analysis results are generated but never persisted.

## Proposed Fix
Accept and handle the report:
```tsx
onSaveReport={(report) => {
  // TODO: persist report to workout log or IndexedDB
  console.log('Form report:', report);
  setShowFormAnalysis(false);
}}
```

## Context
Found during review of commit 06291ea.
