---
id: REV-003
severity: P2
agent: code-simplicity-reviewer
status: done
file: src/components/trainer/quick-actions.tsx
line: 21
created: 2026-03-07
---

# Redundant truthy + length check in QuickActions

## Description
`dynamicActions && dynamicActions.length > 0` performs a redundant double check. The optional chaining form is cleaner and idiomatic.

## Proposed Fix
Simplify to: `const actions = dynamicActions?.length ? dynamicActions : QUICK_ACTIONS;`

## Context
Found during review of commit 6fa92cd. Flagged by simplicity-reviewer and pattern-recognition.
