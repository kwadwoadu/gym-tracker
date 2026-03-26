# AI Form Analysis (Camera-Based)

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P3
> **Roadmap Phase:** Phase 4 - Advanced AI

---

## 1. Problem Statement

Most gym-goers train without a coach and have no reliable way to assess their exercise form. Bad form leads to three outcomes: reduced muscle activation (less gains), compensatory movement patterns (imbalances), and injury risk. Users currently rely on gym mirrors (limited angles), filming themselves and watching back later (disruptive workflow), or asking strangers for feedback (unreliable).

SetFlow already provides text-based form cues per exercise, but text cues cannot tell a user whether they are actually executing correctly. There is a gap between knowing what correct form looks like and getting real-time feedback on whether you are achieving it.

---

## 2. Proposed Solution

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

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Form score accuracy | >80% agreement with certified trainer assessment | Validation study with 5 trainers scoring same videos |
| Feature adoption | >20% of users try form analysis within first month | Track camera activation events |
| Repeat usage | >50% of users who try it use it again within 7 days | Track return usage |
| Injury reduction (long-term) | Self-reported injury rate down 15% after 3 months | In-app survey |
| Form score improvement | Average form score improves 10+ points over 4 weeks | Track per-exercise form score trends |

---

## 4. Requirements

### Must Have
- [ ] Camera access with rear camera preference, minimum 720p
- [ ] On-device pose estimation using MediaPipe Pose Landmarker (33 3D keypoints)
- [ ] Real-time skeleton overlay on camera feed (green = good, red = issue)
- [ ] Per-rep form scoring (0-100) based on exercise-specific rules
- [ ] Post-set form report with average score, best/worst rep, improvement areas
- [ ] Support for V1 exercises: Back Squat, Front Squat, Bench Press, Deadlift, OHP, Barbell Row, RDL, Bulgarian Split Squat
- [ ] Lazy-loaded model (~5MB) - never in main bundle
- [ ] Model cached in service worker for offline re-use
- [ ] Feature gated behind `AI_FORM_ANALYSIS` flag
- [ ] No video uploaded or stored (100% on-device processing)

### Should Have
- [ ] Real-time audio cues for critical form breaks ("Knees caving", "Round back")
- [ ] Rep detection from keypoint trajectory analysis
- [ ] Form score trends per exercise over time (chart in stats)
- [ ] Camera positioning guide (silhouette overlay for correct angle)
- [ ] Phone overheating detection with throttle to 15fps
- [ ] Comparison to previous session form scores

### Won't Have (This Version)
- [ ] AI-generated form correction advice (text-based coaching from form data)
- [ ] Video recording and playback with overlay
- [ ] Form analysis for isolation exercises (only 8 compounds in V1)
- [ ] Multi-camera angle analysis
- [ ] Cloud-based form analysis (everything on-device)

---

## 5. User Flows

### Flow 1: First-Time Form Analysis

1. User opens exercise card for Barbell Back Squat during active workout
2. User taps "Analyze Form" button
3. First-time setup: model downloads (~5MB) with progress indicator
4. Camera access permission prompt appears
5. Camera setup view shows: positioning guide (silhouette), recommended angle (side view), distance tips
6. User positions phone (propped against water bottle, 6-8 feet away)
7. User taps "Start Analysis"
8. Camera feed activates with real-time skeleton overlay
9. User performs reps; per-rep score shown live at bottom of screen
10. User taps "Stop" after completing set
11. Post-set form report displays: average score, rep breakdown, strengths, areas to improve
12. User taps "Save & Continue" - form score attached to SetLog

### Flow 2: Returning User (Model Cached)

1. User taps "Analyze Form" on Bench Press
2. Model loads from cache (~2-3s)
3. Camera activates immediately with positioning guide
4. Steps 7-12 from Flow 1 continue

### Flow 3: Form Degradation Under Load

1. User performs 8 reps of Squat with increasing form degradation
2. Reps 1-4 score 88-90, Reps 5-6 score 80-82, Reps 7-8 score 72-75
3. Audio cue fires on Rep 6: "Knees caving"
4. Post-set report highlights: "Knee tracking degraded on reps 6-8 (fatigue pattern). Consider reducing weight or stopping at rep 6."

### Flow 4: Unsupported Exercise

1. User taps "Analyze Form" on Lateral Raise (not in V1 supported list)
2. System shows: "Form analysis not yet available for Lateral Raise"
3. Shows list of 8 supported exercises
4. User can request it via feedback button

---

## 6. Technical Spec

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
│  Pose Estimation     │ -- MediaPipe Pose Landmarker (33 keypoints)
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
2. **MediaPipe Pose Landmarker inference** (33 3D keypoints per frame, MediaPipe Solutions API)
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
| `/src/lib/ai/pose-estimation.ts` | MediaPipe Pose Landmarker wrapper (Solutions API) with initialization and inference |
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

### Bundle & Loading Strategy

