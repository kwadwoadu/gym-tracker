---
id: REV-006
severity: P2
agent: security-sentinel
status: done
file: src/lib/jwt-utils.ts
line: 30
created: 2026-03-06
---

# JWT 30s grace period should be extracted as constant with clear comment

## Description
Changed from strict to 30s grace period. The logic is correct (rejects tokens expired > 30s ago) but needs a named constant and clearer comment explaining the security trade-off.

## Proposed Fix
```typescript
const JWT_GRACE_PERIOD_MS = 30_000; // 30s: accounts for clock skew + API call latency

// Reject tokens that expired more than grace period ago
if (payload.exp && payload.exp * 1000 < Date.now() - JWT_GRACE_PERIOD_MS) {
  return null;
}
```
