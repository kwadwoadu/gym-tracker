---
id: REV-006
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/app/community/page.tsx
line: 178-196
created: 2026-03-07
---

# Custom tab bar instead of shadcn Tabs in community page

## Description
Community page implements its own button-based tab bar while the rest of the codebase uses shadcn/ui Tabs component. Inconsistent pattern.

## Proposed Fix
Replace with shadcn Tabs/TabsList/TabsTrigger/TabsContent.

## Context
Found during review of commits c2cf8d6, 29c184d.
