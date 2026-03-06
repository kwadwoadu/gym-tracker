---
id: REV-003
severity: P2
agent: security-sentinel
status: done
file: src/lib/api-client.ts
line: 16-24
created: 2026-03-06
---

# POST retry without idempotency risks duplicate workout creation

## Description
fetchWithRetry retries POST requests on 401. If the server processed the first request but returned 401 during response, the retry creates a duplicate workout log. No idempotency key protects against this.

## Proposed Fix
Add an X-Idempotency-Key header (e.g., crypto.randomUUID()) to the request, or verify server-side deduplication exists for workout logs (same user + same date + same dayId within a short window).

## Context
Found during review of commit 6846e1a.
