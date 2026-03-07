---
id: REV-013
severity: P2
agent: architecture-strategist
status: done
file: src/lib/design-tokens.ts
line: 34-40
created: 2026-03-07
---

# CARD token object in design-tokens.ts never imported anywhere

## Description
Dead code. CARD export duplicates ELEVATION system and is never used by any component.

## Proposed Fix
Remove the CARD export from design-tokens.ts.

## Context
Found during review of commits c2cf8d6, 29c184d.
