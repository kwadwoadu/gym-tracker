---
id: REV-008
severity: P2
agent: architecture-strategist
status: done
file: src/components/workout/workout-carousel.tsx
line: 19
created: 2026-03-06
---

# Carousel onEditSet should be required, not optional

## Description
onEditSet is optional but always provided by the only caller. Disabled buttons when undefined is confusing UX.

## Proposed Fix
Change `onEditSet?: (exerciseId: string, setNumber: number) => void` to `onEditSet: (exerciseId: string, setNumber: number) => void` (remove the ?).
