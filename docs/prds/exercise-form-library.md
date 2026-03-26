# Exercise Form Library

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

Users currently have no in-app guidance on proper exercise form. When encountering an unfamiliar exercise in their program, they must leave SetFlow, search YouTube or Google, find a relevant video, and then switch back - losing context and wasting time mid-workout.

Key issues:
1. **Context switching** - Leaving the app breaks workout flow and rest timer tracking
2. **Inconsistent quality** - YouTube results vary wildly in quality and relevance
3. **No curated cues** - Even good videos bury the key form cues in 10+ minute explanations
4. **Injury risk** - Without proper form guidance, users risk injury especially on compound movements
5. **No muscle awareness** - Users don't know which muscles should be firing, leading to poor mind-muscle connection

For a gym app targeting progressive overload, form quality directly impacts whether weight increases are safe and effective.

---

## 2. Solution

Build a built-in exercise form library with self-hosted video content, key form cues, common mistakes, and muscle activation visualization - all accessible without leaving the workout flow.

### Form Video Player
- Self-hosted short-form videos (15-30 seconds, looping) showing proper execution
- CDN-hosted via Vercel Blob or Cloudflare R2 for fast loading
- **Note**: V1 uses Vercel Blob for simplicity (zero additional configuration). If video delivery costs exceed $50/month or latency is poor in key markets, migrate to Cloudflare R2 using the same VideoStorage interface. Decision deferred until real usage data is available.
- No YouTube dependency - fully offline-capable after first cache
- Plays inline within exercise cards (no fullscreen required)

### Key Form Cues
- 3-5 text-based cues displayed as overlay cards during video playback
- Cues timed to specific phases of the movement (eccentric, concentric, pause)
- Example: Bench Press - "Drive feet into floor", "Retract shoulder blades", "Touch chest at nipple line"

### Common Mistakes
- "Avoid" section with 2-3 anti-patterns per exercise
- Visual distinction from positive cues (red/warning styling)
- Example: "Don't flare elbows past 45 degrees"

### Muscle Activation Map
- SVG-based body diagram showing primary and secondary muscles
- Color intensity indicates activation level
- Helps users understand which muscles should be working

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Form video views per workout | 1.5+ views per session (new users) | Track video play events per workout session |
| Time spent outside app during workout | < 30 seconds (down from ~2 min) | Session duration continuity tracking |
| Form library coverage | 80% of exercises have videos within 3 months | Exercise count with videoUrl vs total |
| Video load time | < 1.5 seconds on 4G | Performance monitoring on CDN responses |
| Offline video availability | 100% of current program exercises cached | Service worker cache hit rate |

---

## 4. Requirements

### Must Have
- [ ] Self-hosted video player for exercise form demonstrations (15-30s loops)
- [ ] CDN storage for video assets (Vercel Blob or Cloudflare R2)
- [ ] Key form cues (3-5 per exercise) displayed as text cards
- [ ] Common mistakes section (2-3 per exercise) with warning styling
- [ ] SVG muscle activation map showing primary/secondary muscles
- [ ] Accessible from exercise card in workout view (inline expand)
- [ ] Accessible from exercise database browse view
- [ ] Videos cached via service worker for offline playback
- [ ] Form data stored in exercise database (Dexie.js)

### Should Have
- [ ] Video playback speed control (0.5x, 1x for slow-motion form review)
- [ ] Cue timing synchronized to video phases (eccentric/concentric markers)
- [ ] Search/filter exercises by muscle group in form library
- [ ] "Seen" indicator so users know which form guides they've reviewed
- [ ] Landscape mode support for larger video view

### Won't Have (this version)
- User-uploaded form check videos (AI form analysis - separate PRD exists)
- Social sharing of form tips
- Personalized cue suggestions based on user anthropometry
- AR overlay for real-time form checking

---

## 5. User Flow

### Flow 1: Form Check During Workout
1. User is in active workout session on Barbell Row
2. User taps the info icon on the exercise card
3. Form panel slides up from bottom (half-sheet)
4. Video auto-plays (muted, looping)
5. Key cues appear below video: "Hinge at hips", "Pull to belly button", "Squeeze shoulder blades"
6. User reviews, taps "X" or swipes down to dismiss
7. Returns to workout - rest timer was still counting

### Flow 2: Browse Form Library
1. User navigates to Form Library from bottom nav or settings
2. Grid of exercises grouped by muscle group (Chest, Back, Legs, etc.)
3. User taps "Barbell Bench Press"
4. Full form page opens with video, cues, mistakes, muscle map
5. User can mark exercise as "reviewed"

