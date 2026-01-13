# PRD: Program Management UI

> **Status:** In Progress
> **Owner:** Kwadwo
> **Created:** 2026-01-13
> **Roadmap Phase:** Phase 2 - Program Management
> **Depends On:** PRD: Program Archiving

---

## 1. Problem

**What problem are we solving?**

SetFlow currently has no way to manage multiple programs after initial onboarding:
- Users can only interact with their active program
- No visibility into other programs they've created
- No way to switch between programs
- No access to archived programs
- Program selection only available during onboarding flow

**Who has this problem?**

- Users who want to try different training programs
- Users returning to a previous program
- Users who want to manage their program library

**What happens if we don't solve it?**

Users are locked into one program with no way to browse alternatives, switch programs, or access their training history across different programs.

---

## 2. Solution

Create a dedicated `/programs` route that serves as a "Program Library":
- List all user programs (active, inactive, archived)
- Visual distinction between program states
- Actions: Activate, Archive, Restore, Clone, View
- Access from settings or navigation
- Follows existing SetFlow design patterns (PlanCard style)

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Programs page accessible | Yes | Route exists and loads |
| All programs visible | 100% | All user programs displayed |
| Activate/Archive works | 100% | State transitions work correctly |
| UI consistent with app | Yes | Uses existing design system |

---

## 4. Requirements

