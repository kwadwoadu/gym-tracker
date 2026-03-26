# Stats with Time Period Filtering

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

The stats page (`/stats`) shows all-time data only. It is one long scroll of components - `SummaryCards`, `WeightChart`, `PRList`, `WorkoutCalendar`, `RecentWorkouts`, `AchievementGallery`, `WeeklyMuscleHeatmap` - with no ability to filter by time period.

This creates several issues:
- **No short-term progress visibility**: A user who started 6 months ago cannot see whether they improved this month vs last month
- **Trend blindness**: All-time averages mask recent gains or declines. A user might be declining for 3 weeks but all-time stats look fine.
- **Information overload**: Every workout ever logged contributes to a single data set with no temporal context
- **No "wins" surfacing**: PRs and records are buried in a list rather than highlighted as achievements

Users need to see their progress over meaningful time windows to stay motivated and make training decisions.

---

## 2. Solution

### Period Selector
Add a sticky period selector at the top of the stats page with tabs: **Week | Month | 3M | Year | All**. All stats components below re-filter based on the selected period.

### Wins Section
Add a "Wins" section at the top of the stats content (below period selector) that highlights:
- New PRs set in the selected period
- Records broken (most volume in a session, longest streak, etc.)
- Milestone achievements unlocked

### Trend Arrows
Add directional trend arrows to every numeric metric:
- Green up arrow: metric improved vs previous period
- Red down arrow: metric declined vs previous period
- Gray horizontal arrow: metric stayed flat (within 5% variance)

### Body Silhouette Heatmap
Promote the existing `WeeklyMuscleHeatmap` to be the primary stats visualization. Expand it to:
- Show muscle volume for the selected period (not just this week)
- Color intensity scales with volume relative to the period
- Tappable muscles showing exercise breakdown

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Stats page engagement | 30% increase in stats page visits | Analytics page views |
| Period selector usage | 60% of stats visitors change period at least once | Track tab change events |
| Wins section interaction | 40% of users tap a highlighted PR/win | Tap tracking |
| Time on stats page | 20% increase in average session duration | Analytics |
| Return rate | Users visit stats 2x per week (up from 1x) | Weekly visit frequency |

---

## 4. Requirements

### Must Have
- [ ] Period selector: Week, Month, 3M, Year, All
- [ ] All stats components filter by selected period
- [ ] Wins section highlighting PRs in selected period
- [ ] Trend arrows on SummaryCards metrics
- [ ] Period-aware muscle heatmap (not just current week)
- [ ] Sticky period selector (visible while scrolling)

### Should Have
- [ ] Comparison badge: "vs previous [period]" on each metric
- [ ] Empty state for periods with no data
- [ ] Animated number transitions when switching periods
- [ ] Body silhouette heatmap as primary visualization
- [ ] Exercise-level drill-down from muscle regions on heatmap
- [ ] Export stats for selected period

### Won't Have (this version)
- Custom date range picker
- Comparison mode (side-by-side two periods)
- Goal setting per period
- Social sharing of stats
- AI-generated insights ("You're 15% stronger this month")

---

## 5. User Flow

### Flow 1: Check Monthly Progress
1. User navigates to Stats page
2. Default view: "Month" period selected
3. Wins section at top: "2 new PRs this month"
4. Summary cards show monthly totals with trend arrows
5. Total Volume: 45,200kg (up 8% arrow)
6. Workouts: 12 (down 2 arrow)
7. Avg RPE: 7.5 (flat arrow)
8. User scrolls to muscle heatmap showing monthly volume distribution
9. Taps "Chest" region on heatmap
10. Drill-down shows: Bench Press 4x, Incline DB 4x, Cable Fly 3x

### Flow 2: Check This Week
1. User taps "Week" in period selector
2. Stats instantly update to this week's data
3. Wins: "PR: Squat 100kg x 8 (Tuesday)"
4. Summary: 2 workouts, 8,400kg volume
5. Muscle heatmap shows only 2 muscle groups trained
6. Trend: volume up 12% vs last week

