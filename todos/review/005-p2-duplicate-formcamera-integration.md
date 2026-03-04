---
id: REV-005
severity: P2
agent: architecture-strategist
status: pending
file: src/components/workout/exercise-card.tsx, src/components/workout/set-logger.tsx
line: 52-55, 141-148
created: 2026-03-04
---

# Duplicate FormCamera integration across two components

## Description
Both ExerciseCard and SetLogger independently implement identical form rule lookup, button styling, and FormCamera rendering. Violates DRY. Also inconsistent: ExerciseCard uses Dialog, SetLogger renders inline.

## Proposed Fix
Extract a `useFormAnalysis(exerciseId)` hook and/or shared `FormAnalysisButton` component. Standardize on Dialog rendering in both locations.

## Context
Found during review of commit 06291ea.
