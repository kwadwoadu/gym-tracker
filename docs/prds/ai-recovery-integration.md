# AI Recovery Integration (Whoop)

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-26
> **Priority:** P3
> **Roadmap Phase:** Phase 4 - Advanced AI
> **Parent:** [`ai-personal-trainer.md`](ai-personal-trainer.md) (vision doc)

---

## 1. Problem Statement

SetFlow programs train users based on a fixed schedule without awareness of their recovery state. A user who slept 4 hours, has low HRV, and a Whoop recovery score of 30% (red) is expected to train at the same intensity as when they're at 90% (green). This disconnect between recovery and training leads to:

- Overtraining on low-recovery days (pushing when the body isn't ready)
- Under-training on high-recovery days (missing opportunity to push harder)
- Increased injury risk from training through fatigue
- Suboptimal adaptation (the body grows during recovery, not training)

Kwadwo already tracks recovery via Whoop through the AduOS health domain. SetFlow has access to this data but doesn't use it to inform training decisions.

---

## 2. Proposed Solution

Integration with Whoop recovery data (via AduOS health domain bridge) to make SetFlow's training recommendations recovery-aware. The system adjusts workout intensity, volume, and even session recommendations based on the user's daily recovery score, sleep quality, and weekly strain accumulation.

### Core Behaviors

1. **Pre-Session Recovery Check**: When the user opens a workout, check today's Whoop recovery score and display a banner:
   - Green (67-100%): "Recovery is strong. Great day to push for PRs or increase volume."
   - Yellow (34-66%): "Moderate recovery. Train as planned but consider reducing intensity ~10%."
   - Red (0-33%): "Low recovery. Recommend a light session or rest day. If training, reduce intensity 20-30%."

2. **Auto-Adjusted Workout**: For users who opt in, the system automatically adjusts the day's workout based on recovery:
   - Red: Reduce working weights by 20-30%, drop to 60% of programmed sets, suggest mobility work
   - Yellow: Reduce working weights by 10%, maintain programmed sets
   - Green: Train as programmed or suggest +5% intensity if green for 3+ consecutive days

3. **Sleep-Adjusted Intensity**: Separate from overall recovery, factor in specific sleep metrics:
   - <5 hours sleep: Suggest skipping or light session
   - 5-6 hours: Reduce intensity 15%
   - 6-7 hours: Reduce intensity 5%
   - 7+ hours: Train as programmed

4. **Weekly Strain Budget**: Track cumulative weekly strain and adjust remaining sessions:
   - If weekly strain is high relative to recovery capacity, recommend lighter remaining sessions
   - If strain is low and recovery is high, suggest adding volume or intensity

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Recovery check engagement | >60% of Whoop-connected users view recovery banner before workout | Track banner impressions |
| Auto-adjustment adoption | >40% of Whoop users enable auto-adjust | Track opt-in rate |
| RPE on low-recovery days | Average RPE decreases 1+ point on red days vs. without feature | Compare RPE on red days before/after |
| Injury reduction (self-reported) | -15% injury rate for recovery-aware users | In-app survey at 3 months |
| Training consistency | +10% session completion for Whoop users (training appropriate, not skipping) | Track session completion rate |
| User satisfaction | >4.5/5 rating for recovery integration | In-app rating after 4 weeks |

---

## 4. Requirements

### Must Have
- [ ] Whoop data bridge reading recovery score, sleep hours, HRV, weekly strain from AduOS health domain
- [ ] Pre-session recovery banner showing recovery score with color coding (green/yellow/red)
- [ ] Intensity adjustment recommendations based on recovery score
- [ ] Separate sleep-based adjustment layer
- [ ] User can dismiss recovery suggestion and train as planned
- [ ] Feature gated behind `AI_RECOVERY_INTEGRATION` flag
- [ ] Works only for users with Whoop connected via AduOS

### Should Have
- [ ] Auto-adjusted workout mode (opt-in): automatically modifies weights/sets
- [ ] Weekly strain budget tracking with remaining session recommendations
- [ ] Recovery trend display (last 7 days) in workout view
- [ ] Integration with conversational trainer ("Should I train today?" uses recovery data)
- [ ] Integration with adaptive periodization (deload triggered by sustained low recovery)
- [ ] "Rest day" suggestion with mobility/stretching routine on red days

### Won't Have (This Version)
- [ ] Direct Whoop API integration (reads from AduOS, not Whoop directly)
- [ ] Apple Health / Google Fit integration (Whoop only in V1)
- [ ] Sleep optimization recommendations
- [ ] Heart rate zone training suggestions
- [ ] Garmin, Oura, or other wearable support

---

## 5. User Flows

### Flow 1: Pre-Session Recovery Check (Green)

1. User taps "Start Workout" for Upper Push day
2. System reads today's Whoop recovery from AduOS health domain
3. Recovery: 89% (green), Sleep: 7.5 hours, HRV: 65ms
4. Banner shows: "Recovery is 89% (green). Great day to push for PRs."
5. User taps "Start Workout" - trains at programmed intensity

### Flow 2: Low Recovery Warning (Red)

1. User taps "Start Workout" for Lower Body day
2. Recovery: 28% (red), Sleep: 4.5 hours, HRV: 35ms
3. Banner shows: "Recovery is 28% (red). Recommend a light session or rest day."
4. Two options: "Adjust Workout" or "Train as Planned"
5. User taps "Adjust Workout"
6. System reduces all working weights by 25%, drops programmed sets by 40%
7. Optional: suggests replacing heavy compounds with mobility/light accessories
8. Adjusted workout shown with changes highlighted

### Flow 3: Auto-Adjusted Workout (Opt-in)

1. User has enabled "Auto-adjust based on recovery" in Settings
2. User opens workout view on a yellow (52%) recovery day
3. Workout is pre-adjusted: weights reduced 10%, volume unchanged
4. "Adjusted for recovery" badge visible on modified exercises
5. User can still manually override any adjustment

### Flow 4: Weekly Strain Budget

1. It's Thursday; user has trained 3 sessions this week with high intensity
2. Weekly strain: 18.5 (high relative to recovery capacity)
3. Friday's session shows strain budget note: "Weekly strain is elevated. Consider a moderate session (RPE <7)."
4. Recommendation integrates with existing workout plan

### Flow 5: Whoop Not Connected

1. User without Whoop taps "Start Workout"
2. No recovery banner shown
3. In Settings > Recovery Integration: "Connect Whoop via AduOS for recovery-aware training"
4. Link to AduOS Whoop setup instructions

---

## 6. Technical Spec

### Architecture

```
User opens workout / taps "Start Workout"
            |
            v
+------------------------+
| Whoop Bridge           | -- Reads from AduOS health domain
| (whoop-bridge.ts)      |    /domains/health/ via file or API
+----------+-------------+
           |
           v
+------------------------+
| Recovery Analyzer      | -- Score interpretation, sleep adjustment, strain calc
+----------+-------------+
           |
     +-----+------+
     |             |
     v             v
[Banner only]  [Auto-adjust]
     |             |
     v             v
Show banner    Modify workout
+ recommend    weights/sets
               in memory
```

### Whoop Data Interface

```typescript
interface WhoopRecoveryData {
  date: string;
  recoveryScore: number; // 0-100
  recoveryState: 'red' | 'yellow' | 'green';
  sleepHours: number;
  sleepQuality: number; // 0-100
  hrv: number; // milliseconds
  restingHeartRate: number;
  weeklyStrain: number;
  strainTrend: number[]; // last 7 days
  recoveryTrend: number[]; // last 7 days
}

interface RecoveryAdjustment {
  weightMultiplier: number; // 0.7 = reduce 30%, 1.0 = no change, 1.05 = increase 5%
  setMultiplier: number; // 0.6 = reduce 40%, 1.0 = no change
  recommendation: string;
  severity: 'skip' | 'light' | 'moderate' | 'push';
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/whoop-bridge.ts` | Reads Whoop data from AduOS health domain |
| `/src/lib/ai/recovery-analyzer.ts` | Interprets recovery score, sleep, strain into training adjustments |
| `/src/lib/ai/prompts/recovery-prompt.ts` | AI prompt for recovery-aware training advice (trainer integration) |
| `/src/components/workout/recovery-banner.tsx` | Pre-session recovery status banner |
| `/src/components/workout/recovery-adjusted-badge.tsx` | Badge on adjusted exercises |
| `/src/components/trainer/strain-budget.tsx` | Weekly strain budget display |
| `/src/hooks/use-recovery.ts` | Hook for fetching and caching recovery data |
| `/src/app/api/ai/recovery/route.ts` | API route for recovery-enhanced trainer responses |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/workout/workout-header.tsx` | Add recovery banner before workout starts |
| `/src/components/workout/exercise-card.tsx` | Show "Adjusted for recovery" badge |
| `/src/app/workout/page.tsx` | Recovery check before session start |
| `/src/lib/db.ts` | Add `RecoveryLog` interface for caching daily recovery data |
| `/src/lib/feature-flags.ts` | Add `AI_RECOVERY_INTEGRATION` feature flag |
| `/src/app/settings/page.tsx` | Add recovery integration toggle and Whoop connection status |

### Data Source

| Requirement | Detail |
|-------------|--------|
| Data source | AduOS health domain (`/domains/health/`) via file read or local API |
| Whoop sync | Handled by AduOS Whoop integration (not this PRD) |
| Data freshness | Read on app open; cache for the session |
| Fallback | If AduOS data unavailable, silently disable recovery features |
| No direct API | SetFlow never calls Whoop API directly |

---

## 7. Design

### Recovery Banner (Pre-Session)

```
+-------------------------------------------+
|  Recovery Check                     [x]   |
|                                           |
|  [GREEN CIRCLE 89%]                       |
|  Recovery: 89% (Green)                    |
|  Sleep: 7.5h | HRV: 65ms                 |
|                                           |
|  Great day to push for PRs or             |
|  increase volume.                         |
|                                           |
|  [Start Workout]                          |
+-------------------------------------------+
```

```
+-------------------------------------------+
|  Recovery Check                     [x]   |
|                                           |
|  [RED CIRCLE 28%]                         |
|  Recovery: 28% (Red)                      |
|  Sleep: 4.5h | HRV: 35ms                 |
|                                           |
|  Low recovery. Recommend light            |
|  session or rest day.                     |
|                                           |
|  [Adjust Workout]  [Train as Planned]     |
+-------------------------------------------+
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| RecoveryBanner | `recovery-banner.tsx` | Pre-session recovery display with action buttons |
| RecoveryAdjustedBadge | `recovery-adjusted-badge.tsx` | Small badge on adjusted exercises |
| StrainBudget | `strain-budget.tsx` | Weekly strain summary with recommendation |
| useRecovery | `use-recovery.ts` | Hook for recovery data and adjustment calculation |

### Visual Spec

| Element | Value |
|---------|-------|
| Banner bg | #1A1A1A, 12px radius |
| Recovery circle (green) | #22C55E, 64px diameter, score in center |
| Recovery circle (yellow) | #F59E0B, 64px diameter |
| Recovery circle (red) | #EF4444, 64px diameter |
| Recovery score text | 24px bold Inter, white |
| Sleep/HRV text | 14px Inter, #A0A0A0 |
| Recommendation text | 16px Inter, white |
| "Adjust Workout" button | #CDFF00 bg, #0A0A0A text |
| "Train as Planned" button | #2A2A2A bg, #A0A0A0 text |
| Adjusted badge | Small pill: "Adjusted for recovery" in #F59E0B, 10px font |
| Strain budget bar | Horizontal bar, fill color matches recovery state |
| Font | Inter, 16px body |
| Touch targets | 44px minimum |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] AduOS Whoop integration functional and providing recovery data
- [ ] AduOS health domain data accessible from SetFlow context
- [ ] Conversational trainer shipped (for integration)
- [ ] Adaptive periodization shipped (for deload trigger integration)

