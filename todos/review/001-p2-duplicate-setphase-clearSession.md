---
id: REV-001
severity: P2
agent: architecture-strategist
status: done
file: src/app/workout/[dayId]/page.tsx
line: 918-942
created: 2026-03-06
---

# Duplicate setPhase("complete") and clearSession() calls

## Description
setPhase("complete") and clearSession() are called optimistically at line 918-919, then again at lines 941-942 after successful API save. The duplicate causes unnecessary re-renders and makes the flow confusing.

## Proposed Fix
Remove the duplicate calls at lines 941-942 and the now-stale comment above them ("CRITICAL: Transition to complete phase BEFORE secondary operations").

## Context
Found during review of commit 6846e1a.
