---
id: REV-006
severity: P3
agent: architecture-strategist
status: done
file: src/lib/api-client.ts
line: 16-24
created: 2026-03-06
---

# fetchWithRetry inconsistently applied across API methods

## Description
Only workoutLogsApi.create and .update use fetchWithRetry. Other methods (list, get, getActive) still use raw fetch, creating inconsistent 401 handling.

## Proposed Fix
Apply fetchWithRetry to all workoutLogsApi methods, or document why only mutations need it.

## Context
Found during review of commit 6846e1a.
