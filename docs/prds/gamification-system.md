# PRD: SetFlow Webapp Gamification System

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-02-05
> **Project:** gym-tracker (SetFlow Webapp)
> **Roadmap Phase:** Feature Parity with Native

---

## 1. Problem

SetFlow Native has a comprehensive XP/Gamification system that drives user engagement through:
- XP rewards for workouts, PRs, and challenges
- Level progression with tiers (Novice to Legend)
- Daily and weekly challenges (3 each, seeded by date)
- Streak multipliers (up to 2.5x XP at 60+ days)

The webapp lacks this system, creating a feature gap that reduces engagement for web users. Users on the native app get rewarded for their efforts; web users don't.

**Who has this problem?** All SetFlow webapp users miss out on gamification-driven motivation.

**What happens if we don't solve it?** Lower engagement, feature disparity between platforms, users may prefer native over web.

---

## 2. Solution

Port the complete XP/Gamification system from SetFlow Native to the SetFlow Webapp:

1. **XP System**: Award XP for workouts (100), PRs (50), all sets complete (25), protein goal (20), supplements (15)
2. **Level System**: 6 tiers (Novice, Regular, Dedicated, Committed, Elite, Legend) with exponential XP curve
3. **Challenges**: 3 daily + 3 weekly challenges, seeded by date for consistency
4. **Streak Multipliers**: XP bonuses for maintaining workout streaks (7+ days = 1.2x, up to 2.5x at 60+ days)
5. **Milestone Celebrations**: Modal celebrations for level ups and streak achievements

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Feature parity | 100% XP features from native | Feature checklist |
| Engagement | +15% workouts/user | Compare before/after |
| Challenge completion | >50% daily challenges | Database query |
| XP accumulation | 500+ XP/week for active users | User XP tracking |

---

## 4. Requirements

### Must Have
- [ ] XP tracking per user (stored server-side in Prisma)
- [ ] Level calculation with tier display (Novice to Legend)
- [ ] Daily challenges (3 per day, seeded by date)
- [ ] Weekly challenges (3 per week, seeded by week)
- [ ] Streak multiplier applied to XP rewards
- [ ] XPBar component in home page header
- [ ] DailyChallengeCard component showing progress
- [ ] MilestoneModal for level up celebrations
- [ ] XP awarded on workout completion
- [ ] Challenge progress auto-updated from workout data

### Should Have
- [ ] XP history view (last 100 entries)
- [ ] Weekly challenge cards with days remaining
- [ ] Animated XP gain notifications
- [ ] Level progress in user profile

### Won't Have (this version)
- Leaderboards (requires more backend work)
- Custom challenges (admin feature)
- XP shop/rewards (future consideration)

---

## 5. User Flow

1. User completes a workout
2. System calculates XP: base (100) x streak multiplier
3. XP added to user's total, history recorded
4. Challenge progress updated based on workout stats
5. If challenge complete, award bonus XP
6. If level up, show MilestoneModal celebration
7. Home page XPBar reflects new level/progress

---

## 6. Design

### UI Components (Port from Native)

| Component | Description | Native Source |
|-----------|-------------|---------------|
| XPBar | Horizontal progress bar with level, XP count, glow effect | `setflow-native/src/components/gamification/XPBar.tsx` |
| LevelBadge | Tier icon with color, level number | `setflow-native/src/components/gamification/LevelBadge.tsx` |
| DailyChallengeCard | Challenge icon, title, progress bar, XP reward | `setflow-native/src/components/gamification/DailyChallengeCard.tsx` |
| WeeklyChallengeCard | Same as daily + days remaining counter | Native pattern |
| MilestoneModal | Confetti animation, level up message | `setflow-native/src/components/gamification/MilestoneModal.tsx` |

### Design Tokens (Match Native)
- Primary: `#CDFF00` (lime accent for XP bar fill)
- Level colors: Gray (Novice), Green (Regular), Blue (Dedicated), Purple (Committed), Orange (Elite), Lime (Legend)

### Placement
- **XPBar**: Below streak tracker on home page
- **Challenges Section**: New section on home page below day tabs
- **MilestoneModal**: Triggered after workout completion or level up

---

## 7. Technical Spec

### Schema Changes (Prisma)

