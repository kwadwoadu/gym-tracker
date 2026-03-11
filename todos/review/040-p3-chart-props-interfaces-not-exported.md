---
id: REV-040
severity: P3
agent: typescript-reviewer
status: done
file: src/components/body-composition/BodyFatChart.tsx
line: 1-10
created: 2026-03-11
---

# Chart component props interfaces not exported

## Description
BodyFatChart and WeightTrendChart define props interfaces inline but don't export them. Other components that render these charts can't type-check the props they pass without importing the interface.

## Proposed Fix
Export the props interfaces (e.g., `export interface BodyFatChartProps`).

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
