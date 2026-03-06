---
title: "Workout completion silent failure from JWT expiry during long sessions"
category: security-issues
date: 2026-03-06
severity: P1
tags: [jwt-expiry, silent-failure, data-loss, optimistic-ui, clerk-auth]
related: [docs/solutions/security-issues/2026-03-06-clerk-vercel-auth-fallback.md]
project: gym-tracker
---

# Workout completion silent failure from JWT expiry during long sessions

## Problem

After deploying auth hardening (commit 09b094d), finishing a workout silently failed:
- No celebration screen shown
- Workout data lost (not saved to DB or localStorage)
- No error feedback to user - only `console.error` in catch block
- Discovered by Kwadwo completing a real workout in production

## Root Cause

Three compounding failures:

1. **JWT grace period removed**: `decodeClerkJwt()` in `jwt-utils.ts` used strict expiry (`payload.exp * 1000 < Date.now()`). Clerk JWTs are 60s-lived. During a 30+ minute workout, the token expires. The fallback decoder (last resort when Clerk's `auth()` fails on Vercel Edge) rejected the expired token.

2. **No retry on 401**: `api-client.ts` had no retry mechanism. A single 401 from the workout save API was terminal.

3. **Silent error swallowing**: `page.tsx` catch block only logged to console. `setPhase("complete")` was positioned after the API call, so it never executed on failure. User saw nothing.

## Solution

Four-layer defense pattern for user-critical operations:

### Layer 1: JWT grace period (jwt-utils.ts)
```typescript
const JWT_GRACE_PERIOD_MS = 30_000;
if (payload.exp && payload.exp * 1000 < Date.now() - JWT_GRACE_PERIOD_MS) {
  return null;
}
```
Accepts tokens expired up to 30s ago. Absorbs clock skew and API latency without security risk (tokens refresh every 60s).

### Layer 2: fetchWithRetry (api-client.ts)
```typescript
async function fetchWithRetry(url, options) {
  const headers = { ...options?.headers };
  if (isMutating) headers["X-Idempotency-Key"] = crypto.randomUUID();
  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    console.warn("[API] 401 received, retrying...");
    await new Promise(r => setTimeout(r, 1000));
    response = await fetch(url, { ...options, headers });
  }
  return response;
}
```
1s delay lets Clerk refresh the `__session` cookie. Idempotency key prevents duplicate creation on retry.

### Layer 3: Optimistic completion (page.tsx)
```typescript
// 1. Save to localStorage first (data safety net)
localStorage.setItem(`pending-workout-${userId}`, JSON.stringify(data));
// 2. Show completion screen immediately
setPhase("complete");
clearSession();
// 3. Try API save in background
try { await workoutLogsApi.create(data); localStorage.removeItem(key); }
catch { setSaveError("Saved locally. Will sync when connection restored."); }
```

### Layer 4: Recovery on reload (page.tsx useEffect)
```typescript
useEffect(() => {
  const pending = localStorage.getItem(`pending-workout-${userId}`);
  if (pending) {
    workoutLogsApi.create(JSON.parse(pending))
      .then(() => localStorage.removeItem(key));
  }
}, [userId]);
```

## Key Changes

| File | Change |
|------|--------|
| `src/lib/jwt-utils.ts` | 30s grace period via `JWT_GRACE_PERIOD_MS` constant |
| `src/lib/api-client.ts` | `fetchWithRetry()` with 401 retry, idempotency key, logging |
| `src/app/workout/[dayId]/page.tsx` | Optimistic save, localStorage safety net, recovery useEffect, error banner |

## Prevention

1. **CLAUDE.md rule** (low effort): Never deploy auth changes without testing workout completion flow
2. **ESLint** (low effort): Ban empty catch blocks for API calls (`no-empty-catch`)
3. **Integration test** (medium effort): Test expired JWT during workout save - assert error UI visible + localStorage fallback works
4. **Pre-commit hook** (low effort): Changes to `jwt-utils.ts` or `auth-helpers.ts` require corresponding test updates
5. **CI check** (medium effort): Validate `JWT_GRACE_PERIOD_MS > 0` in jwt-utils.ts

## Pattern: Optimistic Save for User-Critical Operations

```
1. Save to LOCAL first (synchronous, never fails)
2. Show success UI IMMEDIATELY (optimistic)
3. Try cloud sync IN BACKGROUND (with retry)
4. If fails: Show warning banner (not error dialog)
5. On app reload: Check localStorage, sync pending data
```

Applies to: workout saves, PR records, any operation where data loss breaks user trust.

## Related

- `docs/solutions/security-issues/2026-03-06-clerk-vercel-auth-fallback.md` - The auth fallback pattern that this fix builds on
- Clerk/JavaScript issue #2045 - `auth()` fails silently on Vercel Edge Runtime
