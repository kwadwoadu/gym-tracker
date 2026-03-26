# AI Personal Trainer - Vision Document

> **Status:** Vision Doc (not directly implementable)
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P3 (umbrella)
> **Roadmap Phase:** Phase 4 - Advanced AI

> **This is a vision document.** It describes the long-term goal for SetFlow's AI personal trainer. Implementation is split into 4 independently shippable sub-PRDs:
>
> | Sub-PRD | File | Priority | Status |
> |---------|------|----------|--------|
> | Conversational Trainer Chat | [`ai-conversational-trainer.md`](ai-conversational-trainer.md) | P2 | Draft |
> | Adaptive Periodization Engine | [`ai-adaptive-periodization.md`](ai-adaptive-periodization.md) | P3 | Draft |
> | Predictive Analytics | [`ai-predictive-analytics.md`](ai-predictive-analytics.md) | P3 | Draft |
> | Recovery Integration (Whoop) | [`ai-recovery-integration.md`](ai-recovery-integration.md) | P3 | Draft |
>
> **Ship order**: Conversational Trainer first (validates chat adoption), then Adaptive Periodization, then Predictive Analytics and Recovery Integration can ship in parallel.

---

## Problem Statement

Most gym-goers follow static programs that never adapt. They run the same weights, same exercises, same rep schemes for months. When progress stalls, they don't know why. When life gets in the way (poor sleep, stressful week, missed sessions), the program doesn't adjust. When they should deload, they don't know it. When they're ready to push harder, nobody tells them.

Even with AI-generated programs (PRD 1) and in-session copilot (PRD 2), there is no unified intelligence that manages the entire training lifecycle: planning mesocycles, adjusting week-to-week based on recovery, predicting PRs, assessing injury risk, and having a real conversation about training strategy.

This is the difference between a tracker with AI features and an AI personal trainer. SetFlow currently has the former. This PRD describes the latter.

---

## Proposed Solution

A full conversational AI personal trainer that lives inside SetFlow and manages the user's entire training journey. It combines all prior AI features into a unified intelligence layer that understands the user's history, current state, and goals to make holistic training decisions.

### Core Capabilities

#### 1. Adaptive Periodization Engine

The AI continuously adjusts the training program based on actual performance data:

- **Weekly volume auto-regulation**: If a user consistently exceeds RPE targets, volume is reduced next week. If RPE is consistently low, volume or intensity increases.
- **Exercise rotation**: Automatically swaps exercises every 3-6 weeks based on staleness, muscle balance, and user preference data.
- **Deload auto-scheduling**: Detects accumulated fatigue markers (RPE trending up, rep performance trending down, rest times increasing) and prescribes deload weeks proactively.
- **Mesocycle transitions**: When a mesocycle ends, automatically generates the next block based on what the previous block achieved and what the user's long-term goal requires.
- **Recovery-aware programming**: Integrates Whoop recovery data (via AduOS health domain) to adjust training intensity on low-recovery days.

#### 2. Conversational AI Trainer

A chat interface where users can have natural conversations about their training:

- "Should I train today? I only slept 5 hours."
- "My shoulder is feeling off. What should I change?"
- "I want to peak for a ski trip in 6 weeks."
- "Why have my squats stalled?"
- "What would you change about my program?"

The AI responds with context-aware advice based on the user's complete training history, current program, recovery data, and goals.

#### 3. Predictive Analytics

Data-driven predictions based on historical performance:

- **PR Prediction**: "Based on your progression rate, you should hit a 100kg bench press in approximately 4 weeks."
- **Volume landmarks**: "You've completed 500 total sets this month - a new monthly volume record."
- **Consistency scoring**: "You've trained 3.8 days/week this month vs. your 4-day target. Your consistency is above average."
- **Fatigue forecasting**: "Based on current volume and RPE trends, you'll need a deload in approximately 2 weeks."

#### 4. Injury Risk Scoring

Proactive injury risk assessment based on training patterns:

- **Volume spikes**: "Your chest volume increased 40% this week. Rapid volume increases correlate with overuse injuries. Consider pulling back next week."
- **Imbalance detection**: "Your pushing volume is 2x your pulling volume. This anterior/posterior imbalance increases shoulder injury risk."
- **Repeated high-RPE**: "You've logged RPE 9-10 on deadlifts for 4 consecutive sessions. Consider an intensity reduction to avoid CNS fatigue."
- **Movement pattern gaps**: "You haven't done any single-leg work in 6 weeks. Adding lunges or split squats would improve stability."

#### 5. Whoop Integration (via AduOS)

Recovery-aware training decisions using Whoop data from the AduOS health domain:

