---
id: REV-007
severity: P3
agent: agent-native-reviewer
status: done
file: src/lib/api-client.ts
line: 16-24
created: 2026-03-06
---

# No logging on retry success/failure path

## Description
The retry is completely silent - no way to distinguish "retried and succeeded" from "retried and failed" in logs.

## Proposed Fix
Add console.warn("[API] 401 received, retrying...") before retry and log the outcome.

## Context
Found during review of commit 6846e1a.