### Build Order

1. **Create Whoop bridge** - `/src/lib/ai/whoop-bridge.ts` reading from AduOS health domain
2. **Create recovery analyzer** - `/src/lib/ai/recovery-analyzer.ts` with score interpretation, adjustment calculation
3. **Create useRecovery hook** - fetches and caches daily recovery data
4. **Create recovery banner** - `recovery-banner.tsx` with color-coded display
5. **Create adjusted badge** - `recovery-adjusted-badge.tsx` for exercise cards
6. **Create strain budget** - `strain-budget.tsx` for weekly view
7. **Integrate with workout page** - recovery check before session start
8. **Integrate with exercise card** - show adjusted badge
9. **Create recovery prompt** - for conversational trainer integration
10. **Create recovery API route** - for trainer-enhanced responses
11. **Add Settings toggle** - recovery integration on/off, Whoop connection status
12. **Add DB table** - RecoveryLog for caching daily data
13. **Add feature flag** - `AI_RECOVERY_INTEGRATION`

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Whoop data unavailable (AduOS down, Whoop not synced) | Silently disable recovery features; no error shown; train as normal |
| Whoop battery dead (no data for today) | Use most recent data if <24 hours old; otherwise disable |
| Recovery score contradicts how user feels | Always allow "Train as Planned" override; trainer acknowledges: "Your recovery score is low but you feel good? That's fine - listen to your body." |
| Consistently red recovery (chronic stress, poor sleep) | After 5+ red days: suggest trainer conversation about recovery habits rather than just adjusting workouts |
| Very high strain + green recovery | Unusual combination; trust recovery score but note strain |
| User trains twice in one day | Apply recovery check to first session only; second session uses same data |
| Auto-adjust reduces weights below minimum useful load | Set floor at 50% of programmed weight; never adjust below |
| User disconnects Whoop | Feature gracefully disables; show "Reconnect Whoop" in settings |
| Recovery data is stale (>24 hours old) | Show warning: "Recovery data is from yesterday. For accurate recommendations, sync your Whoop." |

