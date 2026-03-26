# AI Workout Copilot (In-Session Coach)

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - AI Features

> **Note:** The basic AI Coach chat with markdown rendering and dynamic follow-up prompts is already shipped. This PRD covers the NEXT level: real-time in-session performance coaching, multi-week plateau detection with evidence-based interventions, and muscle-matched exercise substitution.

---

## 1. Problem Statement

Users get zero real-time feedback during their workouts. They log sets mechanically without knowing whether they should increase weight, adjust rest times, or stop early due to fatigue. When performance plateaus, users have no guidance on what to change. When an exercise is unavailable (machine taken, equipment missing), they don't know what to substitute.

Currently, SetFlow tracks progressive overload with simple rules (all sets at max reps + RPE < 9 = suggest +2.5kg), but this is a static rule that ignores session-level performance trends, fatigue accumulation across supersets, rest time patterns, and multi-week plateaus.

---

## 2. Proposed Solution

An AI copilot that lives inside the active workout session, analyzing performance in real-time and providing contextual coaching cues. The copilot covers three integrated capabilities:

### 1. Real-Time Performance Coach

Analyzes sets as they're logged and provides actionable suggestions:

- **Weight/RPE suggestions**: "RPE has been 6 for 3 consecutive sets - consider increasing by 2.5kg"
- **Rest optimization**: "You're averaging 3 min rest between sets - for hypertrophy, try 90s for more metabolic stress"
- **Fatigue detection**: "Performance dropping across sets (12 -> 10 -> 7 reps) - consider ending after this superset"
- **Set quality feedback**: "Strong set! RPE 8 at target reps - perfect intensity"
- **Tempo reminders**: "Your last 3 sets had no eccentric control - focus on the 3-second lowering phase"

### 2. AI Plateau Breaker

Detects multi-week stalls and suggests evidence-based interventions:

- **Stall detection**: Identifies when a lift hasn't progressed in 2+ weeks despite consistent training
- **Technique variations**: "Bench press stalling at 90kg - try paused reps (2s at chest) for 2 weeks to break through"
- **Volume adjustments**: "Add a back-off set at 80% after your working sets"
- **Periodization shifts**: "Consider a deload week - you've been pushing hard for 5 weeks"
- **Exercise rotation**: "Swap flat bench for incline DB press for 3 weeks, then return"

### 3. Exercise Substitution Engine

Instantly suggests equivalent exercises when needed:

- **Equipment unavailable**: "Barbell bench taken? Try: Dumbbell Bench Press (same primary muscles, similar movement)"
- **Injury accommodation**: "Shoulder pain on OHP? Try: Landmine Press (reduced ROM, less impingement risk)"
- **Home workout fallback**: "No cable machine? Try: Banded Face Pulls (same rear delt activation)"
- **Muscle-matched**: Substitutions always target the same primary muscles with matching equipment availability

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Copilot suggestion acceptance rate | >40% of suggestions acted on | Track suggestion shown vs. weight/rest changed |
| Session completion rate | +10% improvement with copilot on | Compare completion rates copilot on vs. off |
| Plateau break rate | >50% of detected plateaus broken within 3 weeks | Track stall detection -> subsequent PR |
| Substitution usage | >60% acceptance when offered | Track substitution suggestions vs. swaps made |
| User engagement | Users interact with copilot in >70% of sessions | Track sessions with copilot interactions |
| NPS impact | +8 points for copilot users | Survey cohort comparison |

---

## 4. Requirements

### Must Have
- [ ] Tier 1 on-device analysis: RPE trend detection, rep dropoff, rest time tracking
- [ ] Tier 2 AI-powered analysis: plateau detection, exercise substitution with reasoning
- [ ] Copilot card UI: dismissible suggestion shown during workout (non-blocking)
- [ ] Weight/RPE suggestions when RPE is consistently low or high
- [ ] Fatigue detection when rep performance drops significantly across sets
- [ ] Suggestion queue: max 1 suggestion visible at a time, priority-ordered
- [ ] Toggle copilot on/off in Settings
- [ ] Offline fallback: Tier 1 rules work fully offline, Tier 2 silently disabled

### Should Have
- [ ] Multi-week plateau detection (2+ weeks stall on compounds, 3+ on isolation)
- [ ] Plateau intervention suggestions (paused reps, back-off sets, exercise rotation, deload)
- [ ] Exercise substitution engine with muscle-match percentage
- [ ] Substitution picker UI with multiple options ranked by match quality
- [ ] Rest time optimization suggestions based on training goal (hypertrophy vs. strength)
- [ ] Adaptive suggestion frequency (reduce after 5 consecutive dismissals)
- [ ] CopilotSuggestion history stored in IndexedDB

