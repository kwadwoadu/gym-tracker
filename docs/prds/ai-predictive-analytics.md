# AI Predictive Analytics

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-26
> **Priority:** P3
> **Roadmap Phase:** Phase 4 - Advanced AI
> **Parent:** [`ai-personal-trainer.md`](ai-personal-trainer.md) (vision doc)

---

## 1. Problem Statement

SetFlow tracks workout data but doesn't use it to predict future outcomes. Users have no idea when they'll hit their next PR, whether they're on track for their goals, or if their current training patterns put them at risk for injury. They can look at historical charts, but interpreting trends and extrapolating them into actionable predictions requires expertise most gym-goers don't have.

Without predictive capability:
- Users don't know if their current rate of progression will meet their goals
- Overtraining creeps up unnoticed until injury or burnout occurs
- Muscle imbalances develop silently (pushing volume far exceeding pulling volume)
- Users can't plan meaningful goals ("I want to bench 100kg") without knowing if it's realistic

---

## 2. Proposed Solution

A predictive analytics system that uses historical training data to forecast personal records, detect injury risk patterns, score training consistency, and identify fatigue trends. Predictions are surfaced as cards on the dashboard, in the stats page, and through the conversational trainer.

### Core Capabilities

1. **PR Prediction**: Based on historical progression rate per exercise, predict when the user will hit target milestones (e.g., "100kg bench in ~4 weeks based on +1.8kg/week average").

2. **Injury Risk Scoring**: Analyze training patterns for known risk factors:
   - Volume spikes (>30% weekly increase in any muscle group)
   - Push/pull imbalance (anterior/posterior ratio > 1.5:1)
   - High RPE streaks (3+ sessions at RPE 9-10 on the same exercise)
   - Missing movement patterns (no single-leg, no hinge, no carry work in 4+ weeks)

3. **Consistency Scoring**: Track adherence to planned program:
   - Sessions per week vs. target
   - Monthly volume record tracking
   - Streak tracking (consecutive weeks meeting session target)

4. **Fatigue Forecasting**: Based on current volume and RPE trends, predict when a deload will be needed:
   - "Based on your current trajectory, you'll need a deload in approximately 2 weeks"
   - Feeds into the adaptive periodization engine (separate PRD)

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| PR prediction accuracy | Within 2 weeks of predicted date, >60% of the time | Compare prediction dates to actual PR dates |
| Injury risk alert accuracy | >70% of flagged risks acknowledged by user | Track alert shown vs. user action |
| Risk alert engagement | >50% of users view risk alert details | Track alert card expansion |
| Prediction card views | >3 views per user per week | Track dashboard card interactions |
| User retention impact | +10% 30-day retention for users with predictions visible | Cohort comparison |
| Fatigue forecast accuracy | Deload need predicted within 1 week of actual performance drop | Compare forecast to actual RPE spike |

---

## 4. Requirements

### Must Have
- [ ] PR prediction per exercise (estimated date to reach target weight)
- [ ] Prediction confidence indicator (high/medium/low based on data quality)
- [ ] Injury risk scoring with 4 risk factors (volume spikes, imbalances, high RPE, missing patterns)
- [ ] Risk alert card on dashboard when risk factors detected
- [ ] Consistency score (sessions/week vs. target, streak)
- [ ] Feature gated behind `AI_PREDICTIVE_ANALYTICS` flag
- [ ] All calculations run locally (no API call needed for basic predictions)

### Should Have
- [ ] Fatigue forecasting (predict deload need)
- [ ] Volume milestone tracking (monthly/total records)
- [ ] PR prediction chart (visual projection line on weight progression chart)
- [ ] Risk alert details expandable (explain which muscle groups, what ratio)
- [ ] Integration with conversational trainer (trainer can reference predictions)
- [ ] Risk alert dismissal with "Acknowledge" to prevent repeat alerts

### Won't Have (This Version)
- [ ] Body composition predictions (weight loss/gain trajectory)
- [ ] Competition peaking prediction
- [ ] Social comparison (how user compares to population)
- [ ] Machine learning model (use statistical regression for V1)

---

## 5. User Flows

### Flow 1: PR Prediction on Dashboard