### Flow 3: Offline Form Review
1. User opens app at gym with poor connectivity
2. Service worker serves cached videos for all exercises in current program
3. Form content loads instantly from IndexedDB
4. User reviews form between sets without network dependency

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `FormVideoPlayer` | Looping video player with playback controls |
| `FormCueCard` | Individual form cue with icon and phase label |
| `MistakeCard` | Warning-styled common mistake card |
| `MuscleActivationMap` | SVG body diagram with highlighted muscles |
| `FormLibraryGrid` | Browse view with muscle group filters |
| `FormSheet` | Bottom sheet container for inline form view |

### Visual Design

**Form Video Player**:
- Background: `#000000` (true black for video contrast)
- Rounded corners: 12px
- Aspect ratio: 9:16 (portrait) or 16:9 (landscape)
- Controls: Play/pause overlay, speed toggle (bottom-right)
- Height: 200px (inline), expandable to full-width

**Form Cue Cards**:
- Background: `#1A1A1A`
- Left border: 3px `#CDFF00` (lime accent)
- Icon: Checkmark circle in `#CDFF00`
- Text: 14px white, phase label in `#A0A0A0`

**Mistake Cards**:
- Background: `#1A1A1A`
- Left border: 3px `#EF4444` (error red)
- Icon: X circle in `#EF4444`
- Text: 14px white with "Avoid:" prefix

**Muscle Map**:
- SVG body outline: `#333333` stroke
- Primary muscles: `#CDFF00` fill at 80% opacity
- Secondary muscles: `#CDFF00` fill at 30% opacity
- Labels: 10px `#A0A0A0` with leader lines

### Wireframe

```
+------------------------------------------+
| [<] Barbell Bench Press          [close] |
+------------------------------------------+
| +--------------------------------------+ |
| |                                      | |
| |          [VIDEO PLAYER]              | |
| |      15s looping form demo           | |
| |                                      | |
| |                          [0.5x] [1x] | |
| +--------------------------------------+ |
|                                          |
| KEY FORM CUES                            |
| +--------------------------------------+ |
| | [check] Retract shoulder blades      | |
| |         Phase: Setup                 | |
| +--------------------------------------+ |
| | [check] Drive feet into floor        | |
| |         Phase: Eccentric             | |
| +--------------------------------------+ |
| | [check] Touch chest at nipple line   | |
| |         Phase: Bottom                | |
| +--------------------------------------+ |
| | [check] Lock out without flaring     | |
| |         Phase: Concentric            | |
| +--------------------------------------+ |
|                                          |
| COMMON MISTAKES                          |
| +--------------------------------------+ |
| | [X] Avoid: Bouncing bar off chest    | |
| +--------------------------------------+ |
| | [X] Avoid: Flaring elbows past 45   | |
| +--------------------------------------+ |
| | [X] Avoid: Lifting hips off bench    | |
| +--------------------------------------+ |
|                                          |
| MUSCLES WORKED                           |
| +--------------------------------------+ |
| |     [ Front Body ]  [ Back Body ]    | |
| |                                      | |
| |      @@@@@@@@                        | |
| |     @@  @@  @@    Primary:           | |
| |    @@   @@   @@   - Pectoralis Major | |
| |     @@  @@  @@                       | |
| |      @@@@@@@@     Secondary:         | |
| |       @@  @@      - Anterior Deltoid | |
| |       @@  @@      - Triceps          | |
| |                                      | |
| +--------------------------------------+ |
+------------------------------------------+
```

### Form Library Browse View

```
+------------------------------------------+
| Form Library                     [search] |
+------------------------------------------+
| [All] [Chest] [Back] [Legs] [Shoulders]  |
| [Arms] [Core]                             |
+------------------------------------------+
|                                           |
| CHEST                                     |
| +--------+ +--------+ +--------+         |
| | [thumb]| | [thumb]| | [thumb]|         |
| | Bench  | | Incline| | Cable  |         |
| | Press  | | DB     | | Fly    |         |
| |  [ok]  | |  [ok]  | |  [--]  |         |
| +--------+ +--------+ +--------+         |
|                                           |
| BACK                                      |
| +--------+ +--------+ +--------+         |
| | [thumb]| | [thumb]| | [thumb]|         |
| | Barbell| | Lat    | | Seated |         |
| | Row    | | Pull   | | Row    |         |
| |  [--]  | |  [ok]  | |  [--]  |         |
| +--------+ +--------+ +--------+         |
|                                           |
+------------------------------------------+
```

