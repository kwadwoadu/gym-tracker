---
id: REV-008
severity: P2
agent: security-sentinel
status: done
file: src/app/api/community/profile/route.ts
line: 34-40
created: 2026-03-07
---

# No input validation on profile fields (displayName, bio, handle)

## Description
No length limits or format validation on user-submitted profile fields. Risk of storage exhaustion or UI overflow.

## Proposed Fix
Add length validation: displayName max 50 chars, bio max 500 chars, handle regex `^[a-zA-Z0-9_-]{3,30}$`.

## Context
Found during review of commits c2cf8d6, 29c184d.