1. User opens SetFlow home page
2. Dashboard shows "PR Prediction" card for their top 3 lifts
3. Card shows: exercise name, target weight, estimated date, confidence, current best
4. Example: "Bench Press: 100kg - ~4 weeks (Mar 28) - High confidence"
5. User taps card to see details: progression chart with projected line
6. Chart shows actual data points + dotted projection line to target

### Flow 2: Injury Risk Alert

1. System runs weekly analysis and detects: chest volume +38% vs. 4-week average
2. Red alert card appears on dashboard: "Injury Risk Alert - Chest volume spike"
3. User taps to expand: "This week: 24 sets (+38% vs. average). Rapid volume increases correlate with overuse injuries."
4. Recommendation: "Cap chest at 18 sets next week to reduce risk."
5. User taps "Adjust Program" (routes to adaptive periodization) or "Acknowledge" (dismisses alert)

### Flow 3: Consistency Score

1. User navigates to stats page
2. "Training Consistency" section shows:
   - This week: 3/4 sessions (75%)
   - This month: 14/16 sessions (88%)
   - Current streak: 6 consecutive weeks at target
   - Volume milestone: "You completed 500 total sets this month - a new monthly record!"
3. Weekly consistency shown as small calendar heatmap

### Flow 4: Fatigue Forecast

1. System detects RPE trending up over 3 weeks (7.2, 7.8, 8.4 weekly average)
2. Fatigue forecast card: "Based on current trends, you'll benefit from a deload in ~2 weeks"
3. If adaptive periodization PRD is active, links to proposed deload
4. If not, shows general deload guidelines

---

## 6. Technical Spec

### Architecture

```
Weekly analysis trigger (app open, new week)
            |
            v
+---------------------------+
|  Data Aggregator          | -- Pull 8 weeks of workout data from IndexedDB
+----------+----------------+
           |
           v
+---------------------------+
|  Statistical Analysis     | -- Linear regression, trend detection, ratio calc
|  (100% on-device)        |
+----------+----------------+
           |
     +-----+------+----------+----------+
     |             |          |          |
     v             v          v          v
PR Predict    Risk Score   Consist.   Fatigue
   |             |          Score     Forecast
   v             v          |          |
Dashboard    Alert Card     v          v
   Card                   Stats     Forecast
                          Page       Card
```

### PR Prediction Algorithm

```typescript
interface PRPrediction {
  exerciseId: string;
  exerciseName: string;
  currentBest: { weight: number; reps: number; date: string };
  targetWeight: number;
  estimatedDate: string;
  confidence: 'high' | 'medium' | 'low';
  weeklyProgressionRate: number; // kg/week average
  dataPoints: number; // weeks of data used
}

// Confidence levels:
// high: 6+ weeks of consistent data, R-squared > 0.7
// medium: 4-5 weeks of data, R-squared 0.4-0.7
// low: 2-3 weeks of data, R-squared < 0.4
// insufficient: <2 weeks - no prediction shown
```

### Injury Risk Schema

```typescript
interface InjuryRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  factors: {
    volumeSpikes: { muscleGroup: string; increasePercent: number; }[];
    imbalances: { type: string; ratio: number; threshold: number; }[];
    highRPEStreaks: { exercise: string; sessions: number; avgRPE: number; }[];
    missingPatterns: { pattern: string; weeksMissing: number; }[];
  };
  recommendations: string[];
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/predictive-analytics.ts` | Core analytics: PR prediction, risk scoring, consistency, fatigue |
| `/src/lib/ai/pr-predictor.ts` | Linear regression on weight progression per exercise |
| `/src/lib/ai/injury-risk-scorer.ts` | Risk factor detection from training patterns |
| `/src/lib/ai/consistency-scorer.ts` | Session adherence and streak tracking |
| `/src/lib/ai/fatigue-forecaster.ts` | RPE/volume trend extrapolation for deload prediction |
| `/src/components/trainer/prediction-card.tsx` | PR prediction card with projected date |
| `/src/components/trainer/risk-alert.tsx` | Injury risk alert banner with expand/details |
| `/src/components/stats/consistency-score.tsx` | Consistency display with heatmap |
| `/src/components/stats/prediction-chart.tsx` | Weight progression chart with projection line |

### Files to Modify