### Must Have
- [ ] New `/programs` route accessible from settings
- [ ] List all programs (active first, then inactive, then archived)
- [ ] Program card showing: name, days/week, workout count, status
- [ ] "Activate" action to switch active program
- [ ] "Archive" action (with confirmation modal from PRD #1)
- [ ] "Restore" action for archived programs
- [ ] Visual state indicators (active badge, archived opacity)
- [ ] Link to view/edit program details

### Should Have
- [ ] "Clone" action to duplicate a program
- [ ] "Create New" button (links to plan selection or scratch)
- [ ] Workout count per program (from WorkoutLog data)
- [ ] Last used date display
- [ ] Collapsible "Archived" section

### Won't Have (this version)
- Drag-drop reordering of programs
- Program sharing/export
- Program templates marketplace

---

## 5. User Flow

### Accessing Programs
1. User taps settings icon
2. User taps "My Programs"
3. Programs page loads showing all programs

### Switching Active Program
1. User views programs list
2. User taps on inactive program card
3. User taps "Activate" button
4. Confirmation: "Make this your active program?"
5. Previous active program becomes inactive
6. Selected program becomes active
7. User redirected to home with new program

### Viewing Archived Programs
1. User scrolls to "Archived" section (collapsed by default)
2. User taps to expand
3. Archived programs shown with muted styling
4. Actions available: Restore, Clone, Delete Permanently

---

## 6. Design

### Page Layout

```
┌─────────────────────────────────────┐
│  ← My Programs          [+ Create]  │  <- Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⭐ Full Body 3-Day  [ACTIVE] │   │  <- Active program (highlighted)
│  │ 3 days/week • 24 workouts   │   │
│  │ [View]              [Archive]│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ PPL 6-Day                    │   │  <- Inactive program
│  │ 6 days/week • 0 workouts    │   │
│  │ [Activate] [View]  [Archive]│   │
│  └─────────────────────────────┘   │
│                                     │
│  ▼ Archived (2)                     │  <- Collapsible section
│  ┌─────────────────────────────┐   │
│  │ Old Program (archived)  ░░░ │   │  <- Muted styling
│  │ Last used: Dec 2024         │   │
│  │ [Restore]  [Clone]  [Delete]│   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### UI Components

**ProgramLibraryCard** (extends PlanCard pattern)
- Name with status badge (ACTIVE = lime, ARCHIVED = gray)
- Days per week
- Workout count (from WorkoutLog)
- Last workout date or "Never used"
- Action buttons based on state

**Status Badges**
| Status | Badge Color | Opacity |
|--------|-------------|---------|
| Active | Lime (#CDFF00) | 100% |
| Inactive | None | 100% |
| Archived | Gray | 60% |

**Action Buttons**
| State | Actions |
|-------|---------|
| Active | View, Archive |
| Inactive | Activate, View, Archive |
| Archived | Restore, Clone, Delete Permanently |

### Navigation Entry Points
1. Settings page: "My Programs" menu item
2. Home page header: Program name is tappable -> Programs page
3. Program editor: "Switch Program" link

---

## 7. Technical Spec

### New Route

`/src/app/programs/page.tsx`
- Client component
- Fetches all user programs (including archived)
- Groups by status
- Handles actions via API calls

### API Usage

**List Programs**
```typescript
// GET /api/programs?includeArchived=true
const response = await programsApi.list({ includeArchived: true });
```

**Activate Program**
```typescript
// PUT /api/programs/[id]
await programsApi.update(programId, { isActive: true });
```

**Archive/Restore**
```typescript
// PUT /api/programs/[id]/archive
await programsApi.archive(programId, { action: 'archive' | 'restore' });
```

**Clone Program**
```typescript
// POST /api/programs/[id]/clone
await programsApi.clone(programId, { name: 'New Name' });
```

**Get Workout Count**
```typescript
// Aggregate query in programs list endpoint
// Returns workoutCount per program
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `/src/app/programs/page.tsx` | NEW: Programs library page |
| `/src/components/program/program-library-card.tsx` | NEW: Card component for library |
| `/src/components/program/archived-section.tsx` | NEW: Collapsible archived section |
| `/src/components/program/activate-modal.tsx` | NEW: Activation confirmation |
| `/src/lib/api-client.ts` | Add programs API methods |
| `/src/app/settings/page.tsx` | Add "My Programs" link |
| `/src/app/api/programs/route.ts` | Add workout count to response |

### Data Requirements

Program list response should include:
```typescript
interface ProgramListItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  trainingDays: { id: string; name: string }[];
  // Aggregated fields:
  workoutCount: number;
  lastWorkoutDate: string | null;
}
```

---

## 8. Implementation Plan

### Dependencies
- [ ] PRD #1: Program Archiving must be complete (archivedAt field, archive API)

### Build Order

1. [x] **API: Enhance Programs List**
   - Add workout count aggregation
   - Add lastWorkoutDate aggregation
   - Support `includeArchived` query param

2. [x] **Component: ProgramLibraryCard**
   - Create new card component
   - Status badge logic
   - Action buttons per state

3. [x] **Component: ArchivedSection**
   - Collapsible section with animation
   - Muted styling for archived cards

4. [x] **Page: /programs**
   - Create page with program listing
   - Group by status (active/inactive/archived)
   - Handle all actions

5. [x] **Component: Activation Modal**
   - Confirmation before switching active program

6. [x] **Navigation: Settings Link**
   - Add "My Programs" to settings page

7. [x] **Navigation: Header Link**
   - Make program name tappable in home header

### Agents to Consult
- **Frontend Specialist** - Component architecture, animations
- **Database Specialist** - Aggregation queries for workout count

### Risks

| Risk | Mitigation |
|------|------------|
| Performance with many programs | Pagination if > 20 programs |
| Confusion about "inactive" vs "archived" | Clear UI labels and tooltips |
| Accidentally activating wrong program | Confirmation modal required |

---

## 9. Testing

- [ ] Programs page lists all user programs
- [ ] Active program shown first with badge
- [ ] Activate changes active program
- [ ] Archive moves program to archived section
- [ ] Restore returns program to main list
- [ ] Clone creates new program with "(Copy)" suffix
- [ ] Workout count displays correctly
- [ ] Archived section collapses/expands
- [ ] Settings link navigates to programs page

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Design consistent with SetFlow patterns

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-13 | Initial draft - PRD created for health optimization plan |
