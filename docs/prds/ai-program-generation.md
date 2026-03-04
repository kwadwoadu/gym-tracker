# AI Smart Program Generation

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P0
> **Roadmap Phase:** Phase 3 - AI Features

---

## 1. Problem

SetFlow's current onboarding offers preset program templates only (Full Body A/B/C). Users with specific goals, schedules, injuries, or equipment constraints get a one-size-fits-all program that doesn't match their needs. Intermediate and advanced lifters especially find template programs too generic, leading to suboptimal progress and eventual churn.

The onboarding flow already collects the right data (goals, experience level, equipment, training days per week, injuries) via `OnboardingProfile`, but this data is only used to select from a handful of static templates rather than generating a truly personalized program.

---

## 2. Solution

AI generates a fully periodized training program based on the user's onboarding profile and training history. The system produces 4-12 week mesocycles with built-in progression, auto-adjusts volume and intensity per muscle group, and respects injury constraints and equipment availability.

### Core Behaviors

1. **Profile-Driven Generation**: Uses `OnboardingProfile` data (goals, experience, equipment, schedule, injuries) as primary input. If the user has workout history, that history informs starting weights and volume tolerance.

2. **Structured Mesocycle Output**: AI generates a complete mesocycle (4-12 weeks depending on goal):
   - Weekly undulating periodization for intermediates
   - Linear progression for beginners
   - Block periodization for advanced lifters
   - Built-in deload weeks (every 4th or 5th week)

3. **Exercise Selection Intelligence**: AI selects exercises from the existing exercise database (`exercises.json`, 97+ exercises) based on:
   - Available equipment
   - Injury modifications (e.g., no overhead pressing with shoulder injury)
   - Muscle group balance across the week
   - Movement pattern coverage (push/pull/hinge/squat/carry)

4. **Progressive Overload Built In**: Each week's target weights, sets, and reps progress automatically:
   - Beginner: +2.5kg/week linear
   - Intermediate: +1-2% weekly with RPE targets
   - Advanced: Percentage-based with rate of perceived exertion (RPE) autoregulation

5. **Regeneration on Demand**: User can request a new program at any time. AI considers what worked (exercises where PRs were hit, high compliance days) and what didn't (skipped exercises, stalled lifts).

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Program generation completion rate | >90% of users who start generation finish | Track generation start vs. program saved |
| Program adherence (4 weeks) | >70% of scheduled workouts completed | Compare planned vs. logged workouts |
| Time to first workout | <5 minutes from generation to first logged set | Track timestamps |
| User satisfaction | >4.2/5 rating on generated program | In-app rating prompt after week 1 |
| Retention improvement | +15% 30-day retention vs. template users | Cohort comparison |

---

## 4. User Stories

- As a beginner, I want a program generated for my 3-day schedule with basic equipment so I don't have to research programming myself.
- As an intermediate lifter with a shoulder injury, I want AI to build a program that avoids aggravating movements while still training upper body.
- As an advanced lifter, I want a periodized mesocycle with deload weeks built in so I can focus on execution rather than planning.
- As a user who completed a mesocycle, I want AI to generate my next program based on what worked and what stalled.
- As a user switching from 4 days to 3 days per week, I want AI to redistribute my volume intelligently.

---

## 5. Technical Scope

### Architecture

```
User completes onboarding / taps "Generate Program"
        |
        v
┌──────────────────────┐
│  Collect Context     │ -- OnboardingProfile + workout history + PRs
└──────────┬───────────┘
           |
           v
┌──────────────────────┐
│  Build AI Prompt     │ -- Structured prompt with constraints
└──────────┬───────────┘
           |
           v
┌──────────────────────┐
│  AI API Call         │ -- Claude API with structured output (JSON)
│  (Claude 3.5 Sonnet) │
└──────────┬───────────┘
           |
           v
┌──────────────────────┐
│  Validate & Parse    │ -- Validate exercise IDs exist, sets/reps in range
└──────────┬───────────┘
           |
           v
┌──────────────────────┐
│  Preview & Confirm   │ -- User reviews program before saving
└──────────┬───────────┘
           |
           v
┌──────────────────────┐
│  Save to IndexedDB   │ -- Create Program + TrainingDays + Supersets
└──────────────────────┘
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/program-generator.ts` | Core generation logic: prompt building, API call, response parsing |
| `/src/lib/ai/ai-client.ts` | Shared AI API client (Claude/OpenAI), token management, retry logic |
| `/src/lib/ai/prompts/program-prompt.ts` | Prompt templates for program generation |
| `/src/lib/ai/validators/program-validator.ts` | Validate AI output against exercise DB and constraints |
| `/src/components/program/ai-program-wizard.tsx` | Multi-step UI: review profile -> generating animation -> preview -> confirm |
| `/src/components/program/program-preview-card.tsx` | Preview card showing generated program structure |
| `/src/components/program/generation-loading.tsx` | Animated loading state during AI generation |
| `/src/app/api/ai/generate-program/route.ts` | API route for program generation (keeps API key server-side) |

