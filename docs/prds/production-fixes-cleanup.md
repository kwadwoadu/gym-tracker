# PRD: Production Fixes & Code Cleanup

> **Status:** Complete
> **Owner:** Kwadwo
> **Created:** 2026-01-13
> **Roadmap Phase:** Maintenance

---

## 1. Problem

**What problem are we solving?**

The SetFlow app has two categories of issues:

1. **Critical Bug**: Program archiving fails in production with "Failed to archive" error
   - Root cause: Production database schema is not synced (missing `archivedAt` column)
   - `prisma db push` was run locally but not against production Neon database

2. **Code Quality**: Build warnings and maintainability issues
   - 15+ ESLint warnings in Vercel build output
   - Excessive console.log statements (100+ across codebase)
   - Unused variables and imports
   - Large files that should be refactored

**Who has this problem?**
- Users trying to archive programs (critical)
- Developers maintaining the codebase (quality)

**What happens if we don't solve it?**
- Archive feature is completely broken in production
- Build warnings accumulate and mask real issues
- Codebase becomes harder to maintain

---

## 2. Solution

1. Sync production database schema to add missing columns
2. Fix ESLint warnings from Vercel build
3. Remove excessive console.log statements from production code
4. Clean up unused variables and imports

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Archive functionality works | 100% | Test archive/restore on production |
| ESLint warnings | 0 | Vercel build output |
| Console.log in API routes | 0 | Code search |
| Build completes cleanly | Yes | No warnings in output |

---

## 4. Requirements

### Must Have
- [x] Production database schema synced (archivedAt column exists)
- [x] Archive program works in production
- [x] Restore program works in production
- [x] ESLint warnings fixed (0 warnings)

### Should Have
- [ ] Remove console.log from API routes
- [x] Remove unused variables flagged by ESLint
- [x] Clean build output

### Won't Have (this version)
- Large file refactoring (workout page, set-logger)
- Animation variants extraction
- Error boundary additions
- Dialog boilerplate extraction

---

## 5. User Flow

**Archive Flow (After Fix)**:
1. User navigates to /programs
2. User clicks "Archive" on a program
3. Confirmation modal appears
4. User confirms
5. Program moves to "Archived" section
6. Success toast shown

---

## 6. Design

No UI changes required. This is a backend/code quality fix.

---

## 7. Technical Spec

### Schema Changes

Already in schema.prisma, needs to be pushed to production:

```prisma
model Program {
  archivedAt  DateTime?  // NEW - needs sync
  @@index([archivedAt])  // NEW - needs sync
}

model WorkoutLog {
  programId   String?    // CHANGED - nullable
  programName String?    // NEW - needs sync
}
```

### Database Sync

```bash
# Run against production DATABASE_URL
npx prisma db push
```

### ESLint Warnings to Fix

From Vercel build output:

| File | Line | Warning |
|------|------|---------|
| `src/app/global-error.tsx` | 7 | 'error' defined but never used |
| `src/app/nutrition/log/page.tsx` | 40 | 'slots' in useCallback deps |
| `src/app/page.tsx` | 35 | 'daysLoading' never used |
| `src/app/page.tsx` | 36 | 'exercisesLoading' never used |
| `src/app/workout/[dayId]/page.tsx` | 41 | 'WorkoutLog' never used |
| `src/app/workout/[dayId]/page.tsx` | 210 | 'achievementToasts' never used |
| `src/components/gamification/achievement-gallery.tsx` | 10 | 'cn' never used |
| `src/components/gamification/achievement-gallery.tsx` | 12 | 'ACHIEVEMENTS' never used |
| `src/components/onboarding/onboarding-carousel.tsx` | 28 | 'canScrollNext' never used |
| `src/components/stats/recent-workouts.tsx` | 5 | 'Badge' never used |
| `src/components/workout/exercise-card.tsx` | 157 | Use next/image instead of img |
| `src/components/workout/set-logger.tsx` | 355 | Use next/image instead of img |
| `src/lib/gamification.ts` | 196 | 'currentValue' never used |
| `src/lib/workout-helpers.ts` | 6 | 'PersonalRecord' never used |

### Files to Modify

| File | Change |
|------|--------|
| Production Database | Sync schema with prisma db push |
| `src/app/global-error.tsx` | Prefix unused 'error' with underscore |
| `src/app/nutrition/log/page.tsx` | Wrap 'slots' in useMemo |
| `src/app/page.tsx` | Remove unused loading variables |
| `src/app/workout/[dayId]/page.tsx` | Remove unused imports/variables |
| `src/components/gamification/achievement-gallery.tsx` | Remove unused imports |
| `src/components/onboarding/onboarding-carousel.tsx` | Remove unused variable |
| `src/components/stats/recent-workouts.tsx` | Remove unused Badge import |
| `src/lib/gamification.ts` | Remove unused variable |
| `src/lib/workout-helpers.ts` | Remove unused import |

---

## 8. Implementation Plan

### Dependencies
- [x] Access to production DATABASE_URL

### Build Order

1. [x] **Sync production database schema**
   - Get DATABASE_URL from Vercel env vars
   - Run `npx prisma db push` with production URL
   - Verify columns exist in Neon dashboard

2. [x] **Test archive functionality**
   - Go to production /programs page
   - Archive a program
   - Verify success
   - Test restore

3. [x] **Fix ESLint warnings - unused variables**
   - `src/app/global-error.tsx` - prefix error with _
   - `src/app/page.tsx` - remove daysLoading, exercisesLoading
   - `src/app/workout/[dayId]/page.tsx` - remove WorkoutLog, achievementToasts
   - `src/components/gamification/achievement-gallery.tsx` - remove cn, ACHIEVEMENTS
   - `src/components/onboarding/onboarding-carousel.tsx` - remove canScrollNext
   - `src/components/stats/recent-workouts.tsx` - remove Badge
   - `src/lib/gamification.ts` - remove currentValue
   - `src/lib/workout-helpers.ts` - remove PersonalRecord

4. [x] **Fix ESLint warnings - React hooks**
   - `src/app/nutrition/log/page.tsx` - wrap slots in useMemo

5. [x] **Commit and deploy**
   - Commit with message "fix: Sync production DB and fix ESLint warnings"
   - Deploy to Vercel
   - Verify 0 warnings in build output

### Risks

| Risk | Mitigation |
|------|------------|
| prisma db push fails | Check Neon dashboard for schema state first |
| Data loss on schema sync | archivedAt is additive, no data loss expected |
| Breaking changes | All changes are removals of unused code |

---

## 9. Testing

- [x] Archive program works on production
- [x] Restore program works on production
- [x] Clone program works on production
- [x] Delete permanent works on production
- [x] Vercel build has 0 ESLint warnings
- [x] No console errors in browser

---

## 10. Launch Checklist

- [x] Production database schema synced
- [x] Archive tested on production
- [x] ESLint warnings fixed
- [x] Code committed
- [x] Deployed to Vercel
- [x] Build output clean
- [x] Changelog updated

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-13 | Initial draft - database sync + ESLint fixes |
| 2026-01-14 | Complete - All items fixed and deployed to production |