### Flow 3: All-Time View
1. User taps "All" in period selector
2. Full history loaded
3. Weight chart shows long-term progression curve
4. PR list shows all-time records
5. Workout calendar shows full training history
6. Muscle heatmap shows cumulative volume distribution

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `PeriodSelector` | Sticky tab bar: Week/Month/3M/Year/All |
| `WinsSection` | Highlighted PRs and records for period |
| `TrendArrow` | Directional indicator with percentage |
| `PeriodMuscleHeatmap` | Period-filtered body silhouette |
| `MuscleDrillDown` | Exercise breakdown for tapped muscle |
| `EmptyPeriodState` | Friendly message when no data exists for period |

### Visual Design

**Period Selector**:
- Sticky at top below back button
- Full-width tab bar matching existing TabsList style
- Active tab: `#CDFF00` background, dark text
- Inactive: transparent background, muted text
- Height: 40px

**Wins Section**:
- Background: subtle gradient `#1A1A1A` to `#111111`
- PR items: trophy icon + exercise name + weight/reps + date
- Max 3 wins displayed, "See all" link if more

**Trend Arrows**:
- Up: `#00D4AA` green, rotate-[-45deg]
- Down: `#FF4444` red, rotate-[45deg]
- Flat: `#666666` gray, horizontal
- Size: 16px
- Placed next to metric value with percentage label

**Muscle Heatmap**:
- Full-width card, ~300px height
- Uses existing `WeeklyMuscleHeatmap` SVG
- Color scale:
  - Not trained: `#222222`
  - Low volume: `#3A5A00`
  - Medium: `#7AAA00`
  - High: `#CDFF00`
  - Maximum: `#EEFF88`

### Wireframe

```
+------------------------------------------+
| [<] Stats                                |
+------------------------------------------+
| [Week] [Month] [3M] [Year] [All]        |
+------------------------------------------+
| WINS THIS MONTH                          |
| +--------------------------------------+ |
| | [trophy] Bench Press PR              | |
| |          85kg x 10 - Mar 1           | |
| |                                      | |
| | [trophy] Squat PR                    | |
| |          100kg x 8 - Feb 28          | |
| +--------------------------------------+ |
+------------------------------------------+
|  Workouts    Volume      Avg RPE         |
|  12          45,200kg    7.5             |
|  [v -2]      [^ +8%]     [- flat]       |
+------------------------------------------+
| MUSCLE VOLUME                            |
| +--------------------------------------+ |
| |   [FRONT]        [BACK]              | |
| |    ####           ##                 | |
| |   ######         ####               | |
| |    ####           ####              | |
| |     ##             ##               | |
| |    #  #           #  #              | |
| |                                      | |
| |  Tap a muscle for exercise breakdown | |
| +--------------------------------------+ |
+------------------------------------------+
| WEIGHT PROGRESSION                       |
| +--------------------------------------+ |
| |  85kg  .                             | |
| |       . .   .                        | |
| |  80kg.     . . .                     | |
| |  75kg          . .                   | |
| |  ----+----+----+----+----           | |
| |  W1   W2   W3   W4                  | |
| +--------------------------------------+ |
+------------------------------------------+
| RECENT WORKOUTS                          |
| ...                                      |
+------------------------------------------+
```

---

## 7. Technical Spec

### Component Interfaces

```typescript
// /src/components/stats/PeriodSelector.tsx
export interface PeriodSelectorProps {
  activePeriod: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

// /src/components/stats/WinsSection.tsx
export interface WinsSectionProps {
  period: StatsPeriod;
  prs: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
  }>;
  records: Array<{
    type: 'volume' | 'streak' | 'workouts';
    label: string;
    value: string;
    date: string;
  }>;
}

// /src/components/stats/TrendArrow.tsx
export interface TrendArrowProps {
  direction: TrendDirection;
  percentage: number;
  label?: string; // e.g., "vs last month"
  size?: 'sm' | 'md'; // default 'md' (16px)
}

// /src/components/stats/MuscleDrillDown.tsx
export interface MuscleDrillDownProps {
  muscleName: string;
  exercises: Array<{
    name: string;
    sessions: number;
    totalVolume: number;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

// /src/components/stats/EmptyPeriodState.tsx
export interface EmptyPeriodStateProps {
  period: StatsPeriod;
  suggestion: string; // e.g., "Complete a workout this week to see stats"
}
```

### Period Calculation