- **Low recovery day**: "Your Whoop recovery is 34% (red). Recommend skipping today or doing a light mobility session instead."
- **High recovery day**: "Recovery is 89% (green). Great day to push for PRs or increase volume."
- **Sleep-adjusted intensity**: "Only 5.5 hours of sleep. Reducing working sets from 4 to 3 and dropping intensity by 5%."
- **Strain budget**: "Your weekly strain is already high (18.5). Today's session should be moderate - keep RPE under 7."

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Trainer chat engagement | >3 conversations per user per week | Track chat sessions |
| PR prediction accuracy | Within 2 weeks of predicted date, >60% of the time | Compare predictions to actual PR dates |
| Injury risk alert accuracy | >70% of flagged risks acknowledged by user | Track alert shown vs. user action |
| Adaptive adjustments accepted | >50% of auto-adjustments kept (not manually overridden) | Track adjustment acceptance rate |
| User retention (trainer users vs. non-users) | +25% 60-day retention | Cohort comparison |
| Net Promoter Score | >50 for trainer feature | In-app survey |
| Deload compliance | >80% of prescribed deloads followed | Track deload adherence |

---

## User Stories

- As a lifter who slept poorly, I want my AI trainer to automatically reduce today's workout intensity so I train appropriately for my recovery state.
- As a user whose squats have stalled, I want to ask my trainer "Why aren't my squats going up?" and get a data-backed explanation with specific changes to try.
- As a user finishing a mesocycle, I want the AI to automatically generate my next training block based on what I've accomplished.
- As a user with a Whoop, I want my training to automatically adjust based on my recovery score without me having to think about it.
- As a user, I want to know when I'm likely to hit my next bench press PR so I can plan for it.
- As a user training alone, I want an injury risk alert if my training patterns become dangerous.
- As a user who missed 2 sessions last week, I want the AI to restructure the remaining week to preserve the most important training stimulus.
- As a user preparing for a snowboarding trip, I want to tell my trainer and have it adjust my program to peak athletically at the right time.

---

## Technical Scope

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   AI Personal Trainer                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Conversation │  │ Adaptive    │  │ Predictive  │      │
│  │ Engine       │  │ Periodizer  │  │ Analytics   │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         |                |                |              │
│         v                v                v              │
│  ┌────────────────────────────────────────────────┐      │
│  │           Unified Context Engine               │      │
│  │                                                 │      │
│  │  Aggregates:                                    │      │
│  │  - Full workout history (WorkoutLog, SetLog)    │      │
│  │  - Current program (Program, TrainingDays)      │      │
│  │  - Personal records (PersonalRecord)            │      │
│  │  - User profile (OnboardingProfile)             │      │
│  │  - Whoop data (via AduOS health domain)         │      │
│  │  - Nutrition compliance (NutritionLog)           │      │
│  │  - Copilot suggestion history                   │      │
│  └─────────────────────┬──────────────────────────┘      │
│                        |                                  │
│                        v                                  │
│  ┌────────────────────────────────────────────────┐      │
│  │              Claude API                         │      │
│  │          (Claude Sonnet 4.6)                    │      │
│  │      Long context for full user history         │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐                        │
│  │ Injury Risk │  │ Whoop       │                        │
│  │ Scorer      │  │ Integration │                        │
│  └─────────────┘  └─────────────┘                        │
└──────────────────────────────────────────────────────────┘
```

### Context Engine

The Context Engine is the core differentiator. It aggregates all user data into a structured context that the AI can reason over:

```typescript
interface TrainerContext {
  // User profile
  profile: {
    goals: string[];
    experience: string;
    equipment: string;
    injuries: string[];
    trainingDaysPerWeek: number;
  };

  // Current program
  currentProgram: {
    name: string;
    weekNumber: number;
    mesocycleLength: number;
    trainingDays: TrainingDaySummary[];
  };

  // Performance trends (last 8 weeks)
  trends: {
    exerciseProgress: ExerciseProgressTrend[];  // per-exercise weight/rep trends
    volumeTrend: WeeklyVolumeTrend[];          // total weekly volume
    rpeTrend: WeeklyRPETrend[];                // average RPE trend
    consistencyRate: number;                    // % of planned sessions completed
    restTimeTrend: number[];                   // average rest between sets
  };

  // Recovery (from Whoop via AduOS)
  recovery?: {
    todayScore: number;        // 0-100
    sleepHours: number;
    hrv: number;
    weeklyStrain: number;
    recoveryTrend: number[];   // last 7 days
  };

  // Plateaus & stalls
  stalls: {
    exercise: string;
    weeksStalled: number;
    lastWeight: number;
    lastReps: number;
  }[];

