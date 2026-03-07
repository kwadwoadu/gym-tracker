---
id: REV-002
severity: P1
agent: architecture-strategist
status: done
file: src/components/layout/more-sheet.tsx, src/components/layout/bottom-tab-bar.tsx
line: more-sheet:25-68, bottom-tab-bar:31
created: 2026-03-07
---

# Navigation structure hardcoded in 2 places with no single source of truth

## Description
More sheet menu items and isMoreActive route list are maintained independently in two files. Adding a new route requires updating both or navigation breaks.

## Proposed Fix
Create `src/config/navigation.ts` exporting shared route config:
```typescript
export const MORE_MENU_ROUTES = [
  { href: "/exercises", icon: Dumbbell, label: "Exercises", description: "Browse exercise library" },
  { href: "/community", icon: Users, label: "Community", description: "Leaderboard, groups & templates" },
  // ...
];
```
Import in both more-sheet.tsx and bottom-tab-bar.tsx.

## Context
Found during review of commits c2cf8d6, 29c184d.
