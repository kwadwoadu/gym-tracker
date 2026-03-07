---
id: REV-004
severity: P3
agent: code-simplicity-reviewer
status: done
file: src/app/trainer/page.tsx
line: 120
created: 2026-03-07
---

# Error handler clears dynamic prompts instead of preserving last good ones

## Description
On fetch error, `setDynamicPrompts([])` removes the previous AI-generated prompts, falling back to static defaults. The previous prompts were contextually relevant and could be preserved.

## Proposed Fix
Remove `setDynamicPrompts([])` from the error handler to keep the last successful prompts visible.

## Context
Found during review of commit 6fa92cd.
