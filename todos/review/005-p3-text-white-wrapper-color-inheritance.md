---
id: REV-005
severity: P3
agent: architecture-strategist
status: done
file: src/components/trainer/markdown-renderer.tsx
line: 30
created: 2026-03-07
---

# Wrapper text-white may affect child color inheritance

## Description
The wrapper div applies `text-white` while child `em` elements use `text-muted-foreground`. In Tailwind, the more specific child class wins, so this works correctly in practice. However, removing `text-white` from the wrapper and relying on inherited color from the parent would be cleaner.

## Proposed Fix
Remove `text-white` from the wrapper div - the parent `trainer-message.tsx` bubble already provides the text color context.

## Context
Found during review of commit 6fa92cd.