---

## 7. Technical Spec

### Video Storage Architecture

```typescript
// /src/lib/form-library/video-storage.ts
import { put, list } from '@vercel/blob';

interface FormVideo {
  exerciseId: string;
  url: string;        // CDN URL
  duration: number;   // seconds
  aspectRatio: '9:16' | '16:9';
  fileSize: number;   // bytes
}

// Upload form video to Vercel Blob
export async function uploadFormVideo(
  exerciseId: string,
  file: File
): Promise<FormVideo> {
  const blob = await put(`form-videos/${exerciseId}.mp4`, file, {
    access: 'public',
    contentType: 'video/mp4',
  });

  return {
    exerciseId,
    url: blob.url,
    duration: 0, // Set after metadata extraction
    aspectRatio: '9:16',
    fileSize: file.size,
  };
}

// Get video URL with CDN optimization
export function getFormVideoUrl(exerciseId: string): string {
  return `${process.env.NEXT_PUBLIC_CDN_BASE}/form-videos/${exerciseId}.mp4`;
}
```

### Form Data Schema

```typescript
// /src/lib/form-library/types.ts
export interface FormCue {
  id: string;
  text: string;
  phase: 'setup' | 'eccentric' | 'bottom' | 'concentric' | 'top';
  timestampMs?: number; // Optional sync point in video
}

export interface FormMistake {
  id: string;
  text: string;
  severity: 'common' | 'dangerous';
}

export interface MuscleActivation {
  muscleId: string;
  name: string;
  activation: 'primary' | 'secondary';
}

export interface ExerciseForm {
  exerciseId: string;
  videoUrl: string | null;
  cues: FormCue[];
  mistakes: FormMistake[];
  muscles: MuscleActivation[];
  lastUpdated: string; // ISO date
}
```

### Dexie.js Schema Extension

```typescript
// /src/lib/db.ts (extend existing schema)
import Dexie from 'dexie';

// Add to existing db schema
db.version(nextVersion).stores({
  // ... existing stores
  exerciseForms: 'exerciseId, lastUpdated',
  formVideoCache: 'exerciseId, cachedAt',
});

export interface FormVideoCacheEntry {
  exerciseId: string;
  blob: Blob;
  cachedAt: string;
}
```

### Form Video Player Component

