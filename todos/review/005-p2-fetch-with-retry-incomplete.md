---
id: REV-005
severity: P2
agent: security-sentinel
status: done
file: src/lib/api-client.ts
line: 16-23
created: 2026-03-06
---

# fetchWithRetry only handles 401, ignores network errors and second failure

## Description
If first fetch throws (network error), no retry. If second attempt also returns 401, error response is returned as if successful. No backoff. Rename to clarify purpose.

## Proposed Fix
```typescript
async function fetchWithClerkRetry(url: string, options?: RequestInit): Promise<Response> {
  try {
    let response = await fetch(url, options);
    if (response.status === 401) {
      await new Promise(r => setTimeout(r, 1500));
      response = await fetch(url, options);
    }
    return response;
  } catch (e) {
    // Network error - retry once
    await new Promise(r => setTimeout(r, 1000));
    return fetch(url, options);
  }
}
```
