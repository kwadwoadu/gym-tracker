---
id: REV-036
severity: P3
agent: code-simplicity-reviewer
status: done
file: src/components/nutrition/WeightTrendChart.tsx
line: 1-62
created: 2026-03-11
---

# WeightTrendChart hardcoded hex colors instead of COLORS design tokens

## Description
WeightTrendChart uses hardcoded hex colors (`#CDFF00`, `#22C55E`) instead of importing from the COLORS design token object like BodyFatChart does. Inconsistent with project design system.

## Proposed Fix
Import COLORS from the design tokens file and use `COLORS.accent`, `COLORS.success` etc.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
