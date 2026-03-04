# AI Form Analysis (Camera-Based)

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P3
> **Roadmap Phase:** Phase 4 - Advanced AI

---

## Problem Statement

Most gym-goers train without a coach and have no reliable way to assess their exercise form. Bad form leads to three outcomes: reduced muscle activation (less gains), compensatory movement patterns (imbalances), and injury risk. Users currently rely on gym mirrors (limited angles), filming themselves and watching back later (disruptive workflow), or asking strangers for feedback (unreliable).

SetFlow already provides text-based form cues per exercise, but text cues cannot tell a user whether they are actually executing correctly. There is a gap between knowing what correct form looks like and getting real-time feedback on whether you are achieving it.

---

## Proposed Solution

Camera-based AI form analysis that uses the phone's camera and on-device pose estimation to analyze exercise form in real-time. The phone is positioned to capture the user during a set, and the AI provides a form score with specific feedback on technique errors.

### Core Behaviors

1. **Real-Time Pose Overlay**: Camera feed with skeleton overlay showing joint positions. Key joints highlighted in green (good) or red (needs correction) during the set.

2. **Per-Rep Form Scoring**: Each rep receives a 0-100 form score based on:
   - Range of motion (compared to exercise-specific ideal ROM)
   - Bar/body path tracking (e.g., bench press bar should move in a slight arc)
   - Tempo adherence (if programmed tempo exists)
   - Symmetry (left/right balance)
   - Key checkpoint positions (e.g., squat depth, lockout position)

3. **Real-Time Audio Cues**: During the set, brief audio cues for critical form breaks:
   - "Knees caving" (squat)
   - "Elbows flaring" (bench press)
   - "Round back" (deadlift)
   - Uses existing Web Audio API system

4. **Post-Set Form Report**: After completing a set, a form summary card shows:
   - Average form score for the set
   - Best and worst rep
   - Specific areas for improvement
   - Comparison to previous sessions (form trend over time)

5. **Form Comparison Over Time**: Track form scores per exercise over weeks to show improvement or degradation as weights increase.

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Form score accuracy | >80% agreement with certified trainer assessment | Validation study with 5 trainers scoring same videos |
| Feature adoption | >20% of users try form analysis within first month | Track camera activation events |
| Repeat usage | >50% of users who try it use it again within 7 days | Track return usage |
| Injury reduction (long-term) | Self-reported injury rate down 15% after 3 months | In-app survey |
| Form score improvement | Average form score improves 10+ points over 4 weeks | Track per-exercise form score trends |

---

## User Stories

- As a beginner, I want to see if my squat depth is adequate so I can build proper movement patterns from the start.
- As an intermediate lifter, I want to know if my bench press bar path is efficient so I can maximize chest activation.
- As a user increasing weight, I want to monitor whether my form degrades under heavier loads so I know my true working weight.
- As a user training alone, I want real-time feedback that replaces having a spotter or coach watch my form.
- As a user comparing my form over time, I want to see whether my squat form has improved since I started working on mobility.

---

## Technical Scope

### Architecture

```
User taps "Analyze Form" on exercise card
        |
        v
┌──────────────────────┐
│  Camera Access       │ -- Request permission, rear camera preferred
│  (MediaDevices API)  │
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Video Feed          │ -- Display camera preview with positioning guide
│  (Canvas / Video)    │
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Pose Estimation     │ -- MediaPipe BlazePose (33 keypoints)
│  (On-Device)         │ -- 30fps inference on modern phones
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Form Analyzer       │ -- Exercise-specific joint angle analysis
│  (Rule Engine)       │ -- ROM checks, path tracking, symmetry
└──────────┬───────────┘
        |
    ┌───┴───────┐
    v           v
[Real-time]  [Post-set]
    |           |
    v           v
Audio cues   Form report card
(Web Audio)  (score + feedback)
```

### Pose Estimation Pipeline

1. **Camera frame capture** (30fps from video element)
2. **MediaPipe BlazePose inference** (33 3D keypoints per frame)
3. **Joint angle calculation** (relevant angles for current exercise)
4. **Rep detection** (identify eccentric/concentric phases from keypoint trajectories)
5. **Per-rep form evaluation** (compare angles to exercise-specific ideal ranges)
6. **Score aggregation** (weighted average across checkpoints)

### Exercise-Specific Form Rules

