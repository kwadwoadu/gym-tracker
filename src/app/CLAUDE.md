# App Layer Rules - SetFlow (Gym-Tracker)

## Route Structure
- `/` - Home (training day selector + workout start)
- `/workout` - Active workout session
- `/stats` - Progress charts, PRs, achievements
- `/exercises` - Exercise database + custom creation
- `/program` - Training program editor
- `/settings` - User preferences
- `/onboarding` - First-time setup (8 steps)

## Component Patterns
- Offline-first: All data via IndexedDB (Dexie)
- Client Components for all interactive UI ("use client")
- Framer Motion for animations (smooth 60fps)
- Touch targets: 44px minimum for mobile

## State Management
- React hooks (no Redux/Zustand)
- Workout session persisted to IndexedDB
- Global weight memory for progressive overload
- Session survives refresh (6-hour expiry)

## PWA Requirements
- All features MUST work offline
- Service worker caches app shell
- Audio via Web Audio API (not HTML5 audio)
- IndexedDB for all persistent data

## Workout Flow Phases
1. Preview - See today's exercises
2. Warmup - Optional warmup sets
3. Exercise - Log sets (weight, reps, RPE)
4. Rest - Countdown timer with audio cues
5. Finisher - Optional finisher exercises
6. Complete - Summary + achievements

## Key Components
- `/components/workout/SetLogger` - Set input with suggestions
- `/components/workout/RestTimer` - Circular countdown
- `/components/workout/ChallengeCard` - Progressive overload prompt
- `/components/stats/AchievementGallery` - 25+ achievements
- `/components/program/DayEditor` - Drag-and-drop exercises

## Styling
- Tailwind CSS + shadcn/ui
- Dark theme by default
- High contrast for gym visibility
- Large touch targets for sweaty fingers

## Common Mistakes to Avoid
- NEVER assume network availability
- NEVER use HTML5 audio (breaks on iOS)
- NEVER block UI during IndexedDB operations
- NEVER forget to update Dexie version for schema changes
- NEVER make touch targets smaller than 44px
