# SetFlow: Cross-Browser Sync & Domain Configuration

## Summary

Two issues preventing full app functionality:
1. Gym sessions not syncing across browsers
2. gym.adu.dk domain not configured

---

## Issue 1: Cross-Browser Sync Not Working

### Root Cause

Sync requires **Clerk authentication**. Without signing in:
- Data stores locally in IndexedDB only
- Each browser has its own separate database
- No cloud sync occurs

### How Sync Works

| File | Purpose |
|------|---------|
| `/src/lib/sync.ts` | `pushToCloud()` and `pullFromCloud()` functions |
| `/src/components/sync/auto-sync-provider.tsx` | Auto-syncs every 5 minutes when signed in |
| `/src/app/api/sync/route.ts` | API endpoint using Neon PostgreSQL |

### Sync Flow
1. User signs in via Clerk
2. `AutoSyncProvider` detects `isSignedIn = true`
3. `pullFromCloud()` fetches existing data from Neon
4. `pushToCloud()` sends local changes to Neon
5. Syncs every 5 minutes and on tab focus

### Solution

**User action required**: Sign in with Clerk on each browser to enable cloud sync.

No code changes needed - feature already implemented.

---

## Issue 2: gym.adu.dk Domain Not Configured

### Current State

- **Production URL**: `gym-tracker-1iayxgcmf-k-adudks-projects.vercel.app`
- **Custom domain**: gym.adu.dk is NOT in Vercel domains list
- **Error when adding**: "Not authorized to use gym.adu.dk (403)"

### Resolution Steps

1. **Add domain in Vercel Dashboard**:
   - Go to vercel.com > gym-tracker project > Settings > Domains
   - Add `gym.adu.dk`

2. **Configure DNS at adu.dk registrar**:
   - Add CNAME record: `gym` -> `cname.vercel-dns.com`
   - OR Add A record: `gym` -> `76.76.21.21`

3. **Verify in Vercel**:
   - Vercel will auto-verify once DNS propagates (usually 5-10 min)

### Vercel Project Info
```json
{
  "projectId": "prj_QmkaNEuR6mO6PkBOR8RqsVofvOe8",
  "orgId": "team_PbFrIURH66uTANP37PPlyDnb",
  "projectName": "gym-tracker"
}
```

---

## Action Items

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Sign in with Clerk to enable sync | User | Pending |
| 2 | Add gym.adu.dk domain in Vercel dashboard | User | Pending |
| 3 | Configure DNS CNAME at adu.dk registrar | User | Pending |

---

*Created: 2026-01-01*