| Exercise | Key Checkpoints | Ideal Ranges |
|----------|----------------|--------------|
| Barbell Squat | Hip hinge depth, knee tracking, back angle | Hip crease below knee, knees over toes (not past), torso 45-75 deg |
| Bench Press | Bar path, elbow angle at bottom, scapula position | Slight arc to lower chest, 75-90 deg elbow at bottom |
| Deadlift | Back angle, hip hinge, lockout | Neutral spine (< 10 deg flexion), hips and knees extend together |
| Overhead Press | Bar path, core bracing, lockout | Vertical bar path over mid-foot, full lockout overhead |
| Barbell Row | Back angle, elbow path, ROM | 30-45 deg torso angle, bar to lower chest/upper abs |

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/form-analyzer.ts` | Core form analysis engine: pose data -> joint angles -> form scores |
| `/src/lib/ai/pose-estimation.ts` | MediaPipe BlazePose wrapper with initialization and inference |
| `/src/lib/ai/form-rules.ts` | Exercise-specific form rule definitions (angles, ROM, checkpoints) |
| `/src/lib/ai/rep-detector.ts` | Rep counting from keypoint trajectory analysis |
| `/src/lib/ai/joint-angles.ts` | Joint angle calculation utilities from 3D keypoints |
| `/src/components/workout/form-camera.tsx` | Camera view with pose overlay and positioning guide |
| `/src/components/workout/form-overlay.tsx` | Skeleton/joint visualization on camera feed |
| `/src/components/workout/form-report.tsx` | Post-set form report card with scores and feedback |
| `/src/components/stats/form-trends.tsx` | Form score history chart (per exercise over time) |
| `/src/hooks/use-form-analysis.ts` | React hook managing camera, pose estimation, and form scoring |
| `/src/data/form-rules.ts` | Static form rule data for supported exercises |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/workout/exercise-card.tsx` | Add "Analyze Form" button |
| `/src/components/workout/set-logger.tsx` | Show form score after set if camera was active |
| `/src/lib/db.ts` | Add `FormScore` interface and table; add `formScore` field to `SetLog` |
| `/src/lib/queries.ts` | Add `useFormScores()`, `useFormTrends()` hooks |
| `/src/app/stats/page.tsx` | Add form score trends section |
| `/src/lib/feature-flags.ts` | Add `AI_FORM_ANALYSIS` feature flag |
| `/src/lib/audio.ts` | Add form cue sounds (brief spoken words or distinct tones) |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `@mediapipe/tasks-vision` | BlazePose pose estimation (on-device) | ~5MB (WASM + model) |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Pose model | MediaPipe BlazePose (33 keypoints, 3D) |
| Inference speed | 30fps on iPhone 12+, 15fps on older devices |
| Processing | 100% on-device (no API calls) |
| Model loading | ~2-3 seconds initial load, cached after first use |
| Memory usage | ~150MB during active analysis |
| Camera | Rear camera preferred, minimum 720p |
| Offline | Fully functional offline (model bundled or cached) |

---

## Design Requirements

### Camera Setup View

```
┌─────────────────────────────────────────┐
│  Form Analysis - Barbell Squat          │
├─────────────────────────────────────────┤
│                                          │
│  ┌───────────────────────────────────┐   │
│  │                                   │   │
│  │     Position your phone so        │   │
│  │     your full body is visible     │   │
│  │                                   │   │
│  │     ┌─────────────────────┐       │   │
│  │     │    [ silhouette ]   │       │   │
│  │     │    guide outline    │       │   │
│  │     └─────────────────────┘       │   │
│  │                                   │   │
│  │     Side view recommended         │   │
│  │     for this exercise             │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
│                                          │
│  Tips:                                   │
│  - Prop phone against water bottle       │
│  - 6-8 feet away                         │
│  - Side angle captures depth best        │
│                                          │
│  [Start Analysis]                        │
└─────────────────────────────────────────┘
```

### Active Analysis View

```
┌─────────────────────────────────────────┐
│  Analyzing... Rep 3 of 8        [Stop]  │
├─────────────────────────────────────────┤
│                                          │
│  ┌───────────────────────────────────┐   │
│  │                                   │   │
│  │    Camera feed with               │   │
│  │    skeleton overlay               │   │
│  │                                   │   │
│  │    ○ ── shoulder (green)          │   │
│  │    |                              │   │
│  │    ○ ── hip (green)               │   │
│  │   / \                             │   │
│  │  ○   ○ ── knees (red = caving)    │   │
│  │  |   |                            │   │
│  │  ○   ○ ── ankles                  │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
│                                          │
│  Current Rep Score: 82/100               │
│  Depth: Good | Knees: Watch tracking     │
│                                          │
│  Set Score: 85 avg                       │
└─────────────────────────────────────────┘
```

### Post-Set Form Report

