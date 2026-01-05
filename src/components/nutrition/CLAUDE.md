# Nutrition Components - SetFlow

> Meal planning and nutrition compliance tracking UI components

## Purpose

Components for the nutrition tracking feature, gated to k@adu.dk only. Includes daily compliance logging and drag-and-drop meal planning from templates.

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Frontend Specialist |
| **Collaborators** | Database Specialist, Software Engineer |

---

## Feature Gate

This feature is only accessible to `k@adu.dk`. Use the `useNutritionAccess` hook to check access:

```typescript
import { useNutritionAccess } from '@/hooks/use-nutrition-access';

function MyComponent() {
  const { hasAccess, isLoading } = useNutritionAccess();
  if (!hasAccess) return null;
}
```

---

## Component Directory

| Component | Purpose |
|-----------|---------|
| `daily-checklist.tsx` | Toggle buttons for protein/calorie compliance |
| `meal-planner.tsx` | DnD context wrapper with @dnd-kit |
| `meal-template-card.tsx` | Draggable meal card with macros |
| `meal-slot.tsx` | Droppable slot for meals |
| `macros-summary.tsx` | Total macros calculation bar |
| `compliance-card.tsx` | Weekly compliance stats display |
| `nutrition-nav.tsx` | Tab navigation for nutrition pages |

---

## Data Flow

### Meal Templates (Static)
Source: `/src/data/meal-templates.ts`
- 17 lactose-free meals (no dairy, no quinoa)
- Categories: Breakfast (B1-B4), Mid-morning (M1-M3), Lunch (L1-L5), Snack (S1-S4), Dinner (D1-D5)

### Meal Plans (Dynamic)
- Stored in Prisma: `MealPlan` model
- Structure: `{ breakfast, midMorning, lunch, snack, dinner }` with meal IDs
- Per-user, per-date

### Nutrition Logs (Dynamic)
- Stored in Prisma: `NutritionLog` model
- Fields: `hitProteinGoal`, `caloriesOnTarget`, `notes`
- Per-user, per-date

---

## DnD Implementation

Using @dnd-kit for drag and drop:

```typescript
// Sensors for both mouse and touch
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  })
);
```

### Touch Drag on Mobile
- Long press (200ms) activates drag
- 5px tolerance for finger movement
- Works on iOS Safari

---

## Styling

Follow SetFlow design system:
- Background: `#0A0A0A` (primary), `#1A1A1A` (cards)
- Accent: `#CDFF00` (lime)
- Success: `#22C55E` (green for compliance hit)
- Warning: `#F59E0B` (orange for partial)
- Touch targets: 44px minimum

---

## API Routes

| Endpoint | Purpose |
|----------|---------|
| `GET/PUT /api/nutrition/log` | Daily log CRUD |
| `GET/PUT/POST /api/nutrition/plan` | Meal plan CRUD + copy |
| `GET /api/nutrition/stats` | Weekly compliance stats |

---

## React Query Hooks

From `/src/lib/queries.ts`:
- `useNutritionLog(date)` - Get log for date
- `useUpdateNutritionLog()` - Update log (optimistic)
- `useMealPlan(date)` - Get plan for date
- `useUpdateMealPlan()` - Update plan (optimistic)
- `useCopyMealPlan()` - Copy from another date
- `useNutritionStats(weeks)` - Get weekly stats

---

## Anti-Patterns

| Anti-Pattern | Why | Correct Approach |
|--------------|-----|------------------|
| Direct Prisma in components | Server-only | Use React Query hooks |
| Hardcoded meal data | Unmaintainable | Import from meal-templates.ts |
| HTML5 drag/drop | Poor mobile support | Use @dnd-kit |
| Checking email directly | Inconsistent | Use useNutritionAccess hook |

---

## Cross-References

| Resource | Location |
|----------|----------|
| Meal templates | `/src/data/meal-templates.ts` |
| Feature flags | `/src/lib/feature-flags.ts` |
| API routes | `/src/app/api/nutrition/` |
| React Query hooks | `/src/lib/queries.ts` |
| Access hook | `/src/hooks/use-nutrition-access.ts` |

---

*Created: January 5, 2026*
