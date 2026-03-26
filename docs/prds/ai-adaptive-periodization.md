# AI Adaptive Periodization Engine

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-26
> **Priority:** P3
> **Roadmap Phase:** Phase 4 - Advanced AI
> **Parent:** [`ai-personal-trainer.md`](ai-personal-trainer.md) (vision doc)

---

## 1. Problem Statement

Training programs in SetFlow are currently static. Once generated (manually or via AI in PRD 1), the program never changes unless the user manually edits it. This means:

- When a user consistently exceeds RPE targets (program is too easy), nothing adjusts.
- When a user's performance degrades across weeks (accumulated fatigue), no deload is prescribed.
- When exercises stale after 6+ weeks, no rotation happens.
- When a mesocycle ends, the user must manually create or generate a new program.
- When life disrupts training (missed sessions, travel), the program doesn't redistribute remaining volume.

Real coaching involves continuous adjustment based on how the athlete responds. SetFlow's AI Workout Copilot (PRD 2) handles in-session suggestions, but week-to-week program adaptation requires a separate system that analyzes multi-week trends and modifies the program structure itself.

---

## 2. Proposed Solution

An adaptive periodization engine that automatically adjusts the user's training program on a weekly basis, based on actual performance data. The engine runs as a background analysis (triggered at the start of each training week) and presents proposed changes for user approval.

### Core Behaviors

1. **Weekly Volume Auto-Regulation**: Compares target RPE to actual RPE across the week. If RPE consistently exceeds targets, reduce volume or intensity for next week. If RPE is consistently below targets, increase.

2. **Exercise Rotation**: After 4-6 weeks of the same exercises, suggests swapping for variations that target the same muscle groups. Rotation respects equipment availability and injury constraints.

3. **Deload Auto-Scheduling**: Detects accumulated fatigue markers (RPE trending up, rep performance trending down, rest times increasing) and prescribes deload weeks proactively, rather than waiting for scheduled deload.

4. **Mesocycle Transitions**: When a mesocycle ends, automatically generates the next training block based on what the previous block achieved and the user's long-term goal.

5. **Missed Session Redistribution**: When the user misses a planned session, the engine redistributes the most important training stimulus across remaining sessions that week.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Adjustment acceptance rate | >50% of proposed adjustments accepted | Track accept vs. dismiss per adjustment |
| Deload compliance | >80% of prescribed deloads followed | Track deload adherence |
| PR frequency improvement | +20% more PRs per month vs. static programs | Compare PR rate for adaptive vs. non-adaptive users |
| Overtraining reduction | RPE 10 sessions decrease by 30% | Track RPE 10 frequency before/after |
| User retention impact | +20% 60-day retention for adaptive users | Cohort comparison |
| Mesocycle transition rate | >70% of users accept AI-generated next mesocycle | Track mesocycle end to new program generation |

---

## 4. Requirements

### Must Have
- [ ] Weekly program adjustment analysis (runs at start of each training week)
- [ ] Volume auto-regulation based on RPE trends
- [ ] Deload auto-detection from fatigue markers
- [ ] Adjustment preview UI with current vs. proposed diff
- [ ] Accept/dismiss per adjustment (not all-or-nothing)
- [ ] ProgramAdjustment stored in IndexedDB for history
- [ ] Feature gated behind `AI_ADAPTIVE_PERIODIZATION` flag

### Should Have
- [ ] Exercise rotation suggestions after 4-6 weeks
- [ ] Mesocycle transition: auto-generate next block when current ends
- [ ] Missed session redistribution
- [ ] "Adjusted" badge on exercise cards when trainer modified the program
- [ ] Weekly adjustment notification (via trainer FAB glow)
- [ ] Adjustment reasoning visible (why this change was proposed)

### Won't Have (This Version)
- [ ] Real-time mid-session program changes (handled by copilot PRD 2)
- [ ] Recovery-aware adjustments (see ai-recovery-integration PRD)
- [ ] Nutrition-aware volume adjustments
- [ ] User-defined periodization constraints (advanced)