### Files to Modify

| File | Change |
|------|--------|
| `/src/lib/db.ts` | Add `generatedBy: 'ai' \| 'template' \| 'manual'` field to `Program` interface |
| `/src/lib/queries.ts` | Add `useGenerateProgram()` mutation hook |
| `/src/components/onboarding/*.tsx` | Add "Generate AI Program" option at end of onboarding flow |
| `/src/app/programs/page.tsx` | Add "Generate New Program" button |
| `/src/lib/feature-flags.ts` | Add `AI_PROGRAM_GENERATION` feature flag |
| `/src/data/exercises.json` | Ensure all exercises have equipment tags for filtering |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `@anthropic-ai/sdk` | Claude API client | ~50KB |
| `zod` | Schema validation for AI structured output | ~13KB (likely already installed) |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model | Claude 3.5 Sonnet (cost/quality balance) |
| Input tokens | ~2,000 (profile + exercise list + history summary) |
| Output tokens | ~3,000 (full program JSON) |
| Latency | 3-8 seconds expected |
| Cost per generation | ~$0.01-0.02 |
| Rate limiting | Max 3 generations per user per day |
| Structured output | JSON mode with Zod schema validation |

### Program Generation Output Schema

The AI structured output is validated against this Zod schema before saving:

```typescript
import { z } from 'zod';

const ExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1).max(10),
  reps: z.string(), // "8-10" or "12"
  weight: z.number().optional(),
  tempo: z.string().optional(),
  restSeconds: z.number().min(30).max(300),
  notes: z.string().optional(),
});

const TrainingDaySchema = z.object({
  name: z.string(),
  supersets: z.array(z.object({
    label: z.string(),
    exercises: z.array(ExerciseSchema),
  })),
  warmup: z.array(ExerciseSchema).optional(),
  finisher: z.array(ExerciseSchema).optional(),
});

const GeneratedProgramSchema = z.object({
  name: z.string(),
  description: z.string(),
  durationWeeks: z.number().min(4).max(12),
  daysPerWeek: z.number().min(2).max(6),
  days: z.array(TrainingDaySchema),
  deloadWeek: z.number().optional(),
  progressionStrategy: z.string(),
});
```

This schema lives in `/src/lib/ai/validators/program-validator.ts` and is used both for AI output validation and as the structured output format hint passed to Claude.

---

## 6. Design Requirements

### AI Program Wizard Flow

```
┌─────────────────────────────────────────┐
│  Step 1: Review Your Profile            │
├─────────────────────────────────────────┤
│                                          │
│  Goals: Build Muscle, Get Stronger       │
│  Level: Intermediate                     │
│  Equipment: Full Gym                     │
│  Schedule: 4 days/week                   │
│  Injuries: Left shoulder (minor)         │
│                                          │
│  [Edit Profile]                          │
│                                          │
│  ┌─────────────────────────────────┐     │
│  │   Additional Preferences        │     │
│  │   Session length: 60 min        │     │
│  │   Focus area: Upper body        │     │
│  │   Mesocycle: 8 weeks            │     │
│  └─────────────────────────────────┘     │
│                                          │
│  [Generate My Program]    ← CDFF00 CTA  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Step 2: Generating...                   │
├─────────────────────────────────────────┤
│                                          │
│       ┌──────────────────────┐           │
│       │   ● ● ● ● ○ ○ ○    │           │
│       │                      │           │
│       │  Analyzing your      │           │
│       │  profile...          │           │
│       │                      │           │
│       │  Selecting exercises │           │
│       │  for your goals...   │           │
│       └──────────────────────┘           │
│                                          │
│  Building your 8-week mesocycle          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Step 3: Your Program                    │
├─────────────────────────────────────────┤
│  "Hypertrophy Block - 8 Weeks"           │
│                                          │
│  Day 1: Upper Push                       │
│  ├ A1: Bench Press      4x8-10          │
│  ├ A2: Incline DB Press 3x10-12         │
│  ├ B1: OHP (machine*)   3x10-12         │
│  └ ...                                   │
│  * Modified for shoulder injury          │
│                                          │
│  Day 2: Lower Body                       │
│  ├ A1: Back Squat       4x6-8           │
│  └ ...                                   │
│                                          │
│  [Day 3] [Day 4]                         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Deload: Week 5                     │  │
│  │ Progression: +2.5% weekly          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Regenerate]  [Start This Program]      │
└─────────────────────────────────────────┘
```

