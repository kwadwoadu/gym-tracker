---
id: REV-032
severity: P2
agent: security-sentinel
status: done
file: src/app/api/community/badges/user/route.ts
line: 8-10
created: 2026-03-11
---

# Unrestricted badge access via query parameter IDOR

## Description
The badges endpoint accepts a `userId` query parameter without verifying the requesting user has permission to view that user's badges. Any authenticated user can enumerate other users' badge data.

## Proposed Fix
Either restrict to own badges only (ignore query param, use authenticated user's ID) or add a friendship/visibility check before returning badge data.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
