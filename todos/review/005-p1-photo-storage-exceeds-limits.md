---
id: REV-005
severity: P1
agent: performance-oracle
status: done
file: docs/prds/body-composition-tracking.md
line: N/A
created: 2026-03-04
---

# Photo storage as Blobs will exceed device limits

## Description
36 photos/year at 3MB = 126MB. Combined with video cache, exceeds quota.

## Proposed Fix
Compress to 720p max (500KB), store thumbnails only in IndexedDB, full-res on-demand decompression.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
