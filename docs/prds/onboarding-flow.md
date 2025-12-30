# Onboarding Flow PRD

## Overview
Mobile-first onboarding flow for SetFlow PWA that collects user preferences to personalize the gym tracking experience.

## Status: Complete

## Problem Statement
New users need to set up their training preferences before using the app. Without proper onboarding, users must manually configure their experience, leading to potential drop-off.

## Solution
An 8-step swipeable carousel that collects:
- Fitness goals
- Experience level
- Training schedule
- Equipment access
- Body metrics (optional)
- Injury considerations (optional)

## User Flow
1. User signs up via Clerk
2. Redirected to `/onboarding`
3. Swipe through 8 steps (can skip anytime)
4. Data saved to IndexedDB (offline-first)
5. On completion, redirected to plan selection

## Data Collected

| Field | Type | Required |
|-------|------|----------|
| goals | string[] | Yes |
| experienceLevel | enum | Yes |
| trainingDaysPerWeek | number | Yes (default 3) |
| equipment | enum | Yes |
| heightCm | number | No |
| weightKg | number | No |
| bodyFatPercent | number | No |
| injuries | string[] | No |

## Technical Implementation

### Components Created
- `src/components/onboarding/onboarding-carousel.tsx` - Embla Carousel wrapper
- `src/components/onboarding/progress-dots.tsx` - Navigation dots
- `src/components/onboarding/onboarding-step.tsx` - Base step wrapper
- `src/components/onboarding/steps/` - 8 step components:
  - welcome-step.tsx
  - goals-step.tsx
  - experience-step.tsx
  - schedule-step.tsx
  - equipment-step.tsx
  - body-metrics-step.tsx
  - injuries-step.tsx
  - completion-step.tsx

### Pages Created
- `src/app/onboarding/page.tsx` - Main onboarding page
- `src/app/onboarding/layout.tsx` - Minimal layout (no nav)

### Data Layer
- IndexedDB: `onboardingProfiles` store in db.ts
- Server: `onboarding_profiles` table in schema.ts (Drizzle)
- Actions: `src/lib/actions/onboarding.ts` for cloud sync

### Dependencies
- `embla-carousel-react` - Swipeable carousel

## Design Decisions
1. **Offline-first**: Data saved to IndexedDB first, then synced to cloud
2. **Skippable**: Users can skip at any point, defaults applied
3. **Touch-optimized**: 44px min touch targets, swipe navigation
4. **Dark theme**: Consistent with app design (#0A0A0A bg, #CDFF00 accent)

## Success Metrics
- Onboarding completion rate > 70%
- Time to completion < 2 minutes
- Skip rate < 30%
