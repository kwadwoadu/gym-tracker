---
id: REV-018
severity: P2
agent: performance-oracle
status: done
file: docs/prds/body-composition-tracking.md
line: N/A
created: 2026-03-04
---

# Recharts 365 data points untested on low-end devices

## Description
Chart may jank on older iPhones.

## Proposed Fix
Downsample to weekly for 3M+ periods, wrap in React.memo().

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