```typescript
// /src/lib/period-filter.ts
export type StatsPeriod = 'week' | 'month' | '3m' | 'year' | 'all';

export function getPeriodDateRange(period: StatsPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case '3m':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020); // Effectively no filter
      break;
  }

  return { start, end };
}

export function getPreviousPeriodRange(period: StatsPeriod): { start: Date; end: Date } {
  const current = getPeriodDateRange(period);
  const duration = current.end.getTime() - current.start.getTime();
  return {
    start: new Date(current.start.getTime() - duration),
    end: new Date(current.start.getTime()),
  };
}
```

### Trend Calculation

```typescript
// /src/lib/trend.ts
export type TrendDirection = 'up' | 'down' | 'flat';

export interface Trend {
  direction: TrendDirection;
  percentage: number;
  previousValue: number;
  currentValue: number;
}

export function calculateTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    return { direction: current > 0 ? 'up' : 'flat', percentage: 100, previousValue: 0, currentValue: current };
  }

  const percentage = Math.round(((current - previous) / previous) * 100);
  const direction: TrendDirection =
    Math.abs(percentage) <= 5 ? 'flat' :
    percentage > 0 ? 'up' : 'down';

  return { direction, percentage: Math.abs(percentage), previousValue: previous, currentValue: current };
}
```

### Period-Aware Queries

```typescript
// Updates to /src/lib/queries.ts
export function useFilteredWorkoutLogs(period: StatsPeriod) {
  const { start, end } = getPeriodDateRange(period);
  return useWorkoutLogs({
    isComplete: true,
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
  });
}

export function useFilteredStats(period: StatsPeriod) {
  const { start, end } = getPeriodDateRange(period);
  return useQuery({
    queryKey: ['stats', period],
    queryFn: () => statsApi.getFiltered({ dateFrom: start.toISOString(), dateTo: end.toISOString() }),
  });
}

export function useFilteredMuscleVolume(period: StatsPeriod) {
  const { start, end } = getPeriodDateRange(period);
  return useQuery({
    queryKey: ['muscle-volume', period],
    queryFn: () => statsApi.getMuscleVolume({ dateFrom: start.toISOString(), dateTo: end.toISOString() }),
  });
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/period-filter.ts` | Period date range calculation utilities |
| `src/lib/trend.ts` | Trend direction and percentage calculation |
| `src/components/stats/PeriodSelector.tsx` | Sticky period tab bar |
| `src/components/stats/WinsSection.tsx` | PR and record highlights |
| `src/components/stats/TrendArrow.tsx` | Directional trend indicator |
| `src/components/stats/MuscleDrillDown.tsx` | Exercise breakdown for tapped muscle |
| `src/components/stats/EmptyPeriodState.tsx` | No data message for period |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/stats/page.tsx` | Add PeriodSelector, pass period to all components, add WinsSection |
| `src/components/stats/summary-cards.tsx` | Accept period prop, add TrendArrow |
| `src/components/stats/weight-chart.tsx` | Filter data by period |
| `src/components/stats/pr-list.tsx` | Filter PRs by period |
| `src/components/stats/recent-workouts.tsx` | Filter logs by period |
| `src/components/stats/workout-calendar.tsx` | Highlight period range on calendar |
| `src/components/stats/WeeklyMuscleHeatmap.tsx` | Accept period prop, rename to PeriodMuscleHeatmap |
| `src/lib/queries.ts` | Add period-filtered query hooks |
| `src/lib/api-client.ts` | Add date filter params to stats API |
| `src/app/api/stats/route.ts` | Support date range query params |

---

## 8. Implementation Plan

### Dependencies
- [ ] Stats API must support date range filtering (backend change)
- [ ] Muscle volume API must support date range filtering
- [ ] Existing PR list query must support date filtering

### Build Order

1. [ ] **Create `period-filter.ts`** - Date range utilities
2. [ ] **Create `trend.ts`** - Trend calculation utilities
3. [ ] **Update stats API** - Add dateFrom/dateTo query params to `/api/stats`
4. [ ] **Update queries.ts** - Add period-filtered hooks
5. [ ] **Create `PeriodSelector`** - Sticky tab bar component
6. [ ] **Create `TrendArrow`** - Directional indicator component
7. [ ] **Update `summary-cards.tsx`** - Add trend arrows, accept period
8. [ ] **Create `WinsSection`** - PR highlight component
9. [ ] **Update `WeeklyMuscleHeatmap`** - Period-aware filtering
10. [ ] **Create `MuscleDrillDown`** - Tap-to-explore muscle detail
11. [ ] **Update remaining stats components** - Period filtering for chart, PRs, calendar, recent
12. [ ] **Create `EmptyPeriodState`** - No data handling
13. [ ] **Wire everything in `stats/page.tsx`** - State management for period
14. [ ] **Testing** - All periods, empty states, trend accuracy

### Agents to Consult
- **Frontend Specialist** - Animated number transitions, chart filtering
- **Database Specialist** - Query optimization for date-range aggregations

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| New user with 0 workouts | Show "All" period with "Start your first workout" message and illustration |
| Period with 1 workout only | Show stats normally, trend arrow shows "Not enough data" tooltip |
| PR set in previous period | Only shows in the period it was set, "All" shows all PRs |
| Week period starts on Sunday vs Monday | Use locale-aware week start (Monday for EU, Sunday for US) via `Intl.Locale` |
| Workout spanning midnight | Count toward the day the workout started based on `WorkoutLog.date` |
| 3-month period crossing year boundary | Date math handles correctly (Oct-Dec into Jan) via native `Date` methods |
| API returns partial data (timeout) | Show cached data with "Last updated X ago" indicator |
| Rapid period switching | Debounce period changes by 200ms, cancel in-flight Dexie queries with AbortController |
| Muscle region with zero volume for period | Show region in `#222222` (not trained), not tappable |
| Trend calculation with previous period having zero | Show "up" arrow with "New" label instead of percentage |
| Very large dataset (1000+ workout logs) | Client-side filtering via Dexie indexed queries on `date` field, paginate if >500ms |
| User changes weight unit (kg to lbs) during period view | Recalculate all volume stats in current unit, trends compare same-unit values |