- MediaPipe Solutions WASM + model (5MB) must be lazy-loaded via dynamic `import()` - never bundled with the main app chunk
- Load triggered only when user taps "Analyze Form" button for the first time
- Show loading state: "Preparing camera... (downloading pose model)" with progress indicator
- Code-split ai-form-analysis into separate Next.js chunk (`next/dynamic` with `ssr: false`)
- Cache WASM in service worker after first download for offline re-use
- Feature flag: `AI_FORM_ANALYSIS` gates entire feature; if disabled, 0KB impact on bundle

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `@mediapipe/tasks-vision` | MediaPipe Solutions Pose Landmarker (on-device, replaces legacy BlazePose) | ~5MB (WASM + model) |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Pose model | MediaPipe Pose Landmarker (33 keypoints, 3D) via `@mediapipe/tasks-vision` Solutions API |
| Inference speed | 30fps on iPhone 12+, 15fps on older devices |
| Processing | 100% on-device (no API calls) |
| Model loading | ~2-3 seconds initial load, cached after first use |
| Memory usage | ~150MB during active analysis |
| Camera | Rear camera preferred, minimum 720p |
| Offline | Fully functional offline (model bundled or cached) |

---

## 7. Design

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

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| FormCamera | `form-camera.tsx` | Camera view with pose overlay and positioning guide |
| FormOverlay | `form-overlay.tsx` | Skeleton/joint visualization on camera feed |
| FormReport | `form-report.tsx` | Post-set report card with scores and feedback |
| FormTrends | `form-trends.tsx` | Form score history chart in stats page |
| useFormAnalysis | `use-form-analysis.ts` | Hook managing camera, pose estimation, scoring |

### Visual Spec

| Element | Value |
|---------|-------|
| Skeleton lines (good form) | #CDFF00, 2px stroke, semi-transparent |
| Skeleton lines (issue) | #EF4444, 3px stroke, pulsing |
| Joint dots | 8px circles, same color as corresponding skeleton |
| Camera overlay bg | rgba(10, 10, 10, 0.4) for text readability |
| Per-rep score | 32px bold Inter, white on camera overlay |
| Form report card | #1A1A1A bg, 12px border-radius |
| Score progress circle | #CDFF00 fill, #2A2A2A track |
| Rep breakdown bars | Color gradient: #22C55E (90+), #CDFF00 (80-89), #F59E0B (70-79), #EF4444 (<70) |
| Setup silhouette guide | #CDFF00 at 20% opacity |
| View transitions | Framer Motion, 300ms ease-in-out |
| Font | Inter, 16px body, 32px score, 14px rep details |
| Touch targets | 44px minimum for Start/Stop buttons |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] `@mediapipe/tasks-vision` package available and tested
- [ ] Camera API (MediaDevices) working on target browsers
- [ ] Web Audio API available for form cues
- [ ] Exercise form rule data drafted for 8 V1 exercises
- [ ] Service worker configured for WASM caching

### Build Order

1. **Create pose estimation wrapper** - `/src/lib/ai/pose-estimation.ts` with MediaPipe Pose Landmarker initialization, WASM loading, inference loop
2. **Create joint angle utilities** - `/src/lib/ai/joint-angles.ts` for calculating angles between 3D keypoints
3. **Create form rules data** - `/src/data/form-rules.ts` with exercise-specific angle ranges, checkpoints, ideal ROM
4. **Create rep detector** - `/src/lib/ai/rep-detector.ts` using keypoint trajectory analysis for eccentric/concentric phases
5. **Create form rule engine** - `/src/lib/ai/form-rules.ts` evaluating joint angles against exercise-specific rules
6. **Create form analyzer** - `/src/lib/ai/form-analyzer.ts` orchestrating pose data, rules, scoring
7. **Create camera component** - `form-camera.tsx` with `next/dynamic` (ssr: false), positioning guide
8. **Create overlay component** - `form-overlay.tsx` rendering skeleton on Canvas
9. **Create form report** - `form-report.tsx` with score, rep breakdown, strengths, improvements
10. **Create form trends chart** - `form-trends.tsx` for stats page
11. **Create useFormAnalysis hook** - managing camera, model lifecycle, scoring state
12. **Integrate with exercise card** - Add "Analyze Form" button to `exercise-card.tsx`
13. **Integrate with set logger** - Show form score after set if camera was active in `set-logger.tsx`
14. **Modify DB schema** - Add `FormScore` interface and `formScore` field to `SetLog` in `db.ts`
15. **Add form cue sounds** - Brief spoken-word audio cues in `audio.ts`
16. **Add feature flag** - `AI_FORM_ANALYSIS` in `feature-flags.ts`
17. **Configure WASM caching** - Service worker caches MediaPipe model after first download

---

## 9. Edge Cases

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

## 10. Testing

