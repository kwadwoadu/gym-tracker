# Pattern: Time-Period Grouping

> Group related activities by time of day rather than by category

## Problem

When users perform multiple related activities throughout the day (meals, supplements, medications, habits), organizing them by category creates disconnected UX. Users must jump between different pages/sections to manage their daily routine.

## Solution

Group activities by **time period** rather than by activity type. Create a unified view where all related activities for a time of day appear together.

## When to Use

- Multiple activity types happen at similar times (meals + supplements)
- Activities have natural time associations (morning, afternoon, evening)
- Different day types require different time mappings (rest day vs training day)
- User's mental model is "what do I do now?" not "show me all meals"

## Implementation

### 1. Define Time Periods Data Structure

```typescript
// src/data/time-periods.ts
export interface TimePeriod {
  id: string;
  label: string;
  icon: string;
  timeRange: string;
  mealSlot: MealSlot;           // Maps to meal category
  supplementBlocks: string[];   // Maps to supplement block IDs
}

// Different mappings per day type
export const TIME_PERIODS: Record<DayType, TimePeriod[]> = {
  rest: REST_DAY_PERIODS,
  'am-training': AM_TRAINING_PERIODS,
  'pm-training': PM_TRAINING_PERIODS,
};
```

### 2. Create Time Period Section Component

```typescript
// Collapsible section showing all activities for a time period
interface TimePeriodSectionProps {
  period: TimePeriod;
  mealId: string | null;
  supplementBlocks: SupplementBlock[];
  onSelectMeal: (slotType: MealSlot, mealId: string) => void;
  // ... other callbacks
}
```

### 3. Context-Aware Rendering

```typescript
// Get time periods for current day type
const timePeriods = getTimePeriodsForDayType(dayType);

// Render sections
{timePeriods.map((period) => (
  <TimePeriodSection
    key={period.id}
    period={period}
    mealId={slots[period.mealSlot]}
    supplementBlocks={getSupplementBlocksForPeriod(period.supplementBlocks)}
  />
))}
```

## Key Design Decisions

### Variable Mappings by Context

Training days have different time periods than rest days:
- **Rest Day**: Morning (5-8am) -> Breakfast + Morning supplements
- **AM Training**: Pre-Workout (5-5:30am) -> Pre-workout shake + Pre-workout supplements

### Cross-Activity Connections

Use flags to create meaningful connections:
- `isShake` on meals -> triggers Shake Builder modal
- `smoothieMix` on supplements -> shows in Shake Builder

### Progress Tracking

Combine completion from multiple activity types:
```typescript
const overallProgress = Math.round((mealProgress + supplementProgress) / 2);
```

## File Structure

```
src/
  data/
    time-periods.ts        # Time period definitions
    meal-templates.ts      # Meals with isShake flag
    supplement-protocol.ts # Supplements with smoothieMix flag
  components/nutrition/
    time-period-section.tsx  # Combined section component
    inline-meal-slot.tsx     # Compact meal selector
    shake-builder-modal.tsx  # Cross-activity modal
```

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoded time periods | Doesn't adapt to day type | Use context-aware mapping |
| Separate pages per activity | Disconnected UX | Unified time-based view |
| Category-first organization | Mismatches user mental model | Time-first organization |

## Testing

1. Switch between day types - verify time periods change appropriately
2. Select a shake meal - verify Shake Builder shows correct supplements
3. Complete supplements via Shake Builder - verify they're marked complete
4. Check progress bar - verify it reflects both meals and supplements

## Related Patterns

- [Local-First Data](./local-first-data.md) - Data persistence strategy
- [PWA Offline Sync](./pwa-offline-sync.md) - Cross-device sync

---

*Created: January 11, 2026*
*Source: Unified Nutrition UX feature*