```prisma
// Add to schema.prisma

model UserGamification {
  id              String   @id @default(cuid())
  userId          String   @unique
  totalXP         Int      @default(0)
  lastLevelUp     Int      @default(1)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  xpHistory       XPHistoryEntry[]
  dailyProgress   DailyChallengeProgress[]
  weeklyProgress  WeeklyChallengeProgress[]

  @@index([userId])
}

model XPHistoryEntry {
  id              String   @id @default(cuid())
  amount          Int
  source          String   // "workout", "pr", "challenge:daily-workout", etc.
  multiplier      Float    @default(1.0)
  timestamp       DateTime @default(now())

  gamificationId  String
  gamification    UserGamification @relation(fields: [gamificationId], references: [id], onDelete: Cascade)

  @@index([gamificationId])
  @@index([timestamp])
}

model DailyChallengeProgress {
  id              String   @id @default(cuid())
  challengeId     String   // "daily-workout", "daily-100-reps", etc.
  date            String   // YYYY-MM-DD
  progress        Int      @default(0)
  isComplete      Boolean  @default(false)

  gamificationId  String
  gamification    UserGamification @relation(fields: [gamificationId], references: [id], onDelete: Cascade)

  @@unique([gamificationId, challengeId, date])
  @@index([gamificationId])
  @@index([date])
}

model WeeklyChallengeProgress {
  id              String   @id @default(cuid())
  challengeId     String
  weekId          String   // YYYY-MM-DD of Monday
  progress        Int      @default(0)
  isComplete      Boolean  @default(false)

  gamificationId  String
  gamification    UserGamification @relation(fields: [gamificationId], references: [id], onDelete: Cascade)

  @@unique([gamificationId, challengeId, weekId])
  @@index([gamificationId])
  @@index([weekId])
}

// Update User model to add relation
model User {
  // ... existing fields
  gamification    UserGamification?
}
```

### API Routes

| Route | Method | Input | Output |
|-------|--------|-------|--------|
| `/api/gamification` | GET | - | `{ totalXP, level, tier, challenges }` |
| `/api/gamification/xp` | POST | `{ amount, source }` | `{ newTotal, levelUp? }` |
| `/api/gamification/challenges` | GET | - | `{ daily: [], weekly: [] }` |
| `/api/gamification/challenges/complete` | POST | `{ challengeId }` | `{ xpAwarded }` |

### React Query Hooks

```typescript
// src/lib/queries.ts - add to existing

export function useGamification() {
  return useQuery({
    queryKey: ['gamification'],
    queryFn: () => gamificationApi.get(),
  });
}

export function useDailyChallenges() {
  return useQuery({
    queryKey: ['challenges', 'daily', getTodayDate()],
    queryFn: () => gamificationApi.getDailyChallenges(),
  });
}

export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ['challenges', 'weekly', getWeekId()],
    queryFn: () => gamificationApi.getWeeklyChallenges(),
  });
}
```

### Files to Create

| File | Description |
|------|-------------|
| `src/data/daily-challenges.ts` | Port from native (16 challenge pool) |
| `src/data/weekly-challenges.ts` | Port from native (16 challenge pool) |
| `src/lib/gamification.ts` | XP calculation, level logic, multipliers |
| `src/lib/gamification-api.ts` | API client for gamification endpoints |
| `src/components/gamification/XPBar.tsx` | Progress bar component |
| `src/components/gamification/LevelBadge.tsx` | Level tier badge |
| `src/components/gamification/DailyChallengeCard.tsx` | Daily challenge card |
| `src/components/gamification/WeeklyChallengeCard.tsx` | Weekly challenge card |
| `src/components/gamification/MilestoneModal.tsx` | Level up celebration |
| `src/app/api/gamification/route.ts` | Main gamification API |
| `src/app/api/gamification/xp/route.ts` | XP award endpoint |
| `src/app/api/gamification/challenges/route.ts` | Challenges endpoint |

### Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add gamification models |
| `src/app/page.tsx` | Add XPBar and challenges section |
| `src/app/workout/[dayId]/page.tsx` | Award XP on workout complete |
| `src/lib/queries.ts` | Add gamification hooks |

### Reference Files (Native Source)

| Native File | Web Destination |
|-------------|-----------------|
| `setflow-native/src/stores/gamification.ts` | Logic to `src/lib/gamification.ts` |
| `setflow-native/src/data/daily-challenges.ts` | Copy to `src/data/daily-challenges.ts` |
| `setflow-native/src/data/weekly-challenges.ts` | Copy to `src/data/weekly-challenges.ts` |
| `setflow-native/src/components/gamification/*` | Adapt to web components |

---

## 8. Implementation Plan

