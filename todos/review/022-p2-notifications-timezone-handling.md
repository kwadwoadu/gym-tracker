---
id: REV-022
severity: P2
agent: agent-native-reviewer
status: done
file: docs/prds/smart-notifications.md
line: N/A
created: 2026-03-04
---

# Timezone handling incomplete

## Description
Streak calc uses UTC vs local inconsistently.

## Proposed Fix
Add timezone field to NotificationPreference.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