---

## 5. User Flows

### Flow 1: Weekly Program Adjustment

1. Monday morning: user opens SetFlow
2. System detects new training week started
3. Background analysis runs: compares last week's actual performance to targets
4. System generates adjustment proposal (e.g., "Increase bench to 87.5kg, add 1 set to OHP")
5. Trainer FAB glows (pending notification)
6. User taps FAB or navigates to program view
7. "Weekly Program Adjustment" card appears with diff view
8. Card shows: exercise name, current value, proposed value, reasoning
9. User can "Accept All", "Review Each" (per-exercise accept/dismiss), or "Dismiss All"
10. Accepted changes applied to program in IndexedDB
11. Exercises that were adjusted show "Adjusted" badge in workout view

### Flow 2: Deload Detection

1. System analyzes 4-week trend: RPE trending up (7.5 to 8.5), reps trending down, rest times up
2. At start of week 5, system proposes: "Your fatigue markers suggest a deload week"
3. Deload proposal: reduce all working weights to 60%, maintain set count, reduce total sets by 40%
4. Specific deload program shown in preview
5. User taps "Accept Deload" or "Skip Deload" (with warning)
6. If accepted, program temporarily modified for the week

### Flow 3: Mesocycle Transition

1. User completes final week of 8-week mesocycle
2. "Mesocycle Complete" screen shows summary: PRs hit, exercises that progressed, areas that stalled
3. System proposes next mesocycle based on what worked
4. Next block preview: new exercises, adjusted targets, different periodization focus
5. User reviews and taps "Start Next Block" or "Generate Different"

### Flow 4: Missed Session Redistribution

1. User planned 4 sessions this week but missed Wednesday (Lower Body)
2. System detects missed session by Thursday
3. Proposes redistribution: "Move most important lower body exercises (Squat, RDL) to Friday's session as additional work"
4. Shows proposed Friday session with additions
5. User accepts or dismisses

---

## 6. Technical Spec

### Architecture

```
Start of training week (or missed session detected)
            |
            v
+------------------------+
| Performance Analyzer   | -- Last week: actual RPE vs target, volume, reps
+----------+-------------+
           |
           v
+------------------------+
| Fatigue Detector       | -- Multi-week trends: RPE, rest times, rep performance
+----------+-------------+
           |
           v
+------------------------+
| Adjustment Generator   | -- Proposes changes based on analysis + AI reasoning
| (Claude 4.5 Haiku)    |
+----------+-------------+
           |
           v
+------------------------+
| Adjustment Preview     | -- Diff view for user approval
+------------------------+
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/adaptive-periodizer.ts` | Core engine: performance analysis, fatigue detection, adjustment generation |
| `/src/lib/ai/performance-analyzer.ts` | Compares actual vs. target RPE/volume/reps per exercise |
| `/src/lib/ai/fatigue-detector.ts` | Multi-week trend analysis for deload detection |
| `/src/lib/ai/prompts/periodization-prompt.ts` | AI prompt for adjustment reasoning and exercise rotation |
| `/src/components/trainer/weekly-adjustment.tsx` | Adjustment preview with diff view |
| `/src/components/trainer/deload-suggestion.tsx` | Deload recommendation card |
| `/src/components/trainer/mesocycle-complete.tsx` | Mesocycle summary and next block proposal |
| `/src/app/api/ai/trainer/adjust/route.ts` | API route for adjustment generation |

### Files to Modify

| File | Change |
|------|--------|
| `/src/lib/db.ts` | Add `ProgramAdjustment` interface and table |
| `/src/lib/queries.ts` | Add `useProgramAdjustments()`, `useWeeklyAnalysis()` hooks |
| `/src/components/workout/exercise-card.tsx` | Show "Adjusted" badge when program was modified |
| `/src/lib/feature-flags.ts` | Add `AI_ADAPTIVE_PERIODIZATION` feature flag |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model | Claude 4.5 Haiku (claude-haiku-4-5-20251001) for adjustment reasoning |
| Input tokens | ~1,500 (weekly performance data + current program) |
| Output tokens | ~500 (adjustment proposals with reasoning) |
| Frequency | 1 analysis per week per user (low cost) |
| Cost per week | ~$0.005 per user |
| Background trigger | On app open after new week starts |