### Won't Have (This Version)
- [ ] Voice-based copilot suggestions (TTS)
- [ ] Auto-adjustment of program based on copilot data (see ai-adaptive-periodization PRD)
- [ ] Cross-session fatigue analysis (see ai-predictive-analytics PRD)
- [ ] Integration with wearable heart rate data

---

## 5. User Flows

### Flow 1: Real-Time Weight Suggestion

1. User is in active workout, logging sets for Bench Press
2. User completes Set 3 with 85kg x 10 reps, RPE 6
3. Tier 1 analyzer detects RPE 6 for 3 consecutive sets
4. Copilot card slides in below the set logger: "RPE 6 for 3 sets in a row. Try 87.5kg next set."
5. User sees two options: [Apply +2.5kg] or [Dismiss]
6. User taps "Apply +2.5kg" - weight input pre-fills to 87.5kg for next set
7. Suggestion recorded as accepted in CopilotSuggestion table

### Flow 2: Plateau Detection

1. User starts a new workout session for Upper Push
2. System checks workout history: Bench Press at 85kg x 10 for 3 consecutive sessions
3. Before first Bench Press set, copilot shows plateau alert card (Tier 2 AI analysis)
4. Card shows: "Bench Press has been at 85kg x 10 for 3 weeks" with 3 interventions
5. User taps "Try #1" (paused reps) - copilot adds a note to the exercise card
6. Next session, system tracks if plateau was broken

### Flow 3: Exercise Substitution

1. User is on Barbell Bench Press in their workout
2. User taps "Substitute" button on the exercise card (e.g., machine is taken)
3. Substitution picker opens showing muscle-matched alternatives
4. Each option shows match percentage and target muscles
5. User taps "Swap" on Dumbbell Bench Press (95% match)
6. Exercise card updates to the substitute; sets/reps preserved
7. Substitution logged for future reference

### Flow 4: Fatigue Detection

1. User is on Set 5 of Squats. Reps: 12, 10, 8, 7 (progressive drop)
2. Tier 1 detects >30% rep decrease from Set 1 to Set 4
3. Copilot card appears: "Performance dropping (12 to 7 reps). Consider ending after this set."
4. User can [End Exercise], [One More Set], or [Dismiss]

---

## 6. Technical Spec

### Architecture

```
User logs a set
      |
      v
┌─────────────────────┐
│ Local Analysis      │ -- RPE trend, rep dropoff, rest times (on-device)
│ (lightweight rules) │
└─────────┬───────────┘
          |
    ┌─────┴──────────────┐
    |                    |
    v                    v
[Simple cue]       [Complex analysis needed]
    |                    |
    v                    v
Show inline tip    ┌─────────────────────┐
                   │ AI API Call          │ -- Plateau analysis, substitution
                   │ (between sets/rest)  │
                   └─────────┬───────────┘
                             |
                             v
                   ┌─────────────────────┐
                   │ Copilot Card        │ -- Dismissible suggestion UI
                   └─────────────────────┘
```

### Two-Tier Analysis System

**Tier 1 - On-Device (instant, no API call)**:
- RPE trend across sets (simple moving average)
- Rep dropoff detection (>30% decrease = fatigue flag)
- Rest time tracking vs. target
- Weight vs. last session comparison
- Volume accumulation per muscle group

**Tier 2 - AI-Powered (API call during rest periods)**:
- Multi-week plateau detection and intervention suggestions
- Exercise substitution with reasoning
- Periodization recommendations
- Fatigue pattern analysis across sessions

### Plateau Detection Criteria