### Functional Tests
- [ ] MediaPipe Pose Landmarker loads and initializes on Chrome
- [ ] MediaPipe Pose Landmarker loads and initializes on iOS Safari
- [ ] Model cached in service worker after first download
- [ ] Subsequent loads use cached model (fast, no network)
- [ ] Skeleton overlay appears on camera feed with 33 keypoints
- [ ] Joint angles calculated correctly for squat (hip, knee, ankle)
- [ ] Rep detection counts reps accurately (within +/-1)
- [ ] Form score generated for each supported exercise
- [ ] Per-rep score updates in real-time during set
- [ ] Post-set report shows correct average, best, worst rep
- [ ] Audio cue fires for critical form breaks (knee cave, round back)
- [ ] Form scores saved to IndexedDB attached to SetLog
- [ ] Form trends chart renders in stats page
- [ ] Unsupported exercise shows "not yet available" message
- [ ] Camera permission denial shows instructions to enable
- [ ] Phone overheating: throttles to 15fps
- [ ] Model loading failure: retries with exponential backoff, falls back to text cues
- [ ] Pose confidence too low: shows positioning warning

### UI Verification
- [ ] Camera setup shows silhouette positioning guide
- [ ] Recommended angle tip shown (e.g., "Side view recommended")
- [ ] Skeleton lines green (#CDFF00) for good form
- [ ] Skeleton lines red (#EF4444) for detected issues
- [ ] Joint dots 8px, color-coded
- [ ] Per-rep score large (32px) and readable over camera feed
- [ ] Dark overlay on camera for text readability
- [ ] Form report card uses correct score-to-color mapping
- [ ] Rep breakdown bars color-coded by score range
- [ ] Start/Stop buttons meet 44px touch target
- [ ] Framer Motion transitions smooth between setup/analysis/report
- [ ] Overall dark theme maintained
- [ ] Loading state shows model download progress

---

## 11. Launch Checklist

- [ ] Feature flag `AI_FORM_ANALYSIS` added and tested (on/off)
- [ ] `@mediapipe/tasks-vision` integrated and working
- [ ] Form rules validated by Movement Specialist for all 8 V1 exercises
- [ ] Model lazy-loaded via `next/dynamic` (ssr: false) - 0KB main bundle impact when flag off
- [ ] Service worker caches WASM + model for offline re-use
- [ ] Camera permission flow tested on iOS Safari
- [ ] Camera permission flow tested on Chrome Android
- [ ] Inference speed validated: 30fps on iPhone 12+, 15fps on older devices
- [ ] Memory usage within bounds (~150MB during analysis)
- [ ] Device temperature monitoring implemented
- [ ] Audio cues play correctly on iOS Safari
- [ ] No video/frames stored anywhere (privacy audit)
- [ ] IndexedDB schema version bumped for FormScore table
- [ ] Form trends chart tested with 4+ weeks of mock data
- [ ] Tested on iOS Safari PWA mode
- [ ] Disclaimer added: "Form analysis is advisory. Consult a trainer for injury concerns."

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Form score inaccuracy | Users distrust feature or get injured following bad advice | Validate rules with certified trainers; show scores as advisory; add disclaimer |
| MediaPipe WASM not supported on some devices | Feature unavailable for subset of users | Detect WASM support before showing "Analyze Form" button; graceful fallback |
| ~5MB model size impacts load time | Slow first-time experience | Progressive download with progress indicator; cache in service worker; lazy-load only on demand |
| Phone overheating during analysis | Device throttles or shuts down | Monitor temperature; auto-throttle to 15fps; suggest shorter analysis sessions |
| Poor gym lighting | Skeleton estimation inaccurate | Show "Low light detected" warning; recommend well-lit area; degrade scoring gracefully |
| User liability for form advice | Legal exposure | Always-visible disclaimer: "Advisory only - not a substitute for professional coaching" |
| Limited exercise coverage (8 only) | Users want analysis for other exercises | Clear messaging on supported list; community request system for expansion priority |
| Camera angle inconsistency between sessions | Form scores not comparable | Show positioning guide each time; track camera angle in metadata for trend validity |
| Multiple people in frame | Wrong person analyzed | Use closest-to-center/largest person; show "Position yourself in center" warning |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| `@mediapipe/tasks-vision` (Pose Landmarker) | Available | Pose estimation (replaces legacy BlazePose) |
| Camera API (MediaDevices) | Available in modern browsers | Video capture |
| Web Audio API | Complete (existing) | Real-time form cues |
| Exercise form cues data | Partially complete | Form rule definitions |
| Workout session flow | Complete | Integration point |
| Feature flags system | Complete | Gating rollout |
| IndexedDB schema | Needs version bump | Form score storage |
| Service worker | Available (PWA) | WASM/model caching |

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

> **Scalability Note**: V1 launches with form rules for 8 compound exercises only. Each exercise's rules are validated by Movement Specialist before release. Scaling beyond 8 requires either: (a) manual rule creation per exercise (high effort), or (b) collecting labeled form data from V1 users to train a lightweight ML model (future). Exercises without validated rules show "Form analysis not yet available for this exercise" instead of inaccurate scoring.

### Privacy & Data

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

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: Updated MediaPipe from legacy BlazePose to MediaPipe Solutions Pose Landmarker API. Added Requirements (MoSCoW), User Flows, Implementation Plan, Component Table, Visual Spec, Testing, Launch Checklist, Risks & Mitigations. Restructured to 14-section standard. |
