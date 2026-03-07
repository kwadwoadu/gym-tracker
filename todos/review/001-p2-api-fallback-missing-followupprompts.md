---
id: REV-001
severity: P2
agent: architecture-strategist
status: done
file: src/app/api/ai/trainer/route.ts
line: 120-124
created: 2026-03-07
---

# API fallback response missing followUpPrompts field

## Description
When the AI returns unparseable JSON, the fallback response (lines 120-124) omits `followUpPrompts`, while the system prompt defines it as part of the schema. The frontend (page.tsx:104) expects this field via optional chaining, so it degrades gracefully, but the contract is inconsistent.

## Proposed Fix
Add `followUpPrompts: []` to the fallback response object at line 122.

## Context
Found during review of commit 6fa92cd.