- **Compound lifts**: stall = same weight x same reps for 2 consecutive sessions AND weekly volume stable (+/-10%)
- **Isolation exercises**: stall = 3 consecutive sessions without weight or rep increase
- **Consistent training**: completed 2+ sessions/week for past 4 weeks (otherwise insufficient data)
- **Volume calculation**: sum of (weight x reps x sets) per exercise per session
- **Exception**: first 3 weeks of a new program are adaptation phase - don't flag plateaus
- **Suggestion types** when plateau detected: (1) micro-progression (+1.25kg), (2) rep scheme change, (3) tempo variation, (4) deload recommendation if 6+ week stall

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/workout-copilot.ts` | Core copilot engine: local analysis + AI orchestration |
| `/src/lib/ai/copilot-rules.ts` | On-device rule engine for Tier 1 analysis (no API needed) |
| `/src/lib/ai/plateau-detector.ts` | Multi-week stall detection logic using workout history |
| `/src/lib/ai/exercise-substitutor.ts` | Muscle-matched exercise substitution with equipment filtering |
| `/src/lib/ai/prompts/copilot-prompt.ts` | Prompt templates for Tier 2 AI analysis |
| `/src/components/workout/copilot-card.tsx` | Dismissible suggestion card shown during workout |
| `/src/components/workout/copilot-drawer.tsx` | Expandable drawer for detailed AI coaching (plateau analysis, substitution options) |
| `/src/components/workout/substitution-picker.tsx` | Exercise substitution selection UI with muscle map comparison |
| `/src/hooks/use-copilot.ts` | React hook managing copilot state, suggestion queue, and dismissals |
| `/src/app/api/ai/copilot/route.ts` | API route for Tier 2 AI analysis |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/workout/set-logger.tsx` | Integrate copilot card after set completion |
| `/src/components/workout/rest-timer.tsx` | Show copilot suggestions during rest periods |
| `/src/components/workout/exercise-card.tsx` | Add substitution button and copilot indicator |
| `/src/lib/db.ts` | Add `CopilotSuggestion` interface and table for tracking suggestion history |
| `/src/lib/queries.ts` | Add `useCopilotSuggestions()`, `usePlateauHistory()` hooks |
| `/src/lib/feature-flags.ts` | Add `AI_WORKOUT_COPILOT` feature flag |
| `/src/data/exercises.json` | Ensure substitution metadata (movement pattern, difficulty) exists |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| None new | Tier 1 uses pure TypeScript, Tier 2 uses shared `ai-client.ts` from PRD 1 | - |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model (Tier 2) | Claude 4.5 Haiku (claude-haiku-4-5-20251001, fast and cost-efficient for real-time use) |
| Input tokens | ~800 (current set data + recent history summary) |
| Output tokens | ~200 (suggestion + reasoning) |
| Latency target | <2 seconds (must complete during rest period) |
| Cost per suggestion | ~$0.001 |
| Calls per session | 2-5 Tier 2 calls per workout (most handled by Tier 1 locally) |
| Offline fallback | Tier 1 rules work fully offline; Tier 2 silently disabled |

---

## 7. Design

### Copilot Card (In-Workout)

```
┌─────────────────────────────────────────┐
│  Set Logger                              │
│  Bench Press - Set 3 of 4                │
│  [Weight: 85kg]  [Reps: 10]  [RPE: 6]   │
│                                          │
│  [Complete Set]                          │
│                                          │
│  ┌─ Copilot ────────────────────────┐    │
│  │  ↑ Weight suggestion             │    │
│  │  RPE 6 for 3 sets in a row.     │    │
│  │  Try 87.5kg next set.           │    │
│  │                                   │    │
│  │  [Apply +2.5kg]  [Dismiss]  [x]  │    │
│  └───────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Plateau Alert Card

```
┌─ Copilot: Plateau Detected ─────────────┐
│                                          │
│  Bench Press has been at 85kg x 10       │
│  for 3 weeks.                            │
│                                          │
│  Suggested interventions:                │
│  1. Paused reps (2s at chest) - 2 weeks  │
│  2. Add back-off set at 70kg x 12        │
│  3. Swap to Incline DB Press for variety  │
│                                          │
│  [Try #1]  [Try #2]  [Try #3]  [Ignore]  │
└──────────────────────────────────────────┘
```

### Substitution Picker

```
┌─ Exercise Unavailable? ─────────────────┐
│                                          │
│  Current: Barbell Bench Press            │
│  Primary: Chest | Secondary: Triceps     │
│                                          │
│  Suggested substitutes:                  │
│  ┌────────────────────────────────────┐  │
│  │ Dumbbell Bench Press     95% match │  │
│  │ Chest, Triceps, Front Delts       │  │
│  │ [Swap]                            │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Machine Chest Press      88% match │  │
│  │ Chest, Triceps                    │  │
│  │ [Swap]                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Show More]                [Cancel]     │
└──────────────────────────────────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| CopilotCard | `copilot-card.tsx` | Dismissible suggestion card with action buttons |
| CopilotDrawer | `copilot-drawer.tsx` | Expandable drawer for detailed plateau analysis |
| SubstitutionPicker | `substitution-picker.tsx` | Exercise swap UI with muscle match comparison |
| useCopilot | `use-copilot.ts` | Hook managing suggestion queue, state, dismissals |

### Visual Spec

