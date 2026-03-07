---
id: REV-012
severity: P2
agent: code-simplicity-reviewer
status: done
file: src/components/shared/evolved-card.tsx
line: 1-32
created: 2026-03-07
---

# EvolvedCard wrapper adds no value over direct motion.div usage

## Description
Thin wrapper over `motion.div + ELEVATION[variant]`. Every usage could be a one-liner inline. Adds an import and abstraction for a single-line transformation.

## Proposed Fix
Delete component, use `cn(ELEVATION[variant], className)` directly at callsites.

## Context
Found during review of commits c2cf8d6, 29c184d.
