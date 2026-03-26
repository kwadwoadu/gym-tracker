# Recovery Check-in Always on Home

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-16
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

The `RecoveryAssessment` component ("How are you feeling?" with a 5-emoji scale) currently lives only inside `RestDayDashboard` (`src/components/home/RestDayDashboard.tsx`, line 100). On training days (morning, pre-workout, post-workout states), it is completely inaccessible.

This creates two issues:

1. **Recovery data gap on training days** - Users can only self-assess on rest days, but recovery status is arguably more important on training days when they need to decide workout intensity.
2. **Race condition on first load** - On first page load, `selectedDay` is `null` (line 39 of `page.tsx`), so the dashboard state machine briefly thinks it's a rest day and flashes `RestDayDashboard` (with the assessment). After `useEffect` sets `selectedDay`, it switches to the correct training day dashboard. On subsequent navigations this doesn't happen because React Query cache returns data instantly.

### Data Persistence (Already Working)

The assessment IS saved to IndexedDB (`db.recoveryAssessments` table, keyed by date). Selections persist and pre-populate if the component loads again the same day. No changes needed to the data layer.

---

## 2. Solution

Move `RecoveryAssessment` out of `RestDayDashboard` and into the main home page (`page.tsx`) so it renders on ALL dashboard states. Also fix the `selectedDay` race condition.

### Changes

| File | Change |
|------|--------|
| `src/app/page.tsx` | Import `RecoveryAssessment`, render it after `WhoopRecoveryCard` and before the context-aware dashboard section. Fix race condition: guard rest-day rendering with `selectedDay !== null` when `sortedDays.length > 0`. |
| `src/components/home/RestDayDashboard.tsx` | Remove `<RecoveryAssessment />` (line 100) and its import (line 10) to avoid duplicate rendering. |

### Implementation Details

**page.tsx - Add RecoveryAssessment:**
```tsx
// After WhoopRecoveryCard block (~line 259), add:
<div className="px-4 mt-3">
  <RecoveryAssessment />
</div>
```

**page.tsx - Fix race condition (line 288):**
```tsx
// Change from:
{dashboardCtx.state === "rest-day" && (
// To:
{dashboardCtx.state === "rest-day" && (sortedDays.length === 0 || selectedDay !== null) && (
```

This prevents the rest-day dashboard from flashing during the initial load when `selectedDay` is still `null` but `sortedDays` hasn't been set yet.

**RestDayDashboard.tsx - Remove duplicate:**
- Delete line 10: `import { RecoveryAssessment } from "@/components/rest-day/RecoveryAssessment";`
- Delete line 100: `<RecoveryAssessment />`

---

## 3. Success Metrics

| Metric | Target |
|--------|--------|
| Recovery check-in visible on all dashboard states | 100% |
| No flash of RestDayDashboard on first load | 0 occurrences |
| Emoji selection persists after navigating away and back | Works same-day |

---

## 4. Implementation Checklist

- [ ] Add `RecoveryAssessment` import to `page.tsx`
- [ ] Insert `<RecoveryAssessment />` after WhoopRecoveryCard, wrapped in `<div className="px-4 mt-3">`
- [ ] Remove `<RecoveryAssessment />` from `RestDayDashboard.tsx` (line 100)
- [ ] Remove the import from `RestDayDashboard.tsx` (line 10)
- [ ] Add race condition guard to rest-day rendering (line 288)
- [ ] Verify assessment appears on morning dashboard
- [ ] Verify assessment appears on pre-workout dashboard
- [ ] Verify assessment appears on post-workout dashboard
- [ ] Verify assessment still appears on rest day dashboard
- [ ] Verify no flash of RestDayDashboard on cold load
- [ ] Verify emoji selection persists after navigation

---

## 5. Launch Criteria

- [ ] RecoveryAssessment visible on Home regardless of dashboard state
- [ ] No duplicate RecoveryAssessment on rest days
- [ ] No RestDayDashboard flash on first page load
- [ ] Works offline (IndexedDB persistence unchanged)
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Visual clutter on training day dashboards | RecoveryAssessment is compact (single row of emojis), fits naturally between Whoop card and dashboard |
| Breaking RestDayDashboard layout | Only removing one component, rest of layout unchanged |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-16 | Initial PRD created |
| 2026-03-26 | Status updated to SHIPPED |

*Created: 2026-03-16*
