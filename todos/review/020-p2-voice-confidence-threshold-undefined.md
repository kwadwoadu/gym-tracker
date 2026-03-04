---
id: REV-020
severity: P2
agent: agent-native-reviewer
status: done
file: docs/prds/ai-voice-logging.md
line: N/A
created: 2026-03-04
---

# Tier 1/2 confidence threshold undefined

## Description
"Low confidence" triggers Tier 2 but no number defined.

## Proposed Fix
Define 85% threshold with scoring method.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
