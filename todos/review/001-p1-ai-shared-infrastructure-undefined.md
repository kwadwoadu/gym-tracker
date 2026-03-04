---
id: REV-001
severity: P1
agent: architecture-strategist
status: done
file: docs/prds/ai-program-generation.md
line: N/A
created: 2026-03-04
---

# AI shared infrastructure ownership undefined across 3 PRDs

## Description
ai-program-generation creates ai-client.ts but copilot and voice-logging depend on it implicitly with no explicit dependency chain documented.

## Proposed Fix
Add phasing in project CLAUDE.md: Phase 3.1 (program-gen creates ai-client) -> 3.2 (copilot) -> 3.3 (voice). Update each AI PRD Dependencies section.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
