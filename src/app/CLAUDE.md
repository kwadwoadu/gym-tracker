# App Layer Rules - SetFlow (Gym-Tracker)

> Next.js App Router conventions, routing, and page component patterns

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Software Engineer |
| **Collaborators** | Frontend Specialist, PWA Specialist |

---

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

---

## Route Group Conventions

### Authentication Routes
- Sign-in and sign-up pages
- Clerk-managed authentication
- Redirect to home after auth

### Main App Routes
- Protected by middleware
- Requires authenticated user
- All offline-first

### API Routes `api/`
- Server-side functionality
- Sync endpoints
- Data export/import

---

## API Route Standards

```typescript
// Standard API route structure
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Process request

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Cross-References

| Resource | Location |
|----------|----------|
| Components | `/src/components/CLAUDE.md` |
| Database | `/src/lib/CLAUDE.md` |
| Design system | `/CLAUDE.md` |
| PWA rules | `/public/CLAUDE.md` |

---

*App Layer Rules | Updated: January 4, 2026*
