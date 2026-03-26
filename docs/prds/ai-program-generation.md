# AI Smart Program Generation

> **Status:** SHIPPED
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

## 4. Requirements

### Must Have
- [x] AI generates a complete training program from OnboardingProfile data
- [x] Generated program includes exercises from the existing exercise database only
- [x] Program respects injury constraints (excludes aggravating movements)
- [x] Program respects equipment availability (only includes exercises user can do)
- [x] Output validated against Zod schema before saving
- [x] Preview screen before saving the generated program
- [x] API key stays server-side (Vercel API route)
- [ ] Rate limiting (max 3 generations per user per day)
- [x] Fallback to template selection if AI generation fails

### Should Have
- [x] Deload weeks auto-scheduled (every 4th or 5th week)
- [x] Progressive overload strategy described in generated program metadata
- [x] Workout history informs starting weights when available
- [x] Regeneration uses performance data (PRs, compliance, stalled lifts) for next program
- [x] Additional preferences input (session length, focus area, mesocycle duration)
- [ ] User consent dialog on first AI generation

### Won't Have (This Version)
- [ ] Real-time program adjustment mid-mesocycle (see ai-adaptive-periodization PRD)
- [ ] Exercise video previews in generation wizard
- [ ] Multi-language prompt support
- [ ] Export/share generated programs

---

## 5. User Flows

### Flow 1: First-Time AI Program Generation (from Onboarding)

