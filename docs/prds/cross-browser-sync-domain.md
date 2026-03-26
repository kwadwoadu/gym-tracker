# SetFlow: Cross-Browser Sync & Domain Configuration

**Status**: SHIPPED
**Created**: 2026-01-01
**Author**: Kwadwo Adu

---

## 1. Problem Statement

Two issues preventing full app functionality:
1. **Gym sessions not syncing across browsers** - Data stores locally in IndexedDB only, each browser has its own separate database with no cloud sync occurring
2. **gym.adu.dk domain not configured** - Custom domain is not set up in Vercel, users must access via long Vercel deployment URL

**Root cause**: Sync requires Clerk authentication. Without signing in, data is local-only. The domain issue requires Vercel dashboard + DNS configuration.

---

## 2. Solution

### Sync Architecture (Already Implemented)
Cloud sync is already built but requires user authentication:
1. User signs in via Clerk
2. `AutoSyncProvider` detects `isSignedIn = true`
3. `pullFromCloud()` fetches existing data from Neon PostgreSQL
4. `pushToCloud()` sends local changes to Neon
5. Syncs every 5 minutes and on tab focus

### Domain Configuration (Manual Steps)
1. Add `gym.adu.dk` domain in Vercel dashboard
2. Configure DNS CNAME record at adu.dk registrar
3. Verify domain propagation

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cross-browser sync | Workouts appear on all signed-in devices within 5 minutes | Log workout on device A, verify on device B |
| Sync error rate | 0 errors in Vercel logs | Check Vercel function logs for sync API errors |
| Domain accessibility | gym.adu.dk loads successfully | Navigate to gym.adu.dk, verify app loads |
| SSL certificate | Valid HTTPS on gym.adu.dk | Browser padlock icon, no certificate warnings |
| Sync latency | <3 seconds per sync operation | Measure time from trigger to completion |

---

## 4. Requirements

### Must Have
- [x] Cloud sync via Neon PostgreSQL when authenticated
- [x] `pushToCloud()` function sends local changes
- [x] `pullFromCloud()` function fetches remote data
- [x] `AutoSyncProvider` syncs every 5 minutes + on tab focus
- [x] Clerk authentication integration
- [ ] gym.adu.dk domain configured in Vercel
- [ ] DNS CNAME record pointing to Vercel

### Should Have
- [x] SyncIndicator component showing sync status
- [ ] Manual sync trigger button
- [ ] Conflict resolution for concurrent edits on multiple devices

### Won't Have (this version)
- Real-time sync (WebSocket/SSE)
- Offline queue with guaranteed delivery
- Selective sync (sync only specific data types)

---

## 5. User Flows

### Flow A: Enable Cross-Browser Sync
1. User opens SetFlow on browser A (e.g., mobile Safari)
2. User taps "Sign In" and authenticates via Clerk
3. AutoSyncProvider activates, runs initial `pullFromCloud()`
4. Any existing cloud data merges with local data
5. User logs workouts normally
6. Every 5 minutes (or on tab focus), `pushToCloud()` sends changes
7. User opens SetFlow on browser B (e.g., desktop Chrome)
8. User signs in with same Clerk account
9. `pullFromCloud()` fetches all synced data
10. Workouts from browser A appear on browser B

### Flow B: Domain Configuration
1. Admin navigates to Vercel dashboard > gym-tracker project > Settings > Domains
2. Admin adds `gym.adu.dk` as custom domain
3. Admin configures DNS at adu.dk registrar: CNAME `gym` -> `cname.vercel-dns.com`
4. Vercel auto-verifies once DNS propagates (5-10 minutes)
5. Users can access the app at gym.adu.dk with valid HTTPS

### Flow C: Sync Status Visibility
1. User is signed in and on the home page
2. SyncIndicator shows current sync state (syncing, synced, error)
3. On successful sync, checkmark icon appears
4. On sync error, warning icon appears with retry option
5. User can see when data was last synced

---

## 6. Design

### Wireframes

```
Sync Indicator (in header):
┌─────────────────────────────────────────┐
│  SetFlow                      [✓ Synced]│
│                                          │
│  (or)                                    │
│  SetFlow                  [↻ Syncing...] │
│                                          │
│  (or)                                    │
│  SetFlow                   [⚠ Sync Error]│
└─────────────────────────────────────────┘

Sign-In Prompt (when not authenticated):
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │  ☁  Enable Cloud Sync            │  │
│  │  Sign in to sync your workouts   │  │
│  │  across all your devices.        │  │
│  │                                   │  │
│  │  [  Sign In with Clerk  ]        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| AutoSyncProvider | `/src/components/sync/auto-sync-provider.tsx` | Background sync every 5 min + tab focus |
| SyncIndicator | `/src/components/sync/sync-indicator.tsx` | Visual sync status in header |
| SignInPrompt | (Clerk component) | Authentication UI |

### Visual Spec

| Element | Property | Value |
|---------|----------|-------|
| Sync indicator (synced) | Color | `#22C55E` (success green) |
| Sync indicator (syncing) | Color | `#CDFF00` with rotation animation |
| Sync indicator (error) | Color | `#F59E0B` (warning amber) |
| Sign-in prompt background | Color | `#1A1A1A` |
| Sign-in button | Background | `#CDFF00`, text `#0A0A0A` |
| Sync text | Font | 12px `#A0A0A0` |

---

## 7. Technical Spec

### Sync Architecture

