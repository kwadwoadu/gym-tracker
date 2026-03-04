---
id: REV-006
severity: P1
agent: performance-oracle
status: done
file: docs/prds/ai-form-analysis.md
line: N/A
created: 2026-03-04
---

# MediaPipe 5MB WASM bundle missing lazy-load strategy

## Description
5MB model loaded without dynamic import would block app startup for all users even if they never use form analysis.

## Proposed Fix
Lazy-load via dynamic import() on first camera activation, show "Preparing camera..." loading state, code-split into separate chunk.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