| File | Change |
|------|--------|
| `/src/app/page.tsx` | Add prediction cards and risk alerts to dashboard |
| `/src/app/stats/page.tsx` | Add consistency score and prediction chart sections |
| `/src/lib/db.ts` | Add `Prediction`, `RiskAlert` interfaces and tables |
| `/src/lib/queries.ts` | Add `usePredictions()`, `useRiskAlerts()`, `useConsistency()` hooks |
| `/src/lib/feature-flags.ts` | Add `AI_PREDICTIVE_ANALYTICS` feature flag |

### Processing Requirements

| Requirement | Detail |
|-------------|--------|
| Processing | 100% on-device (no API calls for V1) |
| Data needed | Minimum 2 weeks of workout history |
| Analysis frequency | Weekly (on first app open of new week) + on-demand in stats |
| Computation time | <500ms for full analysis |
| Storage | Predictions cached in IndexedDB, refreshed weekly |

---

## 7. Design

### PR Prediction Card (Dashboard)

```
+- PR Prediction ---------------------+
|                                     |
|  Bench Press: 100kg                 |
|  ////////////////----  82%          |
|  Estimated: ~4 weeks (Mar 28)       |
|                                     |
|  Based on: +1.8kg/week avg          |
|  Current: 92.5kg x 8 @ RPE 8       |
|                                     |
|  [View Details]                     |
+-------------------------------------+
```

### Risk Alert Banner