```typescript
// /src/lib/sync.ts
interface SyncPayload {
  exercises: Exercise[];
  programs: Program[];
  trainingDays: TrainingDay[];
  workoutLogs: WorkoutLog[];
  personalRecords: PersonalRecord[];
  achievements: Achievement[];
  userSettings: UserSettings;
}

async function pushToCloud(): Promise<void> {
  // 1. Read all local data from IndexedDB
  // 2. POST to /api/sync with full payload
  // 3. Server upserts into Neon PostgreSQL
}

async function pullFromCloud(): Promise<void> {
  // 1. GET from /api/sync
  // 2. Merge remote data into local IndexedDB
  // 3. Last-write-wins for conflicts
}
```

### Key Files

| File | Purpose |
|------|---------|
| `/src/lib/sync.ts` | `pushToCloud()` and `pullFromCloud()` functions |
| `/src/components/sync/auto-sync-provider.tsx` | Auto-syncs every 5 minutes when signed in |
| `/src/app/api/sync/route.ts` | API endpoint using Neon PostgreSQL |

### Vercel Project Info

```json
{
  "projectId": "prj_QmkaNEuR6mO6PkBOR8RqsVofvOe8",
  "orgId": "team_PbFrIURH66uTANP37PPlyDnb",
  "projectName": "gym-tracker"
}
```

### DNS Configuration

| Record Type | Host | Value |
|-------------|------|-------|
| CNAME | `gym` | `cname.vercel-dns.com` |
| (Alternative) A | `gym` | `76.76.21.21` |

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] Clerk authentication configured
- [x] Neon PostgreSQL database provisioned
- [x] Sync API route created (`/api/sync`)
- [x] AutoSyncProvider component created
- [x] SyncIndicator component created
- [ ] Vercel dashboard access for domain configuration
- [ ] adu.dk DNS registrar access

### Build Order

**Phase 1: Sync (Complete)**
1. [x] Implement `pushToCloud()` in sync.ts
2. [x] Implement `pullFromCloud()` in sync.ts
3. [x] Create AutoSyncProvider with 5-minute interval
4. [x] Create SyncIndicator component
5. [x] Create sync API route

**Phase 2: Domain Configuration (Pending)**
6. [ ] Add gym.adu.dk in Vercel dashboard
7. [ ] Configure DNS CNAME at adu.dk registrar
8. [ ] Verify domain propagation
9. [ ] Test HTTPS access on gym.adu.dk

**Phase 3: Verification**
10. [ ] Test sync between mobile and desktop
11. [ ] Verify sync on tab focus
12. [ ] Verify sync indicator shows correct states

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User not signed in | Data stays local-only, no sync attempts, show sign-in prompt |
| Network offline during sync | Sync silently fails, retries on next interval or tab focus |
| Large data payload (100+ workouts) | Sync sends full payload, Neon handles upserts efficiently |
| Concurrent edits on two devices | Last-write-wins based on timestamp, acceptable for single-user app |
| Clerk session expires mid-sync | Sync fails gracefully, user re-authenticates on next interaction |
| DNS propagation delay | Domain may not resolve for up to 48 hours, Vercel URL still works |
| Date serialization mismatch | See `sync-date-serialization.md` for fix (convert strings to Date objects) |

---

## 10. Testing

### Functional Tests
- [ ] `pushToCloud()` sends all local data to Neon
- [ ] `pullFromCloud()` retrieves all remote data
- [ ] AutoSyncProvider triggers sync every 5 minutes
- [ ] AutoSyncProvider triggers sync on tab focus
- [ ] Sync does not run when user is not signed in
- [ ] New workout logged on device A appears on device B after sync
- [ ] gym.adu.dk resolves to the SetFlow app
- [ ] HTTPS certificate is valid on gym.adu.dk

### UI Verification
- [ ] SyncIndicator shows "Synced" with green checkmark after successful sync
- [ ] SyncIndicator shows "Syncing..." with animation during sync
- [ ] SyncIndicator shows error state on sync failure
- [ ] Sign-in prompt appears when user is not authenticated
- [ ] Sync works on iOS Safari PWA (installed to home screen)
- [ ] Sync works on desktop Chrome
- [ ] No UI blocking during background sync

---

## 11. Launch Checklist

- [ ] Sync works between mobile Safari and desktop Chrome
- [ ] SyncIndicator displays correct state
- [ ] gym.adu.dk domain resolves with valid HTTPS
- [ ] No sync errors in Vercel function logs
- [ ] Date serialization bug fixed (see sync-date-serialization.md)
- [ ] Works offline (graceful degradation when no network)
- [ ] Clerk authentication flow works on all target browsers

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Neon PostgreSQL downtime | Sync fails, data only local | Graceful error handling, data safe in IndexedDB |
| Clerk authentication issues | Users can't enable sync | Fallback to local-only mode, no data loss |
| DNS misconfiguration | gym.adu.dk doesn't resolve | Keep Vercel URL as backup, test DNS before announcing |
| Data conflicts from concurrent edits | Stale data overwrites newer data | Last-write-wins acceptable for single-user, future: vector clocks |
| Large sync payloads slow down | Degraded UX during sync | Sync runs in background, no UI blocking |
| Date serialization bug | Sync crashes on `toISOString` | Fixed in sync-date-serialization.md PRD |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Clerk authentication | Configured | Provides user identity for sync |
| Neon PostgreSQL | Provisioned | Cloud database for synced data |
| Vercel hosting | Active | Hosts both app and API routes |
| adu.dk DNS access | Available | Needed for domain configuration |
| sync-date-serialization fix | In Progress | Required for sync to work without crashes |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Initial PRD created |
| 2026-03-26 | PRD quality audit: added missing sections (success metrics, requirements, user flows, design wireframes, component table, visual spec, technical spec, implementation plan, edge cases, testing, launch checklist, risks & mitigations, dependencies, changelog), reformatted to 14-section standard |
| 2026-03-26 | SHIPPED: Conflict resolution UI (ConflictResolver component), sync settings page in Data tab (status, frequency selector, Sync Now, device info). |
