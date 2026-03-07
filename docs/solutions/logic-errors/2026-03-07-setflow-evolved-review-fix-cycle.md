---
title: "SetFlow Evolved UI overhaul - 14 review findings resolved"
category: logic-errors
date: 2026-03-07
severity: P1
tags: [security-hardening, architecture-cleanup, performance-optimization, type-safety, react-patterns, dead-code-removal]
related:
  - docs/solutions/logic-errors/2026-03-06-react-review-findings-batch-resolution.md
  - docs/solutions/security-issues/2026-03-06-workout-completion-silent-failure.md
project: setflow
---

# SetFlow Evolved UI overhaul - 14 review findings resolved

## Problem

157-file UI/UX overhaul (SetFlow Evolved Phase 0-2) introduced 14 issues across security, architecture, performance, type safety, and dead code. Found by 7-agent parallel review of commits c2cf8d6 and 29c184d (2,916 insertions, 1,613 deletions).

**Breakdown:** 3 P1 (critical), 11 P2 (major)

## Root Causes

1. **Security gaps** - No input validation on community profile API; avatarUrl accepted any protocol (XSS vector)
2. **Architecture decay** - Navigation routes duplicated in 2 files; 3 new routes undocumented
3. **Implementation shortcuts** - Custom tabs instead of shadcn; unsafe type assertions; friendsOnly toggle with no backend; missing error states
4. **Performance** - useMemo with broad object dependency; stats array recreated every render
5. **Dead code** - Unused EvolvedCard wrapper component; unused CARD design token export

## Solution

All 14 findings resolved in a single parallel resolution pass. Same-file findings (community/page.tsx x3, profile/route.ts x2) ran sequentially; all others in parallel.

## Key Changes

### P1 - Critical

**REV-001: XSS via avatarUrl** (`src/app/api/community/profile/route.ts`)
- Added `validateAvatarUrl()` - rejects non-http/https protocols
- Added `validateProfileFields()` - displayName max 50, bio max 500, handle regex

**REV-002: Duplicated navigation routes** (`src/config/navigation.ts` - NEW)
- Created single source of truth for More menu routes
- Exports `MORE_ROUTES` and derived `MORE_ROUTE_PATHS`
- Both `more-sheet.tsx` and `bottom-tab-bar.tsx` now import from config

**REV-003: Undocumented routes** (`src/app/CLAUDE.md`)
- Added /gamification, /community, /nutrition to Route Structure

### P2 - Major

**REV-004:** Passed `user?.id` to LeaderboardList via `useUser` hook
**REV-005:** Removed non-functional friendsOnly toggle (no backend support)
**REV-006:** Replaced custom button tabs with shadcn Tabs/TabsList/TabsTrigger/TabsContent
**REV-007:** Added runtime type guards before accessing `item.data` properties
**REV-008:** Added API input validation (length, format, enum, date range) for challenges endpoint
**REV-009:** Same validation pattern applied to community challenges route
**REV-010:** Narrowed useMemo dependency from `[user]` to `[user?.firstName, user?.emailAddresses]`
**REV-011:** Wrapped QuickStatsGrid stats array in useMemo
**REV-012:** Deleted unused EvolvedCard component (zero callsites confirmed)
**REV-013:** Removed unused CARD export from design-tokens.ts
**REV-014:** Added error destructuring and combined error state to gamification page

## Prevention

1. **CLAUDE.md rules**: Always validate URL protocols at API boundaries; always use shadcn components over custom implementations
2. **Linting**: ESLint rule for `as` type assertions without preceding type guard
3. **Tests**: Integration tests for community profile API validation; component tests for Tabs
4. **CI**: grep for `as {` without adjacent type guard in changed files
5. **Pattern**: Single source of truth for navigation - never duplicate route arrays

## Related

- `2026-03-06-react-review-findings-batch-resolution.md` - Same 7-agent review pattern, 7 React-specific findings
- `2026-03-06-workout-completion-silent-failure.md` - Auth hardening that preceded this overhaul
