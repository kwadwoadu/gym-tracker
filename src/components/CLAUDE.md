# Components Layer - SetFlow

> UI component architecture, naming conventions, and design system rules

## Purpose

Define standards for React components that power the SetFlow gym workout tracking PWA. All components must be gym-friendly: large touch targets, dark theme, offline-first.

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Frontend Specialist |
| **Collaborators** | Audio Engineer (timers), Movement Specialist (exercise cards), PWA Specialist (offline UI) |

---

## Component Architecture

### Use shadcn/ui For
- Buttons, Inputs, Dialogs, Sheets
- Cards, Tabs, Accordions
- Dropdowns, Selects, Popovers
- Toasts, Alerts, Badges

### Never Reimplement
- Never create custom button/input components
- Never write custom modal logic
- Use shadcn primitives, customize with Tailwind

### Component Philosophy
- Components must be **pure** when possible (no side effects)
- Split complex UI logic from presentation
- **Client Components** for all interactive UI (`"use client"`)
- All components work **offline-first**

---

## Folder Structure

```
/components/
  ui/               -> shadcn/ui components (DO NOT MODIFY)
  workout/          -> Active workout session components
    SetLogger.tsx       - Weight/rep input with suggestions
    RestTimer.tsx       - Circular countdown timer
    ExerciseCard.tsx    - Exercise display during workout
    ChallengeCard.tsx   - Progressive overload prompts
    WorkoutSummary.tsx  - Session completion summary
  stats/            -> Analytics and progress visualization
    ProgressChart.tsx   - Weight/volume over time
    PRDisplay.tsx       - Personal record highlights
    AchievementGallery.tsx - Unlocked achievements grid
  program/          -> Program editor components
    DayEditor.tsx       - Drag-drop exercise ordering
    ExerciseSelector.tsx - Add exercises to day
    SupersetEditor.tsx  - Configure A/B pairs
  onboarding/       -> First-time setup flow
    StepProgress.tsx    - 8-step progress indicator
    PlanCard.tsx        - Program template card
    GoalSelector.tsx    - Training goal selection
  gamification/     -> Achievements and celebrations
    AchievementBadge.tsx
    ConfettiExplosion.tsx
    LevelUpModal.tsx
  sync/             -> Cross-device sync UI
    SyncIndicator.tsx   - Sync status badge
    SyncProvider.tsx    - React context for sync
    CloudSyncSheet.tsx  - Sync settings
  shared/           -> Common reusable elements
    PWAInstallPrompt.tsx
    OfflineBanner.tsx
    LoadingSpinner.tsx
  providers/        -> React context providers
    QueryProvider.tsx   - React Query
    ThemeProvider.tsx   - Dark theme
  plan-selection/   -> Program selection cards
    PlanCard.tsx
    PlanGrid.tsx
```

---

## Naming Conventions

### Component Names
- **PascalCase** for all components
- **Never** append "Component" to names
- Use descriptive suffixes:

| Suffix | Use For | Example |
|--------|---------|---------|
| Card | Contained display unit | `ExerciseCard`, `PlanCard` |
| Dialog | Modal dialogs | `ConfirmDialog`, `EditSetDialog` |
| Sheet | Bottom sheets (mobile) | `RestTimerSheet`, `CloudSyncSheet` |
| Logger | Input forms | `SetLogger`, `WorkoutLogger` |
| Timer | Countdown/timing | `RestTimer`, `SessionTimer` |
| Badge | Status indicators | `AchievementBadge`, `SyncBadge` |
| Chart | Data visualization | `ProgressChart`, `VolumeChart` |
| Gallery | Grid displays | `AchievementGallery`, `ExerciseGallery` |
| Editor | Editing interfaces | `DayEditor`, `SupersetEditor` |
| Selector | Selection UI | `ExerciseSelector`, `GoalSelector` |

### File Names
- Match component name: `SetLogger.tsx` exports `SetLogger`
- One component per file (exceptions for tightly coupled pairs)
- Index files only for barrel exports

---

## Gym-Friendly UI Requirements

### Touch Targets (Critical)
| Element | Minimum Size |
|---------|-------------|
| Primary CTAs | 56px height |
| Secondary buttons | 44x44px |
| List items | 48px height |
| Icon buttons | 44x44px |

### Visual Design
- **Dark theme only** - no light mode toggle
- **High contrast** - lime (#CDFF00) on black (#0A0A0A)
- **Glanceable** - key data visible at a glance during workout
- **Sweaty fingers** - extra padding on touch targets

### Accessibility
- No hover-only interactions
- Audio feedback via Web Audio API
- Large fonts for gym visibility (16px+ body)
- High color contrast (4.5:1 minimum)

---

## Animation Guidelines

### Use Framer Motion For
- Page transitions
- List reordering (drag-drop)
- Timer countdowns
- Achievement celebrations

### Performance Rules
- Target **60fps** always
- Use `will-change` sparingly
- Prefer `transform` and `opacity`
- Disable animations on reduced-motion

### Common Animations
```typescript
// Fade in
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };

// Slide up (sheets)
const slideUp = { initial: { y: '100%' }, animate: { y: 0 } };

// Scale (achievements)
const pop = { initial: { scale: 0 }, animate: { scale: 1 } };
```

---

## Component Patterns

### Correct: Offline-First Data
```tsx
// CORRECT: Use Dexie hooks
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function ExerciseList() {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  // Renders immediately from IndexedDB
}
```

### Wrong: Network-Dependent
```tsx
// WRONG: Assumes network
function ExerciseList() {
  const { data } = useQuery({ queryFn: () => fetch('/api/exercises') });
  // Fails offline
}
```

### Correct: Audio Feedback
```tsx
// CORRECT: Use audio module
import { playSound } from '@/lib/audio';

function RestTimer() {
  const onComplete = () => playSound('rest-complete');
}
```

### Wrong: HTML5 Audio
```tsx
// WRONG: Breaks on iOS
function RestTimer() {
  const audio = new Audio('/sounds/beep.mp3');
  audio.play(); // Silent on iOS
}
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Custom button component | Inconsistent, wastes time | Use shadcn `Button` |
| Inline styles | Hard to maintain | Use Tailwind classes |
| Touch targets < 44px | Unusable in gym | Minimum 44x44px |
| Network-first data | Fails offline | Dexie + IndexedDB |
| HTML5 audio | iOS incompatible | Web Audio API |
| Light theme components | Not supported | Dark theme only |

---

## Cross-References

| Resource | Location |
|----------|----------|
| Design system | `/CLAUDE.md` (Colors, Typography) |
| Audio patterns | `/docs/patterns/audio-cue-system.md` |
| Offline patterns | `/docs/patterns/pwa-offline-sync.md` |
| shadcn components | `/components/ui/` |
| App routes | `/src/app/CLAUDE.md` |

---

*Created: January 4, 2026*