---

## 10. Testing

### Functional Tests
- [ ] Whoop bridge reads recovery data from AduOS health domain
- [ ] Recovery banner shows correct color (green/yellow/red) for score ranges
- [ ] Recovery score, sleep hours, HRV displayed correctly
- [ ] Green recovery: no adjustment recommended
- [ ] Yellow recovery: 10% intensity reduction suggested
- [ ] Red recovery: 20-30% intensity reduction + set reduction suggested
- [ ] Sleep adjustment layer: <5 hours suggests skip/light
- [ ] "Adjust Workout" modifies weights and sets correctly
- [ ] "Train as Planned" proceeds with no changes
- [ ] Auto-adjust (opt-in): workout pre-adjusted on load
- [ ] Auto-adjust: user can manually override individual exercises
- [ ] Weekly strain budget calculates from last 7 days
- [ ] Whoop unavailable: recovery features silently disabled
- [ ] Recovery data cached for session duration
- [ ] Settings toggle enables/disables recovery integration
- [ ] Whoop connection status shown in Settings

### UI Verification
- [ ] Recovery circle uses correct color for score range
- [ ] Recovery circle is 64px with score centered
- [ ] Banner bg #1A1A1A, 12px radius
- [ ] "Adjust Workout" button #CDFF00
- [ ] "Train as Planned" button #2A2A2A
- [ ] Adjusted badge visible but not intrusive (#F59E0B pill)
- [ ] Dark theme consistent throughout
- [ ] Touch targets 44px minimum
- [ ] Banner dismissible with X

---

## 11. Launch Checklist

- [ ] Feature flag `AI_RECOVERY_INTEGRATION` added and tested
- [ ] AduOS Whoop bridge tested with real recovery data
- [ ] Recovery analyzer tested across all score ranges (red/yellow/green)
- [ ] Auto-adjust mode tested end-to-end
- [ ] Weekly strain budget calculation validated
- [ ] Recovery banner renders correctly on all workout types
- [ ] Settings page shows Whoop connection status
- [ ] Fallback tested: Whoop unavailable = silent disable
- [ ] Tested on iOS Safari PWA mode
- [ ] Tested on Chrome Android
- [ ] No Whoop API keys in SetFlow codebase (data via AduOS only)
- [ ] Privacy: recovery data never sent to Claude API unless trainer conversation active

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AduOS Whoop integration unreliable | Feature frequently unavailable | Graceful fallback; cache last-known data; show stale data warning |
| Recovery score doesn't match user's subjective feeling | User ignores feature | Always allow override; frame as "data point, not command" |
| Over-reliance on recovery score | Users skip training on yellow days | Moderate recommendations: yellow = reduce, not skip; frame positively |
| Auto-adjust too aggressive | Users feel their workout is being controlled | Conservative defaults; opt-in only; per-exercise override available |
| Whoop-only excludes most users | Limited feature adoption | V1 is Whoop-only; V2 can add Apple Health, Garmin, Oura; manual recovery input option |
| Privacy concerns about health data in workout app | User distrust | Clear consent; recovery data stays local; only sent to AI if user initiates trainer conversation |
| Integration maintenance burden | AduOS health domain changes break bridge | Abstract behind `whoop-bridge.ts`; minimal coupling; version the interface |
| Chronic low recovery alerts | Alert fatigue | After 5+ red days, shift from workout adjustment to recovery habit conversation |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| AduOS Whoop integration | Available | Recovery data source |
| AduOS health domain | Available | Data bridge |
| ai-conversational-trainer (P2) | Ships first | Trainer integration |
| ai-adaptive-periodization (P3) | Recommended | Deload trigger integration |
| Feature flags system | Complete | Gating rollout |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Whoop recovery score | Read from AduOS; cached locally in IndexedDB | Daily, refreshed on app open |
| Sleep/HRV data | Read from AduOS; cached locally | Daily, refreshed on app open |
| Strain data | Read from AduOS; cached locally | Weekly rolling window |
| Recovery adjustments | Stored in IndexedDB | Linked to workout log |
| Recovery data to AI | Only when user asks trainer about recovery | Not stored by API |

### User Consent
- First use: "SetFlow will use your Whoop recovery data to adjust training intensity. Data stays on your device."
- Separate from Whoop connection consent (handled by AduOS)

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Initial draft - split from ai-personal-trainer.md vision doc. Full 14-section PRD with Whoop bridge, recovery analyzer, and auto-adjustment specs. |