---

## 10. Testing

### Functional Tests
- [ ] Period selector switches between all 5 periods
- [ ] Summary cards update values for each period
- [ ] Trend arrows show correct direction and percentage
- [ ] Wins section shows PRs only from selected period
- [ ] Muscle heatmap filters volume by period
- [ ] Muscle tap opens drill-down with correct exercises
- [ ] Weight chart shows data only within period range
- [ ] PR list filters by period
- [ ] Recent workouts filter by period
- [ ] Calendar highlights active period range
- [ ] "All" period shows complete history (matches current behavior)
- [ ] Empty period shows friendly message with suggestion
- [ ] Switching periods quickly does not cause race conditions
- [ ] Period state persists across page navigations within session

### UI Verification
- [ ] Period selector stays sticky while scrolling
- [ ] Trend arrows color-coded correctly (green up, red down, gray flat)
- [ ] Wins section animations play smoothly
- [ ] Number transitions animate when switching periods
- [ ] All components render correctly on iPhone SE
- [ ] Dark theme colors correct
- [ ] Works offline (cached data)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome

---

## 11. Launch Checklist

- [ ] Code complete
- [ ] API changes deployed (date range filtering)
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API performance with date range queries | Slow stats page load | Index workout_logs on (userId, date), cache period aggregations |
| Trend arrows misleading with small sample | User makes wrong training decisions | Require minimum 3 data points for trend, otherwise show "Insufficient data" |
| Muscle heatmap recalculation expensive | Lag when switching periods | Client-side filtering from cached workout logs |
| Period selector adds complexity | Steeper learning curve | Default to "Month" (most useful), remember last selection |
| Existing components break with new props | Regression | Backward-compatible props with defaults |
| Recharts re-renders on every period switch | Chart flicker, poor UX | Memoize chart data with `useMemo`, use Recharts `isAnimationActive` prop |

---

## 13. Dependencies

- Backend API changes for date-range filtering (must deploy before frontend)
- Existing `WeeklyMuscleHeatmap` component as foundation for period heatmap
- `muscle-visualization.md` PRD's muscle data model for drill-down

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: renumbered all 14 sections to standard order, expanded edge cases (8 to 12), added component interfaces, added Recharts re-render risk, added heatmap color scale hex codes |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
