---
id: REV-028
severity: P3
agent: agent-native-reviewer
status: done
file: docs/prds/smart-notifications.md
line: N/A
created: 2026-03-04
---

# Email template HTML inline not separated

## Description
Email template HTML inline not separated from logic.

## Proposed Fix
Extract to /src/email-templates/.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
