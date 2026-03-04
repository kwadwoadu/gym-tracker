---
id: REV-004
severity: P1
agent: performance-oracle
status: done
file: docs/prds/exercise-form-library.md
line: N/A
created: 2026-03-04
---

# Video caching may exceed IndexedDB storage limits

## Description
80+ exercise videos at 3-5MB each = 240-400MB. Mobile IndexedDB limit is 50-100MB. No eviction policy.

## Proposed Fix
Add 50MB cache limit, LRU eviction, cache only current program exercises. Use navigator.storage.estimate() before caching.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