### Visual Style
- Dark theme consistent with SetFlow (#0A0A0A background)
- Accent color (#CDFF00) for CTA buttons and progress indicators
- Generation loading: animated dots or pulse effect (Framer Motion)
- Injury-modified exercises marked with asterisk and explanation
- Swipeable day cards for program preview

---

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| AI returns exercise not in database | Validator maps to closest match or flags for manual selection |
| AI generates too many sets (overtraining) | Validator enforces per-session volume caps (20-25 working sets max) |
| User has no workout history | Use conservative starting weights based on experience level and bodyweight |
| API timeout or failure | Show retry button, offer to fall back to template selection |
| User offline | Disable generation button, show "Requires internet" message |
| Conflicting goals (build muscle + lose fat) | AI prioritizes based on experience level; beginners can do both, advanced get phased approach |
| All equipment options injured | AI suggests bodyweight/rehab-focused program with disclaimer |
| AI hallucinates exercises | Strict validation against `exercises.json` IDs; reject and retry if >20% unknown |
| Rate limit exceeded | Show "You've generated 3 programs today. Try again tomorrow." |

---

## 8. Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| OnboardingProfile (goals, injuries, etc.) | Sent to Claude API for generation | Not stored by API (instant processing) |
| Workout history summary | Sent to Claude API (aggregated, no raw logs) | Not stored by API |
| Exercise database | Sent as reference list to Claude API | Not stored by API |
| Generated program | Stored locally in IndexedDB | Until user deletes |
| API key | Server-side only (Vercel env var) | Never exposed to client |

### User Consent
- First-time generation shows consent dialog: "SetFlow will send your profile data to generate a personalized program. No personal identifiers are included."
- Users can opt out and use template programs instead

---

## 9. Priority

**P0 - Must Ship**

This is the highest-impact AI feature. It transforms onboarding from "pick a template" to "get a personalized program" and directly addresses the #1 reason users abandon fitness apps: programs that don't match their needs.

---

## 10. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| OnboardingProfile data collection | Complete | Profile input for AI |
| Exercise database with equipment tags | Complete | Exercise selection |
| Program/TrainingDay data model | Complete | Storing generated programs |
| Claude API access | Needs setup | AI generation |
| Vercel API routes | Available | Server-side API key management |
| Feature flags system | Complete | Gating rollout |
| `/src/lib/ai/ai-client.ts` (shared) | Created by this PRD | AI client for all Phase 3 features |
| `/src/lib/ai/` directory (shared) | Created by this PRD | Shared AI infrastructure |

### Shared AI Infrastructure

This PRD owns creation of the shared AI infrastructure used by all Phase 3 AI features:

- **`/src/lib/ai/ai-client.ts`** - Shared AI API client (Claude/OpenAI), token management, retry logic. Created by this PRD, consumed by ai-workout-copilot and ai-voice-logging.
- **`/src/lib/ai/`** directory - All AI-related modules live here. This PRD establishes the directory structure.

**Phase 3 Dependency Chain:**
- **Phase 3.1**: `ai-program-generation.md` ships first, creating the shared AI client and `/src/lib/ai/` directory.
- **Phase 3.2**: `ai-workout-copilot.md` depends on this. Reuses `ai-client.ts` for real-time coaching.
- **Phase 3.3**: `ai-voice-logging.md` depends on this. Reuses `ai-client.ts` for voice transcription and parsing.

---

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-04 | Fix REV-001: Add shared AI infrastructure ownership and Phase 3 dependency chain |
| 2026-03-04 | Fix REV-014: Renumber section headings to match numbered format (## 1. Problem, etc.) |
| 2026-03-04 | Fix REV-019: Add Program Generation Output Schema with Zod definitions |