---

## 7. Design

### Weekly Adjustment Preview

```
+- Weekly Program Adjustment ---------------------+
|  Week 6 of 8 - Adjusted for performance         |
+--------------------------------------------------+
|                                                  |
|  Changes from last week:                         |
|                                                  |
|  Upper Push:                                     |
|   Bench Press:   85kg x 4x10                     |
|                  -> 87.5kg x 4x8-10              |
|   OHP:           50kg x 3x10                     |
|                  -> 50kg x 4x8  (+1 set)         |
|                                                  |
|  Lower Body:                                     |
|   Squat:         100kg x 4x8                     |
|                  -> 100kg x 4x6-8                |
|                  (RPE was 9.5 last week)          |
|                                                  |
|  [Accept All]  [Review Each]  [Dismiss]          |
+--------------------------------------------------+
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| WeeklyAdjustment | `weekly-adjustment.tsx` | Diff view with per-exercise accept/dismiss |
| DeloadSuggestion | `deload-suggestion.tsx` | Deload recommendation with Accept/Skip |
| MesocycleComplete | `mesocycle-complete.tsx` | Summary + next block proposal |

### Visual Spec

| Element | Value |
|---------|-------|
| Adjustment card bg | #1A1A1A, 12px radius |
| Current value | #A0A0A0, strikethrough |
| Proposed value | #CDFF00, bold |
| Reasoning text | #A0A0A0, 14px italic |
| Accept button | #CDFF00 bg, #0A0A0A text |
| Dismiss button | #2A2A2A bg, #A0A0A0 text |
| "Adjusted" badge | Small pill, #CDFF00 bg, #0A0A0A text, 10px font |
| Deload card accent | #F59E0B (warning tone) |
| Font | Inter, 16px body, 14px details |
| Touch targets | 44px minimum |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Conversational trainer (PRD ai-conversational-trainer) shipped and stable
- [ ] Workout history queries support multi-week aggregation
- [ ] Program data model supports versioning (track adjustments)
- [ ] Copilot suggestion history available for plateau data

### Build Order

1. **Create performance analyzer** - compares actual vs. target RPE/volume/reps
2. **Create fatigue detector** - multi-week trend analysis for deload detection
3. **Create periodization prompt** - AI prompt for adjustment reasoning
4. **Create API route** - `/src/app/api/ai/trainer/adjust/route.ts`
5. **Create adaptive periodizer** - orchestrates analysis, detection, AI call
6. **Create weekly adjustment component** - diff view UI
7. **Create deload suggestion component** - deload-specific UI
8. **Create mesocycle complete component** - summary and next block
9. **Add DB table** - ProgramAdjustment in `db.ts`
10. **Integrate with app open** - trigger weekly analysis check
11. **Add "Adjusted" badge** - modify exercise-card.tsx
12. **Add feature flag** - `AI_ADAPTIVE_PERIODIZATION`

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User overrides all AI adjustments for 3+ weeks | Ask: "Would you prefer less aggressive changes or a different adjustment style?" |
| Insufficient data (less than 2 weeks of history) | Skip adjustment; show "Adaptive adjustments activate after 2 weeks of consistent training" |
| User manually edited program mid-week | Analyze only completed sessions; don't propose changes to exercises user just modified |
| Deload prescribed but user feels fine | Allow "Skip Deload" with warning: "Skipping deloads can lead to overtraining. Consider a lighter week soon." |
| Mesocycle completed early (user skipped weeks) | Adjust mesocycle summary to reflect actual completed weeks |
| Conflicting signals (some exercises progressing, others stalling) | Per-exercise adjustments, not global; explain mixed signals in reasoning |
| User on vacation (0 sessions for 1+ weeks) | Detect gap; on return, suggest return-to-training protocol before resuming adjustments |
| Program has custom exercises (not in standard DB) | Include in analysis if they have logged sets; skip form-specific suggestions |

---

## 10. Testing

### Functional Tests
- [ ] Weekly analysis triggers on first app open of new week
- [ ] Volume auto-regulation: RPE consistently low -> suggests increase
- [ ] Volume auto-regulation: RPE consistently high -> suggests decrease
- [ ] Deload detection: 4-week fatigue trend -> proposes deload
- [ ] Exercise rotation: suggests swap after 6 weeks of same exercise
- [ ] Mesocycle transition: summary + next block generated at mesocycle end
- [ ] Missed session: redistribution proposed within 24 hours
- [ ] Accept adjustment: program updated in IndexedDB
- [ ] Dismiss adjustment: program unchanged, adjustment logged
- [ ] "Review Each": per-exercise accept/dismiss works correctly
- [ ] "Adjusted" badge appears on modified exercises
- [ ] Insufficient data (<2 weeks): no adjustments proposed

### UI Verification
- [ ] Adjustment card shows clear diff (current strikethrough, proposed #CDFF00)
- [ ] Reasoning text visible and helpful
- [ ] Accept/Dismiss buttons meet 44px touch targets
- [ ] Deload card uses #F59E0B accent
- [ ] "Adjusted" badge renders as small pill (#CDFF00)
- [ ] Dark theme (#0A0A0A bg, #1A1A1A cards) consistent
- [ ] Mesocycle complete screen shows clear summary

---

## 11. Launch Checklist

- [ ] Feature flag `AI_ADAPTIVE_PERIODIZATION` added and tested
- [ ] Conversational trainer (dependency) shipped and stable
- [ ] Weekly analysis tested over 4+ simulated weeks
- [ ] Deload detection validated against known fatigue patterns
- [ ] Adjustment reasoning quality reviewed for 10+ scenarios
- [ ] ProgramAdjustment table created in IndexedDB
- [ ] "Adjusted" badge visible and non-intrusive
- [ ] Tested on iOS Safari PWA mode
- [ ] Tested on Chrome Android
- [ ] Cost per user per week verified (~$0.005)
- [ ] Background analysis does not block app startup

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adjustments feel too aggressive | Users reject and disable feature | Conservative defaults; show reasoning; allow style preference (conservative/moderate/aggressive) |
| AI proposes bad deload timing | User deloads when they should push | Require minimum fatigue signal strength (multiple markers, not just one) |
| Constant program changes confuse users | Decision fatigue, abandonment | Max 3-4 changes per week; group logically; always show reasoning |
| Mesocycle transition quality poor | Users lose trust in AI programming | Use same generation quality as PRD 1; include performance data from completed block |
| Background analysis impacts app performance | Slow app startup | Run analysis async; cache results; only re-analyze when new data exists |
| User trains inconsistently (1-2 sessions/week) | Insufficient data for adaptation | Require 2+ sessions/week for 2+ weeks before activating; communicate threshold |
| Exercise rotation suggests unfamiliar exercises | User confused or uncomfortable | Only rotate to exercises in the database with matching equipment; show video links |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| ai-conversational-trainer (P2) | Ships first | Trainer UI, context engine, FAB |
| PRD 1: AI Program Generation | Required | Program data model, AI infrastructure |
| PRD 2: AI Workout Copilot | Recommended | Plateau/suggestion history data |
| Workout history (4+ weeks per user) | Per-user | Meaningful trend analysis |
| Feature flags system | Complete | Gating rollout |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Weekly performance summary | Sent to Claude API for adjustment reasoning | Not stored by API |
| Current program structure | Sent to Claude API | Not stored by API |
| Adjustment proposals | Stored in IndexedDB | Linked to program, until user deletes |
| Accept/dismiss history | Stored in IndexedDB | For preference learning |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Initial draft - split from ai-personal-trainer.md vision doc. Full 14-section PRD. |