### Dependencies
- [x] Prisma schema already has User model
- [x] TanStack Query already configured
- [x] Achievement system exists (extend with XP)
- [ ] None blocking - can start immediately

### Build Order

**Week 1: Backend + Data**
1. [ ] Add gamification models to `prisma/schema.prisma`
2. [ ] Run `npx prisma migrate dev --name add-gamification`
3. [ ] Copy `daily-challenges.ts` from native (adapt types)
4. [ ] Copy `weekly-challenges.ts` from native (adapt types)
5. [ ] Create `src/lib/gamification.ts` with XP/level logic
6. [ ] Create API routes: `/api/gamification`, `/api/gamification/xp`, `/api/gamification/challenges`
7. [ ] Add gamification hooks to `src/lib/queries.ts`

**Week 2: Frontend Components**
8. [ ] Create `XPBar.tsx` component
9. [ ] Create `LevelBadge.tsx` component
10. [ ] Create `DailyChallengeCard.tsx` component
11. [ ] Create `WeeklyChallengeCard.tsx` component
12. [ ] Create `MilestoneModal.tsx` component
13. [ ] Update gamification index exports

**Week 3: Integration + Testing**
14. [ ] Add XPBar to home page (below streak tracker)
15. [ ] Add challenges section to home page
16. [ ] Award XP in workout completion flow
17. [ ] Auto-update challenge progress from workout stats
18. [ ] Add MilestoneModal trigger on level up
19. [ ] Test all flows end-to-end
20. [ ] Update CHANGELOG.md

### Agents to Consult
- **Database Specialist** - Prisma schema and migration
- **Frontend Specialist** - Component styling and animations
- **Software Engineer** - API routes and integration

### Risks

| Risk | Mitigation |
|------|------------|
| Schema migration fails | Test locally first, backup prod |
| XP calculation mismatch | Port exact logic from native |
| Challenge seeding differs | Use same hash function as native |
| Performance with large XP history | Limit to last 100 entries |

---

## 9. Testing

### Unit Tests
- [ ] XP calculation returns correct values
- [ ] Level calculation matches tier boundaries
- [ ] Streak multiplier applies correctly
- [ ] Challenge seeding is deterministic by date

### Integration Tests
- [ ] Workout completion awards XP
- [ ] XP persists across sessions
- [ ] Challenges refresh daily/weekly
- [ ] Level up triggers milestone modal

### Manual Testing
- [ ] Complete workout, verify XP awarded
- [ ] Check daily challenges rotate at midnight
- [ ] Check weekly challenges reset Monday
- [ ] Verify streak multiplier displays correctly
- [ ] Test level up celebration modal
- [ ] Verify offline works (IndexedDB cache)

---

## 10. Launch Checklist

- [ ] Prisma migration applied to production
- [ ] All API routes tested in staging
- [ ] Components render correctly on mobile/desktop
- [ ] XP persists correctly (no data loss)
- [ ] Challenges display correct for current date
- [ ] PR reviewed
- [ ] CHANGELOG.md updated
- [ ] Patterns extracted to `/docs/patterns/` if needed

---

## Appendix: Constants (Port from Native)

### XP Rewards
```typescript
export const XP_REWARDS = {
  WORKOUT_COMPLETE: 100,
  PR_SET: 50,
  ALL_SETS_COMPLETE: 25,
  PROTEIN_GOAL: 20,
  SUPPLEMENTS: 15,
} as const;
```

### Level Tiers
```typescript
export const LEVEL_TIERS = [
  { minLevel: 1, maxLevel: 5, title: "Novice", color: "#A0A0A0" },
  { minLevel: 6, maxLevel: 10, title: "Regular", color: "#22C55E" },
  { minLevel: 11, maxLevel: 20, title: "Dedicated", color: "#3B82F6" },
  { minLevel: 21, maxLevel: 35, title: "Committed", color: "#8B5CF6" },
  { minLevel: 36, maxLevel: 50, title: "Elite", color: "#F59E0B" },
  { minLevel: 51, maxLevel: Infinity, title: "Legend", color: "#CDFF00" },
] as const;
```

### Streak Multipliers
```typescript
export const STREAK_MULTIPLIERS = [
  { minDays: 60, multiplier: 2.5 },
  { minDays: 30, multiplier: 2.0 },
  { minDays: 14, multiplier: 1.5 },
  { minDays: 7, multiplier: 1.2 },
  { minDays: 0, multiplier: 1.0 },
] as const;
```

### XP Formula
```typescript
// XP required per level (exponential growth)
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-05 | Initial PRD draft |