```typescript
// /src/components/form-library/FormVideoPlayer.tsx
'use client';

import { useRef, useState, useCallback } from 'react';

interface FormVideoPlayerProps {
  videoUrl: string;
  aspectRatio?: '9:16' | '16:9';
  autoPlay?: boolean;
}

export function FormVideoPlayer({
  videoUrl,
  aspectRatio = '9:16',
  autoPlay = true,
}: FormVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const toggleSpeed = useCallback(() => {
    const newSpeed = speed === 1 ? 0.5 : 1;
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  }, [speed]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoPlay}
        loop
        muted
        playsInline
        className={`w-full ${aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[200px]' : 'aspect-video'} object-cover`}
        onClick={togglePlay}
      />

      {/* Speed toggle */}
      <button
        onClick={toggleSpeed}
        className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md"
      >
        {speed === 1 ? '1x' : '0.5x'}
      </button>

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          onClick={togglePlay}
        >
          <div className="w-12 h-12 rounded-full bg-[#CDFF00] flex items-center justify-center">
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Muscle Activation SVG Component

```typescript
// /src/components/form-library/MuscleActivationMap.tsx
'use client';

import { type MuscleActivation } from '@/lib/form-library/types';

interface MuscleActivationMapProps {
  muscles: MuscleActivation[];
}

const MUSCLE_PATHS: Record<string, string> = {
  pectoralis: 'M120,80 L180,80 L190,120 L110,120 Z',
  deltoidAnterior: 'M100,70 L115,70 L115,100 L100,100 Z',
  triceps: 'M95,105 L105,105 L105,150 L95,150 Z',
  // ... full body SVG paths
};

export function MuscleActivationMap({ muscles }: MuscleActivationMapProps) {
  const primaryMuscles = muscles.filter(m => m.activation === 'primary');
  const secondaryMuscles = muscles.filter(m => m.activation === 'secondary');

  return (
    <div className="flex gap-6">
      <svg viewBox="0 0 300 500" className="w-32 h-auto">
        {/* Body outline */}
        <path d="M150,10 ..." stroke="#333" fill="none" strokeWidth="1.5" />

        {/* Muscle highlights */}
        {muscles.map(muscle => (
          <path
            key={muscle.muscleId}
            d={MUSCLE_PATHS[muscle.muscleId] || ''}
            fill="#CDFF00"
            opacity={muscle.activation === 'primary' ? 0.8 : 0.3}
          />
        ))}
      </svg>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wide mb-1">Primary</p>
          {primaryMuscles.map(m => (
            <p key={m.muscleId} className="text-white">{m.name}</p>
          ))}
        </div>
        <div>
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wide mb-1">Secondary</p>
          {secondaryMuscles.map(m => (
            <p key={m.muscleId} className="text-white">{m.name}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Storage Quota Management

Video caching must respect device storage limits to prevent IndexedDB quota errors on mobile devices.

- **Maximum video cache**: 50MB per device (enforced in code)
- **Quota check before caching**: Before storing any video, check available storage:
  ```typescript
  const estimate = await navigator.storage.estimate();
  const usedPercent = estimate.usage / estimate.quota * 100;
  ```
- **Cache scope**: Cache only exercises in the user's current active program, not all 97+ exercises
- **LRU eviction**: When cache exceeds 50MB, delete least-recently-viewed exercise videos first
- **User warning at 80% quota**: Display toast: "Storage almost full - some exercise videos may not be cached offline"
- **Video compression targets**: 720p max, compressed H.264, target 1-2MB per 15-30s clip
- **Cache manager**: See `src/lib/form-library/cache-manager.ts` for quota checking and LRU eviction logic

### Service Worker Video Caching

```typescript
// /src/lib/form-library/video-cache.ts
export async function cacheFormVideos(exerciseIds: string[]): Promise<void> {
  if (!('caches' in window)) return;

  const cache = await caches.open('form-videos-v1');
  const uncachedIds: string[] = [];

  for (const id of exerciseIds) {
    const url = getFormVideoUrl(id);
    const cached = await cache.match(url);
    if (!cached) {
      uncachedIds.push(id);
    }
  }

  // Background fetch uncached videos
  await Promise.allSettled(
    uncachedIds.map(async (id) => {
      const url = getFormVideoUrl(id);
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    })
  );
}

// Pre-cache all videos for current program
export async function preCacheProgramVideos(
  programExerciseIds: string[]
): Promise<{ cached: number; failed: number }> {
  let cached = 0;
  let failed = 0;

  await Promise.allSettled(
    programExerciseIds.map(async (id) => {
      try {
        await cacheFormVideos([id]);
        cached++;
      } catch {
        failed++;
      }
    })
  );

  return { cached, failed };
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/form-library/types.ts` | Form data types and interfaces |
| `src/lib/form-library/video-storage.ts` | CDN upload and URL generation |
| `src/lib/form-library/video-cache.ts` | Service worker video caching |
| `src/lib/form-library/cache-manager.ts` | Storage quota checking and LRU eviction |
| `src/components/form-library/FormVideoPlayer.tsx` | Looping video player component |
| `src/components/form-library/FormCueCard.tsx` | Individual form cue display |
| `src/components/form-library/MistakeCard.tsx` | Common mistake warning card |
| `src/components/form-library/MuscleActivationMap.tsx` | SVG body diagram |
| `src/components/form-library/FormSheet.tsx` | Bottom sheet container for inline view |
| `src/components/form-library/FormLibraryGrid.tsx` | Browse view with filters |
| `src/app/form-library/page.tsx` | Form library browse page |
| `src/data/form-cues.json` | Static form cue data per exercise |

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/db.ts` | Add exerciseForms and formVideoCache stores |
| `src/components/workout/ExerciseCard.tsx` | Add info icon to open FormSheet |
| `public/sw.js` | Add form-videos cache strategy |
| `src/data/exercises.ts` | Add formVideoUrl field to exercise entries |

---

## 8. Implementation Plan

### Dependencies
- [ ] CDN storage account (Vercel Blob or Cloudflare R2)
- [ ] Form video content (initial batch of 20-30 core exercises)
- [ ] SVG muscle map asset (body outline with labeled regions)

### Build Order

1. [ ] **Define types** - Create form library type definitions
2. [ ] **Extend Dexie schema** - Add exerciseForms and formVideoCache tables
3. [ ] **Create FormVideoPlayer** - Native HTML5 video with loop, speed control
4. [ ] **Create FormCueCard + MistakeCard** - Static display components
5. [ ] **Create MuscleActivationMap** - SVG body diagram component
6. [ ] **Create FormSheet** - Bottom sheet that opens from exercise card
7. [ ] **Wire into ExerciseCard** - Add info icon trigger
8. [ ] **Build FormLibraryGrid** - Browse page with muscle group filters
9. [ ] **Set up CDN storage** - Configure Vercel Blob for video hosting
10. [ ] **Populate initial data** - Create form cues for 20-30 core exercises
11. [ ] **Implement video caching** - Service worker strategy for offline playback
12. [ ] **Test on iOS Safari PWA** - Verify video autoplay, offline, performance

### Agents to Consult
- **Movement Specialist** - Form cue content, common mistakes per exercise
- **Frontend Specialist** - Video player implementation, bottom sheet UX
- **PWA Specialist** - Service worker video caching strategy
- **Audio Engineer** - Video playback compatibility on iOS

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Exercise has no form video | Show placeholder with "Coming soon" and text cues only |
| Poor network (video won't load) | Fall back to cached version; if no cache, show text cues only |
| Very large video file (>10MB) | Compress to 720p, target < 5MB per video |
| User on metered data | Prompt before downloading uncached videos; respect `Save-Data` header |
| Exercise not in form database | Show generic "No form guide available" with link to request one |
| Video format not supported (older browsers) | Provide WebM fallback alongside MP4 |
| Landscape orientation on phone | Expand video to full width, reflow cues below |
| Service worker cache corrupted | Detect failed playback, clear cache entry, re-fetch from CDN on next view |
| User views form sheet while rest timer is running | Keep rest timer counting in the background, show timer badge on sheet header |

---

## 10. Testing

### Functional Tests
- [ ] Video plays inline on exercise card tap
- [ ] Video loops continuously without user interaction
- [ ] Speed toggle switches between 0.5x and 1x
- [ ] Form cues display correctly for each exercise
- [ ] Mistakes section shows warning-styled cards
- [ ] Muscle map highlights correct primary and secondary muscles
- [ ] Form library grid filters by muscle group
- [ ] Search returns relevant exercises
- [ ] "Reviewed" indicator persists across sessions
- [ ] Videos cache correctly for offline playback
- [ ] Works with exercises that have no video yet (graceful fallback)

### UI Verification
- [ ] Video player renders at correct aspect ratio (9:16 and 16:9)
- [ ] Bottom sheet opens smoothly from exercise card
- [ ] All touch targets meet 44px minimum
- [ ] Dark theme colors render correctly on video overlay controls
- [ ] Muscle map SVG is crisp on retina displays
- [ ] Animations smooth at 60fps on scroll and sheet open/close
- [ ] Works offline after initial cache (airplane mode test)
- [ ] Test on iOS Safari PWA (video autoplay restrictions)
- [ ] Test on Android Chrome
- [ ] Video loads within 1.5 seconds on 4G

---

## 11. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] CDN storage configured and videos uploaded
- [ ] Initial 20-30 exercises have form content
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] Offline video playback verified
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Video content creation is expensive/slow | Delayed launch with incomplete library | Start with 20-30 most common exercises; add incrementally |
| CDN costs scale with video views | Unexpected hosting costs | Aggressive caching (cache-first strategy), compress videos |
| iOS Safari blocks video autoplay | Poor UX, users must tap to play | Use `muted` + `playsInline` + `autoplay` attributes (allowed when muted) |
| Large cache size fills device storage | Users with low storage can't cache | Limit cache to current program exercises; add cache management |
| Form cue accuracy (liability) | Incorrect cues could cause injury | Disclaimer: "Consult a trainer for form checks"; review cues with Movement Specialist |

---

## 13. Dependencies

- Requires exercise database (`exercise-database.md` PRD) for exercise IDs and metadata
- CDN storage setup (Vercel Blob or Cloudflare R2) - infrastructure decision needed
- Content creation pipeline for form videos (can start with stock/licensed content)
- SVG body diagram asset (open-source options available: musclewiki.com style)

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: renumbered all 14 sections to match standard, added 2 edge cases (cache corruption, form sheet during rest timer) |
| 2026-03-26 | SHIPPED: 30 exercises with form cues, breathing patterns, muscle data. Browse page with search/filter. FormSheet accessible from workout exercise cards via info icon. |