```
+- Injury Risk Alert ------------- ! -+
|                                     |
|  Chest volume spike detected        |
|  This week: 24 sets (+38% vs. avg)  |
|                                     |
|  Recommendation: Cap chest at 18    |
|  sets next week to reduce risk.     |
|                                     |
|  [Adjust Program]  [Acknowledge]    |
+-------------------------------------+
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| PredictionCard | `prediction-card.tsx` | PR prediction with progress bar and date |
| RiskAlert | `risk-alert.tsx` | Expandable risk alert with recommendations |
| ConsistencyScore | `consistency-score.tsx` | Weekly/monthly adherence with streak |
| PredictionChart | `prediction-chart.tsx` | Recharts line chart with projection |

### Visual Spec

| Element | Value |
|---------|-------|
| Prediction card bg | #1A1A1A, 12px radius |
| Progress bar fill | #CDFF00 |
| Progress bar track | #2A2A2A |
| Confidence badge (high) | #22C55E pill |
| Confidence badge (medium) | #F59E0B pill |
| Confidence badge (low) | #EF4444 pill |
| Risk alert bg | #1A1A1A with #EF4444 4px left border |
| Risk alert icon | Exclamation in #EF4444 |
| Consistency heatmap | 7-column grid, #CDFF00 for trained days, #2A2A2A for rest/missed |
| Projection line | Dotted #CDFF00, 2px |
| Actual data line | Solid #CDFF00, 2px |
| Data points | 6px circles, #CDFF00 |
| Font | Inter, 16px body, 24px score values |
| Touch targets | 44px minimum |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Conversational trainer shipped (for integration)
- [ ] Workout history data accessible (4+ weeks ideal)
- [ ] PR tracking functional
- [ ] Recharts installed and working (for prediction charts)

### Build Order

1. **Create PR predictor** - linear regression on per-exercise weight data
2. **Create injury risk scorer** - volume spike detection, imbalance ratios, RPE streak analysis
3. **Create consistency scorer** - session adherence, streak tracking, volume milestones
4. **Create fatigue forecaster** - RPE trend extrapolation
5. **Create predictive analytics orchestrator** - combines all analyzers, caches results
6. **Create prediction card** - dashboard component with progress bar
7. **Create risk alert** - expandable banner with recommendations
8. **Create consistency score** - stats page component with heatmap
9. **Create prediction chart** - Recharts with projected line
10. **Integrate with dashboard** - add cards to home page
11. **Integrate with stats** - add sections to stats page
12. **Add DB tables** - Prediction, RiskAlert in `db.ts`
13. **Add feature flag** - `AI_PREDICTIVE_ANALYTICS`
14. **Optional: integrate with conversational trainer** - trainer references predictions

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Too little data (<2 weeks) | Don't show predictions; show "Train for 2 more weeks to unlock predictions" |
| User regressing (weight going down) | Show "Unable to predict - performance trending down. Let's discuss via trainer." |
| Irregular training schedule | Lower confidence rating; note "Prediction based on limited consistent data" |
| PR target already achieved | Remove prediction card; show celebration: "You hit 100kg! New target?" |
| Volume spike is intentional (user started new program) | Allow "Acknowledge" on risk alert; don't re-alert for same pattern |
| All risk factors clear | Show positive: "No injury risk factors detected. Keep training smart!" |
| Consistency streak broken | Show encouragement: "Streak ended at 6 weeks. Start a new one this week!" |
| Multiple exercises predicted to PR same week | Show top 3 predictions; group into "Big Week Ahead" card |
| Linear regression extrapolates unrealistically | Cap prediction at 12 weeks out; show "long-term" instead of specific date |

---

## 10. Testing

### Functional Tests
- [ ] PR prediction calculates correct date based on progression rate
- [ ] Confidence levels assigned correctly (high/medium/low based on R-squared)
- [ ] No prediction shown for <2 weeks of data
- [ ] Risk score detects volume spike >30%
- [ ] Risk score detects push/pull imbalance >1.5:1
- [ ] Risk score detects RPE 9+ streak of 3+ sessions
- [ ] Risk score detects missing movement patterns (4+ weeks)
- [ ] Consistency score calculates correctly (sessions/target)
- [ ] Streak tracking increments and resets properly
- [ ] Fatigue forecast extrapolates RPE trend correctly
- [ ] Predictions cached in IndexedDB and refreshed weekly
- [ ] Analysis completes in <500ms
- [ ] Risk alert dismissal persists (doesn't re-show same alert)

### UI Verification
- [ ] Prediction card shows on dashboard with correct data
- [ ] Progress bar fills proportionally (#CDFF00)
- [ ] Confidence badge uses correct color per level
- [ ] Risk alert has #EF4444 left border
- [ ] Expanding risk alert shows full details
- [ ] Consistency heatmap renders correctly for current month
- [ ] Prediction chart shows actual + projected lines
- [ ] Dark theme consistent throughout
- [ ] Touch targets 44px on all interactive elements

---

## 11. Launch Checklist

- [ ] Feature flag `AI_PREDICTIVE_ANALYTICS` added and tested
- [ ] PR prediction validated with 10+ real training histories
- [ ] Risk scoring validated against known overtraining patterns
- [ ] Consistency scoring tested with various training schedules
- [ ] Prediction cards render correctly on dashboard
- [ ] Risk alerts render correctly and are dismissible
- [ ] Prediction chart works with Recharts
- [ ] All calculations on-device (no API calls in V1)
- [ ] Analysis performance verified (<500ms)
- [ ] Tested on iOS Safari PWA mode
- [ ] Tested on Chrome Android
- [ ] IndexedDB tables created for Prediction and RiskAlert

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PR predictions wildly inaccurate | Users lose trust | Show confidence levels; cap predictions at 12 weeks; include data points count |
| Too many risk alerts overwhelm user | Alert fatigue, ignoring real risks | Max 2 active risk alerts; prioritize by severity; require acknowledgment |
| False positive risk alerts | User anxious unnecessarily | Conservative thresholds; explain reasoning in detail; allow dismiss |
| Linear regression too simplistic for advanced lifters | Bad predictions for non-linear progressors | Show confidence level; in V2, use curve fitting for advanced users |
| Consistency score feels judgmental | Negative user experience | Frame positively ("You're at 75% this week" not "You missed 25%"); celebrate streaks |
| Predictions create pressure | Users overtrain to hit predicted date | Frame as estimates, not targets; add "Predictions adjust as you train" disclaimer |
| Risk scoring misses actual injury risk | User gets injured despite no alert | Disclaimer: "Risk scoring is based on common patterns. Listen to your body." |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| ai-conversational-trainer (P2) | Recommended (not required) | Trainer integration (predictions can stand alone on dashboard) |
| Workout history (2+ weeks per user) | Per-user | Minimum data for predictions |
| PR tracking | Complete | PR prediction baseline |
| Recharts | Installed | Prediction charts |
| Feature flags system | Complete | Gating rollout |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| All calculations | 100% on-device, no API calls | N/A |
| Predictions | Stored in IndexedDB | Refreshed weekly, until user deletes |
| Risk alerts | Stored in IndexedDB | Until acknowledged |
| Consistency data | Calculated on-demand from workout logs | Not separately stored |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Initial draft - split from ai-personal-trainer.md vision doc. Full 14-section PRD with on-device analytics, risk scoring, and prediction specs. |