```
┌─────────────────────────────────────────┐
│  Form Report - Barbell Squat            │
├─────────────────────────────────────────┤
│                                          │
│  Set Score: 85/100                       │
│  ████████████████░░░░  85%               │
│                                          │
│  Rep Breakdown:                          │
│  Rep 1: 88  Rep 2: 90  Rep 3: 87        │
│  Rep 4: 85  Rep 5: 82  Rep 6: 79        │
│  Rep 7: 80  Rep 8: 78                   │
│                                          │
│  Strengths:                              │
│  + Consistent depth (hip crease below    │
│    knee on all reps)                     │
│  + Good back angle maintained            │
│                                          │
│  Areas to Improve:                       │
│  - Knees tracking inward on reps 6-8     │
│    (fatigue pattern - reduce weight      │
│    or stop at rep 6)                     │
│  - Slight forward lean in bottom         │
│    position on heavy reps                │
│                                          │
│  Trend: +3 pts vs last session           │
│                                          │
│  [Save & Continue]  [View Tips]          │
└─────────────────────────────────────────┘
```

### Visual Style
- Camera overlay: semi-transparent skeleton lines in accent (#CDFF00) for good form, red (#EF4444) for issues
- Joint dots: 8px circles at key joint positions
- Score display: large number with circular progress indicator
- Rep breakdown: horizontal bar chart, color-coded by score
- Dark theme overlay on camera feed for text readability
- Framer Motion transitions between setup/analysis/report views

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Poor lighting in gym | Show "Low light detected" warning; pose estimation degrades gracefully |
| Multiple people in frame | Use the person closest to center/largest in frame; show "Multiple people detected - position yourself in center" |
| Camera angle too steep/flat | Guide overlay shows ideal angle; warn if skeleton confidence is low |
| Phone falls during set | Detect sudden camera movement, pause analysis, prompt to reposition |
| Exercise not supported | Show "Form analysis not available for this exercise yet" with list of supported exercises |
| User wearing loose clothing | Skeleton estimation less accurate; note "Fitted clothing recommended for best accuracy" |
| Very fast reps (no tempo) | Rep detection adapts to actual tempo; may miss reps at >2 reps/second |
| Partial reps | Detect and flag partial ROM; don't count as full reps in score |
| Phone overheating | Monitor device temperature; throttle to 15fps or pause analysis if hot |
| Camera permission denied | Show instructions to enable in Settings; offer manual form checklist as fallback |
| Model loading fails | Retry with exponential backoff; fall back to text-based form cues |
| Pose confidence too low | Show warning: "Can't detect your position clearly. Try adjusting camera angle." |

---

## Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Camera video feed | Processed on-device only; never uploaded | Frames discarded immediately after pose estimation |
| Pose keypoint data | Processed on-device for form scoring | Per-rep scores stored in IndexedDB; raw keypoints discarded |
| Form scores | Stored locally in IndexedDB | Until user deletes |
| Form feedback text | Generated on-device from rule engine | Stored with form score |
| MediaPipe model | Cached in browser storage | Until cache cleared |

### Critical Privacy Guarantees
- **No video is ever uploaded, stored, or transmitted** - all processing is on-device
- **No camera frames are saved** - each frame is processed and immediately discarded
- **Only numerical form scores are persisted** - no images, no video, no pose data
- Camera access requires explicit browser permission
- Users can delete all form data from Settings

---

## Priority

**P3 - Future Consideration**

Form analysis is technically complex (MediaPipe integration, exercise-specific rule tuning, camera UX) and requires significant validation effort (trainer-verified accuracy). The ~5MB model dependency also impacts bundle size. However, this feature has massive differentiation potential - very few consumer fitness apps offer real-time pose-based form analysis. Ship after P0/P1 AI features are stable.

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| MediaPipe BlazePose WASM support | Available | Pose estimation |
| Camera API (MediaDevices) | Available in modern browsers | Video capture |
| Web Audio API | Complete (existing) | Real-time form cues |
| Exercise form cues data | Partially complete | Form rule definitions |
| Workout session flow | Complete | Integration point |
| Feature flags system | Complete | Gating rollout |
| IndexedDB schema | Needs version bump | Form score storage |

### Supported Exercises (V1)

Initial launch with 8 compound movements that benefit most from form analysis:

1. Barbell Back Squat
2. Barbell Front Squat
3. Barbell Bench Press
4. Barbell Deadlift (conventional)
5. Barbell Overhead Press
6. Barbell Bent-Over Row
7. Romanian Deadlift
8. Bulgarian Split Squat

Additional exercises added based on usage data and community requests.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