1. User completes onboarding steps (goals, experience, equipment, schedule, injuries)
2. User reaches final onboarding screen with options: "Choose a Template" or "Generate AI Program"
3. User taps "Generate AI Program"
4. System displays Step 1: Review Your Profile with pre-filled data from onboarding
5. User optionally edits additional preferences (session length, focus area, mesocycle duration)
6. User taps "Generate My Program" (accent #CDFF00 CTA)
7. System shows Step 2: animated loading with progress messages ("Analyzing your profile...", "Selecting exercises...")
8. AI returns structured JSON; system validates against Zod schema
9. System displays Step 3: Program preview with day-by-day breakdown, superset groupings, deload info
10. User reviews and taps "Start This Program" or "Regenerate"
11. Program saved to IndexedDB with `generatedBy: 'ai'` flag
12. User redirected to Home with new program active

### Flow 2: Regenerate Program (Existing User)

1. User navigates to Programs page
2. User taps "Generate New Program"
3. System pre-fills profile from stored OnboardingProfile
4. System includes performance summary (PRs hit, stalled lifts, adherence rate) in AI context
5. Steps 6-12 from Flow 1 continue

### Flow 3: Generation Failure

1. User taps "Generate My Program"
2. API call times out or returns invalid data
3. System shows error: "Generation failed. Would you like to try again or pick a template?"
4. User taps "Try Again" (retry) or "Choose Template" (fallback to manual)

---

## 6. Technical Spec

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
│  (Claude 4.5 Haiku)  │
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
| `@anthropic-ai/sdk` | Claude API client (latest) | ~50KB |
| `zod` | Schema validation for AI structured output | ~13KB (likely already installed) |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model | Claude 4.5 Haiku (claude-haiku-4-5-20251001, cost/quality balance for structured output) |
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

## 7. Design

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

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| AIProgramWizard | `ai-program-wizard.tsx` | Multi-step wizard (review, generating, preview) |
| ProgramPreviewCard | `program-preview-card.tsx` | Day-by-day preview of generated program |
| GenerationLoading | `generation-loading.tsx` | Animated loading with progress messages |
| ProfileReviewStep | Inside wizard | Shows OnboardingProfile with edit option |
| PreferencesForm | Inside wizard | Session length, focus area, mesocycle inputs |

### Visual Spec

| Element | Value |
|---------|-------|
| Background | #0A0A0A |
| Card surface | #1A1A1A |
| Input fields | #2A2A2A |
| CTA button | #CDFF00 text on #CDFF00/10 bg, solid on hover |
| Loading animation | Pulsing dots in #CDFF00, Framer Motion |
| Injury-modified badge | #F59E0B text, asterisk prefix |
| Day cards | Swipeable horizontal scroll, #1A1A1A bg, 12px radius |
| Font | Inter, 16px body, 24px section headers |
| Touch targets | 44px minimum, 56px for primary CTA |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Verify `@anthropic-ai/sdk` is installed (or add to package.json)
- [ ] Verify `zod` is installed
- [ ] Confirm Vercel environment variable `ANTHROPIC_API_KEY` is set
- [ ] Confirm OnboardingProfile is fully populated by existing onboarding flow
- [ ] Verify exercises.json has equipment tags on all entries

### Build Order

1. **Create shared AI infrastructure** - `/src/lib/ai/ai-client.ts` with Claude client setup, retry logic, token tracking
2. **Create program prompt template** - `/src/lib/ai/prompts/program-prompt.ts` with system prompt and OnboardingProfile serializer
3. **Create Zod validation schema** - `/src/lib/ai/validators/program-validator.ts` with `GeneratedProgramSchema`
4. **Create API route** - `/src/app/api/ai/generate-program/route.ts` with rate limiting, input validation, AI call, output validation
5. **Create program generator** - `/src/lib/ai/program-generator.ts` orchestrating prompt build, API call, validation, fallback
6. **Create loading component** - `generation-loading.tsx` with Framer Motion animated progress
7. **Create preview card** - `program-preview-card.tsx` with day tabs, superset display, deload info
8. **Create wizard component** - `ai-program-wizard.tsx` combining review step, loading step, preview step
9. **Modify DB schema** - Add `generatedBy` field to Program interface in `db.ts`
10. **Modify onboarding flow** - Add AI generation option to final onboarding screen
11. **Modify programs page** - Add "Generate New Program" button
12. **Add feature flag** - `AI_PROGRAM_GENERATION` in `feature-flags.ts`
13. **Test end-to-end** - Generate program, verify saves correctly, start workout from it

---

## 9. Edge Cases

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

## 10. Testing

### Functional Tests
- [ ] Generate program for beginner (3 days, limited equipment) - verify appropriate exercises
- [ ] Generate program for intermediate (4 days, full gym) - verify periodization type
- [ ] Generate program with injury constraints - verify no contraindicated exercises
- [ ] Generate program with existing workout history - verify starting weights are informed by history
- [ ] Rate limit enforcement: 4th generation in 24h shows limit message
- [ ] AI returns malformed JSON - verify graceful error and retry option
- [ ] API timeout (>10s) - verify fallback to template selection
- [ ] Offline state - verify generation button disabled with "Requires internet" message
- [ ] Zod validation rejects output with unknown exercise IDs
- [ ] Generated program saves to IndexedDB with correct `generatedBy: 'ai'`
- [ ] Regeneration includes performance data in prompt context
- [ ] Consent dialog shown on first generation only

### UI Verification
- [ ] Wizard step transitions animate smoothly (Framer Motion)
- [ ] Loading state shows rotating progress messages
- [ ] Preview cards are swipeable on mobile
- [ ] CTA buttons meet 44px minimum touch target
- [ ] Accent color (#CDFF00) used consistently for CTAs and progress
- [ ] Injury-modified exercises marked with asterisk and #F59E0B
- [ ] Dark theme (#0A0A0A bg, #1A1A1A cards) consistent throughout
- [ ] Font sizes match design system (Inter, 16px body)
- [ ] Error states use #EF4444 for text/borders
- [ ] Program preview shows deload week info clearly

---

## 11. Launch Checklist

- [ ] Feature flag `AI_PROGRAM_GENERATION` added and tested (on/off)
- [ ] `ANTHROPIC_API_KEY` set in Vercel production environment
- [ ] Rate limiting tested in production (3/day)
- [ ] API route returns appropriate HTTP codes (200, 400, 429, 500)
- [ ] Consent dialog copy reviewed
- [ ] Fallback to template selection works when AI fails
- [ ] Lighthouse PWA audit passes with new feature
- [ ] Offline behavior verified (feature gracefully disabled)
- [ ] IndexedDB schema version bumped if needed
- [ ] Bundle size impact measured (target: <5KB added to main chunk)
- [ ] Tested on iOS Safari PWA mode
- [ ] Tested on Chrome Android
- [ ] Cost monitoring set up (track API spend per day)

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates exercises not in database | Users see broken exercise cards | Strict validation against exercises.json; reject and retry if >20% unknown IDs |
| Claude API downtime | Feature completely unavailable | Fallback to template selection; cache last generated program locally |
| High API costs at scale | Unexpected billing | Rate limit per user (3/day); monitor daily spend; use Claude 4.5 Haiku for cost efficiency |
| Poor program quality for advanced users | Negative user perception, churn | Include detailed periodization context in prompt; allow regeneration; collect user ratings |
| Prompt injection via profile fields | AI produces unexpected output | Sanitize all user inputs; validate output schema strictly; never expose raw AI output |
| Slow generation (>10s) | Users abandon wizard | Show engaging loading animation; implement timeout with retry; stream partial progress |
| Exercise database gaps (missing equipment tags) | AI selects exercises user can't do | Pre-audit exercises.json for complete equipment tagging; validator cross-checks |
| Users generate but never start workout | Low conversion from generation | Track generation-to-first-workout funnel; optimize preview step for action |

---

## 13. Dependencies

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

- **`/src/lib/ai/ai-client.ts`** - Shared AI API client using `@anthropic-ai/sdk` (latest), token management, retry logic. Created by this PRD, consumed by ai-workout-copilot and ai-voice-logging.
- **`/src/lib/ai/`** directory - All AI-related modules live here. This PRD establishes the directory structure.

**Phase 3 Dependency Chain:**
- **Phase 3.1**: `ai-program-generation.md` ships first, creating the shared AI client and `/src/lib/ai/` directory.
- **Phase 3.2**: `ai-workout-copilot.md` depends on this. Reuses `ai-client.ts` for real-time coaching.
- **Phase 3.3**: `ai-voice-logging.md` depends on this. Reuses `ai-client.ts` for voice transcription and parsing.

### Privacy & Data

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

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-04 | Fix REV-001: Add shared AI infrastructure ownership and Phase 3 dependency chain |
| 2026-03-04 | Fix REV-014: Renumber section headings to match numbered format (## 1. Problem, etc.) |
| 2026-03-04 | Fix REV-019: Add Program Generation Output Schema with Zod definitions |
| 2026-03-26 | PRD quality audit: Updated model to Claude 4.5 Haiku, added Requirements (MoSCoW), User Flows, Implementation Plan, Testing, Launch Checklist, Risks & Mitigations, Component Table, Visual Spec. Restructured to 14-section standard. |
| 2026-03-26 | SHIPPED: All core files implemented - API route, wizard UI (4 steps), validator with exercise substitution, onboarding integration. |