  // Injury risk factors
  riskFactors: {
    volumeSpikes: string[];        // muscles with >30% volume increase
    imbalances: string[];          // push/pull, anterior/posterior ratios
    highRPEStreak: string[];       // exercises with 3+ sessions at RPE 9+
    missingPatterns: string[];     // movement patterns not trained in 4+ weeks
  };

  // Recent PRs
  recentPRs: PersonalRecord[];

  // Nutrition compliance (last 7 days)
  nutritionCompliance?: {
    proteinHitRate: number;
    calorieHitRate: number;
  };
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/personal-trainer.ts` | Core trainer orchestrator: context building, conversation management |
| `/src/lib/ai/context-engine.ts` | Aggregates all user data into TrainerContext |
| `/src/lib/ai/adaptive-periodizer.ts` | Week-to-week program adjustments based on performance |
| `/src/lib/ai/predictive-analytics.ts` | PR prediction, fatigue forecasting, consistency scoring |
| `/src/lib/ai/injury-risk-scorer.ts` | Risk scoring from volume spikes, imbalances, RPE patterns |
| `/src/lib/ai/whoop-bridge.ts` | Bridge to AduOS Whoop data (reads from health domain) |
| `/src/lib/ai/prompts/trainer-prompt.ts` | System prompts for trainer personality, boundaries, knowledge |
| `/src/lib/ai/prompts/periodization-prompt.ts` | Prompts for adaptive periodization decisions |
| `/src/components/trainer/trainer-chat.tsx` | Full-screen chat interface for trainer conversations |
| `/src/components/trainer/trainer-message.tsx` | Individual message bubble (user and AI) |
| `/src/components/trainer/trainer-fab.tsx` | Floating action button to open trainer from any screen |
| `/src/components/trainer/quick-actions.tsx` | Quick action chips ("Should I train today?", "Analyze my week") |
| `/src/components/trainer/prediction-card.tsx` | PR prediction and milestone card |
| `/src/components/trainer/risk-alert.tsx` | Injury risk alert banner |
| `/src/components/trainer/deload-suggestion.tsx` | Deload recommendation card with "Accept" / "Skip" |
| `/src/components/trainer/weekly-adjustment.tsx` | Weekly program adjustment preview with diff view |
| `/src/hooks/use-trainer.ts` | React hook for trainer state, conversation history, context |
| `/src/hooks/use-trainer-context.ts` | React hook for building TrainerContext from multiple data sources |
| `/src/app/trainer/page.tsx` | Trainer chat page |
| `/src/app/api/ai/trainer/route.ts` | API route for trainer conversations |
| `/src/app/api/ai/trainer/adjust/route.ts` | API route for program adjustments |
| `/src/app/api/ai/trainer/predict/route.ts` | API route for predictive analytics |

### Files to Modify

| File | Change |
|------|--------|
| `/src/lib/db.ts` | Add `TrainerConversation`, `ProgramAdjustment`, `RiskAlert` interfaces and tables |
| `/src/lib/queries.ts` | Add trainer hooks: `useTrainerChat()`, `useProgramAdjustments()`, `useRiskAlerts()`, `usePredictions()` |
| `/src/components/layout/bottom-nav.tsx` (or equivalent) | Add trainer tab/FAB |
| `/src/app/page.tsx` | Add risk alerts and predictions to dashboard |
| `/src/app/stats/page.tsx` | Add prediction section, injury risk indicators |
| `/src/lib/feature-flags.ts` | Add `AI_PERSONAL_TRAINER` feature flag |
| `/src/components/workout/exercise-card.tsx` | Show "Adjusted" badge when trainer modified the program |
| `/src/app/workout/page.tsx` | Show recovery-based intensity adjustment banner at session start |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| None new | Uses shared `ai-client.ts`; all analysis is prompt-based | - |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model | Claude Sonnet 4.6 (needs reasoning for complex training decisions) |
| Context window | ~8,000-12,000 tokens per conversation (full TrainerContext + conversation history) |
| Output tokens | ~500-1,000 per response (detailed coaching advice) |
| Latency | 3-8 seconds per response (acceptable for chat UX) |
| Cost per conversation turn | ~$0.03-0.05 |
| Conversation history | Last 20 messages kept in context; older messages summarized |
| Background analysis | Weekly batch job for program adjustments, predictions, risk scoring |
| Streaming | Response streaming for chat UX (shows typing indicator then streams text) |

---

## Design Requirements

### Trainer Chat Interface

```
┌─────────────────────────────────────────┐
│  AI Trainer                      [...]  │
├─────────────────────────────────────────┤
│                                          │
│  Quick Actions:                          │
│  [Should I train?] [Analyze week]       │
│  [Why am I stalling?] [Next mesocycle]  │
│                                          │
│  ┌──────────────────────────────┐        │
│  │ Trainer: Good morning! Your  │        │
│  │ Whoop recovery is 72% today  │        │
│  │ (yellow). I'd recommend       │        │
│  │ training but dropping         │        │
│  │ intensity by ~10%.            │        │
│  │                               │        │
│  │ Your Upper Push day today has │        │
│  │ been adjusted:                │        │
│  │ - Bench: 85kg -> 77.5kg      │        │
│  │ - OHP: 50kg -> 45kg          │        │
│  │ - Volume unchanged            │        │
│  │                               │        │
│  │ [Accept Adjustments]          │        │
│  │ [Train as Planned]            │        │
│  └──────────────────────────────┘        │
│                                          │
│         ┌──────────────────────────────┐ │
│         │ You: My shoulder has been    │ │
│         │ feeling tight after bench.   │ │
│         │ Should I be worried?         │ │
│         └──────────────────────────────┘ │
│                                          │
│  ┌──────────────────────────────┐        │
│  │ Trainer: That tightness could │        │
│  │ be from your increased bench  │        │
│  │ volume this block (+25% over  │        │
│  │ 3 weeks). I'd suggest:        │        │
│  │                               │        │
│  │ 1. Add band pull-aparts      │        │
│  │    between bench sets (3x15)  │        │
│  │ 2. Reduce bench from 4 to 3  │        │
│  │    working sets next week     │        │
│  │ 3. Add face pulls to your    │        │
│  │    pull day warmup            │        │
│  │                               │        │
│  │ If it persists beyond 2       │        │
│  │ weeks, consider seeing a      │        │
│  │ physio.                        │        │
│  └──────────────────────────────┘        │
│                                          │
│  [🎤]  [Type a message...]     [Send]   │
└─────────────────────────────────────────┘
```

### Prediction Card (Dashboard)

```
┌─ PR Prediction ─────────────────────────┐
│                                          │
│  Bench Press: 100kg                      │
│  ████████████████░░░░  82%               │
│  Estimated: ~4 weeks (Mar 28)            │
│                                          │
│  Based on: +1.8kg/week avg progression   │
│  Current: 92.5kg x 8 @ RPE 8            │
│                                          │
│  [View Details]                          │
└──────────────────────────────────────────┘
```

### Risk Alert Banner

```
┌─ Injury Risk Alert ─────────────── ! ───┐
│                                          │
│  Chest volume spike detected             │
│  This week: 24 sets (+38% vs. avg)       │
│                                          │
│  Recommendation: Cap chest at 18 sets    │
│  next week to avoid overuse.             │
│                                          │
│  [Adjust Program]  [Acknowledge]         │
└──────────────────────────────────────────┘
```

### Weekly Adjustment Preview

```
┌─ Weekly Program Adjustment ─────────────┐
│  Week 6 of 8 - Adjusted for performance  │
├──────────────────────────────────────────┤
│                                          │
│  Changes from last week:                 │
│                                          │
│  Upper Push:                             │
│   Bench Press:   85kg x 4x10            │
│                  -> 87.5kg x 4x8-10     │
│   OHP:           50kg x 3x10            │
│                  -> 50kg x 4x8  (+1 set)│
│                                          │
│  Lower Body:                             │
│   Squat:         100kg x 4x8            │
│                  -> 100kg x 4x6-8       │
│                  (RPE was 9.5 last week) │
│                                          │
│  [Accept All]  [Review Each]  [Dismiss]  │
└──────────────────────────────────────────┘
```

### Floating Action Button

```
┌──────────────────────────┐
│  [Any screen content]    │
│                          │
│                          │
│                          │
│                    ┌──┐  │
│                    │AI│  │  <- 56px FAB, accent color
│                    └──┘  │     bottom-right, above nav
└──────────────────────────┘
```

### Visual Style
- Chat interface: dark background (#0A0A0A), message bubbles (#1A1A1A for AI, #2A2A2A for user)
- AI messages have subtle accent (#CDFF00) left border
- Quick action chips: outlined style, accent color text
- Prediction cards: gradient background with progress bar
- Risk alerts: warning color (#F59E0B) accent, exclamation icon
- FAB: accent color (#CDFF00), pulsing glow when trainer has a pending notification
- Streaming text: typing indicator (three dots) then text appears progressively

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User asks medical question ("Is this a torn rotator cuff?") | AI disclaims: "I'm a training AI, not a medical professional. Based on your symptoms, I'd recommend seeing a physiotherapist. In the meantime, avoid overhead movements." |
| Whoop data unavailable | Disable recovery-aware adjustments; note "Connect Whoop for recovery-based training" |
| User hasn't trained in 2+ weeks | AI suggests return-to-training protocol: reduce volume 40%, reduce intensity 20%, rebuild over 2 weeks |
| PR prediction timeline impossible (user regressing) | Show "Unable to predict - performance trending down. Let's discuss what might be causing this." |
| User overrides all AI adjustments | After 3 consecutive overrides, AI asks: "I notice you've been adjusting my recommendations. Would you prefer I suggest less aggressive/conservative changes?" |
| Conversation goes off-topic | AI politely redirects: "That's outside my expertise. I'm best at helping with training, recovery, and nutrition questions." |
| Multiple conflicting goals ("I want to get shredded and gain 10kg muscle") | AI explains trade-offs honestly: "These goals require different approaches. Shall we focus on one first?" |
| New user with no history | Limited to onboarding-based advice; builds context over first 4 weeks; tells user "I'll have much better advice for you after a few weeks of training data." |
| Offline | Chat disabled (requires API). Show cached predictions and last risk assessment. Queue messages for when online. |
| High API cost user (many conversations) | Implement daily conversation limit (10 turns/day for free, unlimited for premium) |
| AI suggests dangerously heavy weight | Validator caps AI suggestions at max 110% of current working weight; never suggests more than +5kg increase |

---

## Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Full workout history (aggregated trends) | Sent to Claude API per conversation | Not stored by API |
| Current program structure | Sent to Claude API | Not stored by API |
| Personal records | Sent to Claude API | Not stored by API |
| Whoop recovery data | Read from AduOS health domain; sent to Claude API | Not stored by API |
| Conversation history | Stored locally in IndexedDB | Last 50 conversations, older auto-archived |
| Program adjustments | Stored locally in IndexedDB | Linked to program |
| Risk alerts | Stored locally in IndexedDB | Until acknowledged |
| Predictions | Stored locally in IndexedDB | Until resolved (PR hit or prediction expired) |

### User Consent
- First trainer use: "Your AI Trainer analyzes your training history, recovery data, and goals to provide personalized coaching. All data is processed securely and not stored on external servers."
- Whoop integration: Separate consent for sharing recovery data with AI trainer
- Users can export/delete all trainer data from Settings
- Conversation history can be cleared independently of workout data

### Trainer Personality & Boundaries

The AI trainer has a defined personality:
- **Tone**: Encouraging but honest. Direct, not flowery. Uses gym terminology naturally.
- **Boundaries**: Never diagnoses injuries, never prescribes supplements (only suggests timing), never gives mental health advice
- **Philosophy**: Evidence-based training principles. Favors compound movements, progressive overload, adequate recovery.
- **Disclaimers**: Proactively adds disclaimers for medical-adjacent topics

---

## Priority

**P3 - Future Consideration**

This is the "holy grail" feature that transforms SetFlow from a workout tracker into an AI-powered personal trainer. It depends on all other AI features being stable (program generation for mesocycle management, copilot for in-session data, voice logging for frictionless input, nutrition coach for holistic health). The technical complexity is high (context engine aggregating multiple data sources, conversation management, predictive analytics), but the differentiation potential is enormous. Very few fitness apps offer genuine adaptive periodization with conversational AI.

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| PRD 1: AI Program Generation | Required | Mesocycle generation and transitions |
| PRD 2: AI Workout Copilot | Required | In-session data and plateau detection |
| PRD 3: AI Voice Logging | Recommended | Frictionless data input for richer context |
| PRD 5: AI Nutrition Coach | Recommended | Holistic coaching (training + nutrition) |
| AI client (`ai-client.ts`) | Created in PRD 1 | API calls |
| Whoop integration (AduOS) | Available | Recovery-aware programming |
| Workout history (4+ weeks of data) | Needed per-user | Meaningful predictions and adjustments |
| Feature flags system | Complete | Gating rollout |
| Streaming API support | Needs implementation | Chat UX |

### Rollout Strategy

1. **Alpha** (internal): Full trainer for Kwadwo only, with Whoop integration
2. **Beta**: Trainer chat + predictions for select users, no Whoop
3. **V1 Launch**: Full trainer (chat + adaptive periodization + predictions + risk scoring)
4. **V2**: Whoop integration for all users, advanced analytics

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | Converted to vision document. Split into 4 sub-PRDs: ai-conversational-trainer, ai-adaptive-periodization, ai-predictive-analytics, ai-recovery-integration. Updated model references to Claude Sonnet 4.6. |