| Element | Value |
|---------|-------|
| Copilot card bg | #1A1A1A with subtle box-shadow glow |
| Copilot card left border | 3px solid #CDFF00 |
| Plateau alert accent | #F59E0B (warning) |
| Substitution match badge | #22C55E for >80%, #F59E0B for 60-80%, #EF4444 for <60% |
| Dismiss interaction | Swipe-left or X button (16px, #666666) |
| Card position | Below set logger, does not block logging flow |
| Card animation | Slide in from bottom, 200ms ease-out (Framer Motion) |
| Font | Inter, 14px body, 12px caption for match percentages |
| Touch targets | 44px minimum for action buttons |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Shared AI client (`ai-client.ts`) exists from PRD 1
- [ ] Workout logging flow complete and stable
- [ ] SetLog includes RPE field
- [ ] Exercise database has muscle group and movement pattern metadata
- [ ] exercises.json includes difficulty and substitution-relevant data

### Build Order

1. **Create Tier 1 rule engine** - `/src/lib/ai/copilot-rules.ts` with RPE trend, rep dropoff, rest time analysis
2. **Create plateau detector** - `/src/lib/ai/plateau-detector.ts` using workout history queries
3. **Create exercise substitutor** - `/src/lib/ai/exercise-substitutor.ts` with muscle-matching algorithm
4. **Create copilot prompt** - `/src/lib/ai/prompts/copilot-prompt.ts` for Tier 2 AI analysis
5. **Create API route** - `/src/app/api/ai/copilot/route.ts` for Tier 2 calls
6. **Create copilot engine** - `/src/lib/ai/workout-copilot.ts` orchestrating Tier 1 + Tier 2
7. **Create copilot card component** - `copilot-card.tsx` with dismiss, apply, and action buttons
8. **Create substitution picker** - `substitution-picker.tsx` with ranked options
9. **Create copilot drawer** - `copilot-drawer.tsx` for detailed analysis views
10. **Create useCopilot hook** - `use-copilot.ts` managing suggestion queue and state
11. **Integrate with set logger** - Modify `set-logger.tsx` to trigger copilot after set completion
12. **Integrate with rest timer** - Modify `rest-timer.tsx` to show suggestions during rest
13. **Add DB table** - CopilotSuggestion in `db.ts` for suggestion history
14. **Add feature flag** - `AI_WORKOUT_COPILOT` in `feature-flags.ts`

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User ignores all suggestions | Reduce suggestion frequency after 5 consecutive dismissals; reset next session |
| Copilot suggests weight increase but user is injured | Never override user RPE; if RPE is reported high, respect it regardless of weight |
| Network unavailable for Tier 2 | Silently fall back to Tier 1 only; no error messages during workout |
| First workout ever (no history) | Disable copilot for first session; show "Copilot activates after your first workout" |
| User does exercises out of programmed order | Copilot adapts to actual exercise order, not planned |
| Plateau on isolation exercises | Different thresholds: compound lifts stall at 2 weeks, isolation at 3 weeks |
| Multiple suggestions at once | Queue system: show max 1 suggestion at a time, prioritize by impact |
| Substitution exercise also unavailable | Allow chaining: "This one too? Here's another option" |
| RPE not logged (optional field) | Fall back to rep-based analysis only; prompt user to log RPE for better coaching |

---

## 10. Testing

### Functional Tests
- [ ] Tier 1: RPE trend detection fires when RPE < 7 for 3 consecutive sets
- [ ] Tier 1: Rep dropoff detection fires when reps drop >30% from set 1
- [ ] Tier 1: Rest time suggestion fires when rest exceeds goal by >60s
- [ ] Tier 2: Plateau detected after 2 sessions at same weight/reps (compounds)
- [ ] Tier 2: Plateau detected after 3 sessions (isolation exercises)
- [ ] Tier 2: No plateau flagged during first 3 weeks of new program (adaptation)
- [ ] Substitution: returns exercises matching primary muscle group
- [ ] Substitution: filters by available equipment
- [ ] Substitution: chaining works (second substitute if first also unavailable)
- [ ] Suggestion queue: only 1 suggestion visible at a time
- [ ] Dismiss reduces frequency after 5 consecutive dismissals
- [ ] Copilot disabled for first-ever session (no history)
- [ ] Offline: Tier 1 works, Tier 2 silently skipped, no error shown
- [ ] Toggle off in Settings disables all copilot suggestions
- [ ] "Apply" action correctly updates weight/rep input fields

### UI Verification
- [ ] Copilot card slides in smoothly below set logger (Framer Motion)
- [ ] Card does not block set logging input fields
- [ ] Swipe-left dismisses card
- [ ] X button dismisses card
- [ ] Action buttons (Apply, Dismiss) meet 44px touch target
- [ ] #CDFF00 left border on weight/performance suggestions
- [ ] #F59E0B left border on plateau alerts
- [ ] Substitution picker shows match percentage badges with correct colors
- [ ] Dark theme (#0A0A0A bg, #1A1A1A cards) consistent
- [ ] Copilot card text readable (14px Inter on #1A1A1A)

---

## 11. Launch Checklist

- [ ] Feature flag `AI_WORKOUT_COPILOT` added and tested (on/off)
- [ ] Tier 1 rules tested across 5+ workout scenarios
- [ ] Tier 2 API route working with shared `ai-client.ts`
- [ ] Plateau detection validated against known stall patterns
- [ ] Substitution engine tested with all equipment types
- [ ] Copilot toggle in Settings functional
- [ ] Offline behavior verified (Tier 1 only, no errors)
- [ ] Performance: Tier 1 analysis adds <50ms to set completion flow
- [ ] Performance: Tier 2 calls complete within 2s
- [ ] Bundle size: copilot code lazy-loaded, not in main chunk
- [ ] Tested on iOS Safari PWA mode during live workout
- [ ] Tested on Chrome Android during live workout
- [ ] CopilotSuggestion table created in IndexedDB schema

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Copilot suggestions annoy users mid-workout | Users disable copilot entirely | Adaptive frequency reduction; "Quiet mode" option; max 1 card at a time |
| Incorrect plateau detection (false positive) | User trusts AI and changes program unnecessarily | Require minimum data (2+ sessions/week for 4 weeks); show data backing each detection |
| Substitution suggests poor muscle match | User trains wrong muscles | Validate substitution engine against exercise science references; show match percentage |
| Tier 2 API latency during rest period | Suggestion arrives too late (user already started next set) | 2s timeout; prefer Tier 1 when possible; queue suggestion for next rest if late |
| Conflicting suggestions (copilot + manual coach advice) | User confused | Clear disclaimer: "AI suggestion based on your logged data. Override anytime." |
| RPE not consistently logged by user | Tier 1 analysis is limited | Fall back to rep-based analysis only; prompt user to log RPE for better coaching |
| AI suggests weight increase when user is fatigued | Injury risk | Never override user-reported high RPE; weight suggestions capped at +5% of current |
| High Tier 2 API usage per session | Cost overrun | Cap at 5 Tier 2 calls per session; most analysis handled by Tier 1 locally |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| AI client (`ai-client.ts`) | Created in PRD 1 | Tier 2 API calls |
| Workout logging flow | Complete | Set data input |
| SetLog with RPE field | Complete | Performance analysis |
| Exercise database with muscle data | Complete | Substitution engine |
| Progressive overload pattern | Complete | Baseline comparison |
| Feature flags system | Complete | Gating rollout |
| PRD 1 (AI Program Generation) | Recommended first | Shared AI infrastructure |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Current set data (weight, reps, RPE) | Tier 2: sent to Claude API | Not stored by API |
| Recent workout history (last 4 weeks, aggregated) | Tier 2: sent to Claude API | Not stored by API |
| Exercise names and muscle groups | Tier 2: sent for substitution context | Not stored by API |
| Suggestion history (accepted/dismissed) | Stored locally in IndexedDB | Until user clears data |
| Tier 1 analysis | Never leaves device | Local only |

> **Storage Note**: CopilotSuggestion is stored in Dexie.js (local IndexedDB), consistent with SetFlow's offline-first architecture. Suggestion history is local-only, not synced to server. Data is cleared when user clears app data.

### User Control
- Toggle copilot on/off in Settings (default: on)
- Individual suggestion types can be disabled (weight, rest, fatigue, plateaus)
- "Quiet mode" option: copilot only shows critical alerts (fatigue/injury risk)

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft - combines Workout Copilot, Plateau Breaker, and Exercise Substitution |
| 2026-03-26 | PRD quality audit: Added note re: shipped AI Coach. Updated model to Claude 4.5 Haiku. Added Requirements (MoSCoW), User Flows, Implementation Plan, Component Table, Visual Spec, Testing, Launch Checklist, Risks & Mitigations. Restructured to 14-section standard. |
| 2026-03-26 | SHIPPED: Implemented plateau-detector.ts, weight-recommender.ts, CopilotWidget.tsx. Integrated floating widget into workout page during exercise/rest phases. Supports plateau alerts, weight suggestions, RPE-based tips, and expandable chat. |
