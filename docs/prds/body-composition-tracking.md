# Body Composition Tracking

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

SetFlow currently tracks workout performance (weights, reps, sets) but provides no way to track the physical outcomes of training. Users cannot answer the question: "Is my training actually changing my body?"

Key gaps:
1. **No weight tracking** - Users must use a separate app or spreadsheet to log body weight, losing the correlation between training and weight changes
2. **No visual progress** - Progress photos are scattered across phone camera rolls with no structured comparison capability
3. **No measurement tracking** - Circumference measurements (arms, chest, waist) are the most reliable indicators of muscle gain vs fat loss, but aren't captured anywhere
4. **No trend analysis** - Day-to-day weight fluctuations (hydration, food timing) cause anxiety; users need smoothed trend lines to see actual progress
5. **No body composition context** - Without body fat estimation, users can't distinguish muscle gain from fat gain when weight increases

For a gym-focused app, body composition data completes the feedback loop: training inputs (SetFlow tracks) lead to body composition outputs (currently untracked).

---

## 2. Solution

Add a Body Composition module to SetFlow with four interconnected features: weight logging with trend analysis, progress photo comparison, body measurements, and body fat estimation.

### Weight Log with Trend Line
- Daily weight entry (manual or Apple Health import)
- 7-day moving average trend line smoothing daily fluctuations
- Weekly/monthly/all-time period views
- Color-coded trend direction (gaining, losing, maintaining)

### Progress Photos
- Structured photo capture with pose guides (front, side, back)
- Side-by-side comparison slider between any two dates
- Canvas-based overlay for visual comparison
- Photos stored locally in IndexedDB (never uploaded)

### Measurement Tracking
- Track: chest, waist, hips, left/right biceps, left/right thighs, left/right calves, neck, shoulders
- Historical chart per measurement site
- Change indicators (delta from last measurement)

### Body Fat Estimation
- Navy method calculator (neck, waist, height + hip for women)
- Visual reference chart (photo examples of body fat percentages)
- Trend tracking alongside weight

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Weight log entries per week | 4+ entries per active user | Count daily weight entries per user per week |
| Photo log frequency | 1+ comparison per month | Track photo capture events |
| Measurement update frequency | Bi-weekly updates | Track measurement entry events |
| Feature retention | 60% still using after 30 days | Cohort analysis on first use vs Day 30 |
| Correlation views | 50% of users view weight + workout overlay | Track chart mode toggles |

---

## 4. Requirements

### Must Have
- [ ] Daily weight entry with number pad input (kg/lbs toggle)
- [ ] Weight trend chart with 7-day moving average line
- [ ] Period selector: 1 week, 1 month, 3 months, 6 months, 1 year, all
- [ ] Progress photo capture with front/side/back pose guides
- [ ] Side-by-side photo comparison with date selector
- [ ] Measurement tracking for 10 body sites
- [ ] Measurement history chart per site
- [ ] Body fat estimation via Navy method
- [ ] All data stored locally in Dexie.js (offline-first)
- [ ] Navigation: new "Body" tab in bottom nav or accessible from stats

### Should Have
- [ ] Canvas-based photo overlay slider (swipe to compare)
- [ ] Weight goal line on trend chart (target weight)
- [ ] Export measurements as CSV
- [ ] Visual body fat reference chart with photo examples
- [ ] Rate of change indicator (kg/week trend)
- [ ] Measurement reminders (prompt to update every 2 weeks)

### Won't Have (this version)
- Apple Health / Google Fit integration for auto weight sync
- DEXA scan import
- AI-powered body fat estimation from photos
- Social sharing of progress photos
- BMI calculation (not useful for trained individuals)

---

## 5. User Flow

### Flow 1: Log Weight
1. User navigates to Body tab
2. Weight chart is primary view, showing 30-day trend
3. User taps "+" button (floating action button)
4. Number pad opens with last weight pre-filled
5. User adjusts weight (e.g., 82.3 kg)
6. Taps "Save" - entry appears on chart
7. 7-day moving average updates

### Flow 2: Take Progress Photo
1. User navigates to Body > Photos tab
2. User taps "New Photo"
3. Pose guide overlay appears (front silhouette)
4. User takes photo (or selects from gallery)
5. Repeats for side and back poses
6. Photos saved with date tag
7. User can immediately compare with previous set

### Flow 3: Compare Progress
1. User navigates to Body > Photos tab
2. Sees grid of photo sets by date
3. Taps "Compare"
4. Selects two dates (e.g., Jan 15 vs Mar 1)
5. Side-by-side view with slider overlay
6. User slides to transition between before/after

### Flow 4: Log Measurements
1. User navigates to Body > Measurements tab
2. Sees current measurements with last update date
3. Taps "Update Measurements"
4. Form shows all 10 sites with previous values pre-filled
5. User updates changed measurements
6. Taps "Save" - deltas shown (e.g., "+1.2 cm biceps")

### Flow 5: Check Body Fat
1. User navigates to Body > Body Fat tab
2. Enters/confirms: height, neck circumference, waist circumference
3. For women: also hip circumference
4. Navy method calculates estimate (e.g., 18.5%)
5. Visual reference shows where this falls on the body fat spectrum
6. Value added to body fat trend chart

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `WeightChart` | Recharts line chart with trend overlay |
| `WeightInput` | Number pad for quick weight entry |
| `PhotoCapture` | Camera view with pose guide overlay |
| `PhotoComparison` | Side-by-side slider comparison |
| `MeasurementForm` | Multi-field form for body measurements |
| `MeasurementChart` | Per-site trend chart |
| `BodyFatCalculator` | Navy method input and result display |
| `BodyFatReference` | Visual photo reference for body fat % |
| `BodyTabs` | Tab navigation: Weight, Photos, Measurements, Body Fat |

### Visual Design

**Weight Chart**:
- Background: `#0A0A0A`
- Daily dots: `#666666` (6px)
- 7-day average line: `#CDFF00` (2px, smooth curve)
- Goal line: `#CDFF00` dashed (1px)
- Grid lines: `#1A1A1A`
- Period pills: `#1A1A1A` bg, `#CDFF00` active
- Trend indicator: Green arrow up, red arrow down, yellow dash for maintaining

**Photo Comparison**:
- Full-width images
- Divider line: 2px `#CDFF00`
- Date labels: 12px white on `#000000/80` overlay at top
- Slider handle: 32px circle, `#CDFF00` fill, white grip lines

**Measurement Cards**:
- Background: `#1A1A1A`
- Site name: 14px `#A0A0A0`
- Value: 24px bold white
- Delta: 12px `#22C55E` (increase) or `#EF4444` (decrease)
- Last updated: 10px `#666666`

### Wireframe - Weight Tab

```
+------------------------------------------+
| Body                             [units] |
+------------------------------------------+
| [Weight] [Photos] [Measure] [Body Fat]   |
+------------------------------------------+
|                                          |
| TODAY: 82.3 kg         Trend: -0.3/week  |
|                                          |
| +--------------------------------------+ |
| |  84 .                                | |
| |      .    .                          | |
| |  83   .  . .  .                      | |
| |        ..   ..  ~~~~  <- 7d avg      | |
| |  82           .  ....~~~~            | |
| |                .......               | |
| |  81  - - - - - - - - - - <- goal    | |
| |                                      | |
| |  |  1W  | 1M | 3M | 6M | 1Y | ALL  | |
| +--------------------------------------+ |
|                                          |
| RECENT ENTRIES                           |
| +--------------------------------------+ |
| | Mar 4   82.3 kg         -0.2         | |
| | Mar 3   82.5 kg         +0.1         | |
| | Mar 2   82.4 kg         -0.3         | |
| | Mar 1   82.7 kg         +0.4         | |
| +--------------------------------------+ |
|                                          |
|                              [+ Log]     |
+------------------------------------------+
```

### Wireframe - Photo Comparison

```
+------------------------------------------+
| Compare Progress              [X close]  |
+------------------------------------------+
| Jan 15, 2026      |      Mar 4, 2026    |
+------------------------------------------+
|                    |                      |
|                    |                      |
|    [BEFORE         |        AFTER]       |
|    [PHOTO]         |        [PHOTO]      |
|                    |                      |
|                    |                      |
|              [<==slider==>]              |
|                    |                      |
+------------------------------------------+
| Weight: 85.1 kg    |    Weight: 82.3 kg  |
| BF%: 20.2%         |    BF%: 18.5%       |
+------------------------------------------+
| [< Prev Set]              [Next Set >]   |
+------------------------------------------+
```

### Wireframe - Measurements

```
+------------------------------------------+
| Body                                      |
+------------------------------------------+
| [Weight] [Photos] [Measure] [Body Fat]   |
+------------------------------------------+
|                                          |
| Last updated: Feb 20, 2026               |
|                                          |
| UPPER BODY                               |
| +--------+ +--------+ +--------+        |
| | Chest  | | Shldrs | | Neck   |        |
| | 101 cm | | 118 cm | | 38 cm  |        |
| | +1.5   | | +0.5   | |  --    |        |
| +--------+ +--------+ +--------+        |
|                                          |
| ARMS                                     |
| +--------+ +--------+                    |
| | L Bicep| | R Bicep|                    |
| | 37 cm  | | 37.5cm |                    |
| | +0.5   | | +0.5   |                    |
| +--------+ +--------+                    |
|                                          |
| MIDSECTION                               |
| +--------+ +--------+                    |
| | Waist  | | Hips   |                    |
| | 82 cm  | | 96 cm  |                    |
| | -1.0   | | -0.5   |                    |
| +--------+ +--------+                    |
|                                          |
| LEGS                                     |
| +--------+ +--------+ +--------+        |
| | L Thigh| | R Thigh| | L Calf |        |
| | 58 cm  | | 58.5cm | | 38 cm  |        |
| | +0.5   | |  --    | | +0.2   |        |
| +--------+ +--------+ +--------+        |
|                                          |
| [======= Update Measurements ========]  |
+------------------------------------------+
```

---

## 7. Technical Spec

### Data Schema (Dexie.js)

```typescript
// /src/lib/body-composition/types.ts
export interface WeightEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  weight: number;       // in kg (convert from lbs in UI)
  unit: 'kg' | 'lbs';
  createdAt: string;    // ISO timestamp
}

export interface ProgressPhoto {
  id: string;
  date: string;         // YYYY-MM-DD
  pose: 'front' | 'side' | 'back';
  blob: Blob;           // Photo stored as Blob in IndexedDB
  thumbnailBlob: Blob;  // Compressed thumbnail for grid view
  createdAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;         // YYYY-MM-DD
  chest?: number;       // cm
  shoulders?: number;
  waist?: number;
  hips?: number;
  neck?: number;
  leftBicep?: number;
  rightBicep?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  unit: 'cm' | 'in';
  createdAt: string;
}

export interface BodyFatEntry {
  id: string;
  date: string;
  percentage: number;
  method: 'navy' | 'manual';
  createdAt: string;
}
```

### Photo Storage Strategy

Progress photos must be compressed on capture to stay within device storage limits.

- **Compress on capture**: Resize all photos to 720p max using canvas resize before storing
- **Full-res photo**: Target 300-500KB JPEG (quality 0.7)
- **Thumbnail**: 200px wide, target 30-50KB JPEG (quality 0.5)
- **Storage budget**: ~50MB for photos (approximately 100 photo sets at 500KB each)
- **Warning at 80%**: Alert user when photo storage approaches the 50MB budget
- **Cleanup option**: Add "Clear old photos" option in settings (delete photos older than user-selected threshold)
- **Compression utility**: See `src/lib/body-composition/photo-compression.ts` for canvas-based resize

### Dexie.js Schema Extension

```typescript
// /src/lib/db.ts (extend existing schema)
db.version(nextVersion).stores({
  // ... existing stores
  weightEntries: 'id, date',
  progressPhotos: 'id, date, pose',
  bodyMeasurements: 'id, date',
  bodyFatEntries: 'id, date',
});
```

### 7-Day Moving Average Calculation

```typescript
// /src/lib/body-composition/weight-analysis.ts
import { type WeightEntry } from './types';

export function calculateMovingAverage(
  entries: WeightEntry[],
  windowSize: number = 7
): { date: string; value: number }[] {
  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  return sorted.map((entry, index) => {
    const windowStart = Math.max(0, index - windowSize + 1);
    const window = sorted.slice(windowStart, index + 1);
    const avg = window.reduce((sum, e) => sum + e.weight, 0) / window.length;

    return {
      date: entry.date,
      value: Math.round(avg * 10) / 10, // 1 decimal place
    };
  });
}

export function calculateWeeklyRate(
  entries: WeightEntry[]
): number | null {
  if (entries.length < 7) return null;

  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date)
  );
  const recent = sorted.slice(-7);
  const older = sorted.slice(-14, -7);

  if (older.length === 0) return null;

  const recentAvg = recent.reduce((s, e) => s + e.weight, 0) / recent.length;
  const olderAvg = older.reduce((s, e) => s + e.weight, 0) / older.length;

  return Math.round((recentAvg - olderAvg) * 10) / 10;
}

export type WeightTrend = 'gaining' | 'losing' | 'maintaining';

export function getWeightTrend(weeklyRate: number | null): WeightTrend {
  if (weeklyRate === null) return 'maintaining';
  if (weeklyRate > 0.1) return 'gaining';
  if (weeklyRate < -0.1) return 'losing';
  return 'maintaining';
}
```

### Navy Method Body Fat Calculator

```typescript
// /src/lib/body-composition/body-fat.ts
export interface NavyMethodInput {
  gender: 'male' | 'female';
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // Required for female
}

export function calculateNavyBodyFat(input: NavyMethodInput): number {
  const { gender, heightCm, neckCm, waistCm, hipCm } = input;

  if (gender === 'male') {
    // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
    return Math.round(bf * 10) / 10;
  }

  // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
  if (!hipCm) throw new Error('Hip measurement required for female calculation');

  const bf =
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + hipCm - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450;
  return Math.round(bf * 10) / 10;
}
```

### Photo Comparison Component

```typescript
// /src/components/body-composition/PhotoComparison.tsx
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface PhotoComparisonProps {
  beforeUrl: string;
  afterUrl: string;
  beforeDate: string;
  afterDate: string;
}

export function PhotoComparison({
  beforeUrl,
  afterUrl,
  beforeDate,
  afterDate,
}: PhotoComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons !== 1) return;
      handleMove(e.clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] overflow-hidden rounded-xl select-none touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full width, behind) */}
      <img
        src={afterUrl}
        alt={`Progress photo ${afterDate}`}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before image (clipped by slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeUrl}
          alt={`Progress photo ${beforeDate}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#CDFF00] z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#CDFF00] flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* Date labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {beforeDate}
      </div>
      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {afterDate}
      </div>
    </div>
  );
}
```

### Weight Chart Component

```typescript
// /src/components/body-composition/WeightChart.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { calculateMovingAverage } from '@/lib/body-composition/weight-analysis';
import { type WeightEntry } from '@/lib/body-composition/types';

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight?: number;
  period: '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
}

export function WeightChart({ entries, goalWeight, period }: WeightChartProps) {
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (period) {
      case '1w': cutoff.setDate(now.getDate() - 7); break;
      case '1m': cutoff.setMonth(now.getMonth() - 1); break;
      case '3m': cutoff.setMonth(now.getMonth() - 3); break;
      case '6m': cutoff.setMonth(now.getMonth() - 6); break;
      case '1y': cutoff.setFullYear(now.getFullYear() - 1); break;
      case 'all': return entries;
    }

    return entries.filter(e => new Date(e.date) >= cutoff);
  }, [entries, period]);

  const movingAvg = useMemo(
    () => calculateMovingAverage(filteredEntries),
    [filteredEntries]
  );

  const chartData = useMemo(() => {
    return filteredEntries.map((entry, i) => ({
      date: entry.date,
      weight: entry.weight,
      average: movingAvg[i]?.value,
    }));
  }, [filteredEntries, movingAvg]);

  return (
    <div className="w-full h-[250px] bg-[#0A0A0A]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            stroke="#666"
            tick={{ fontSize: 10, fill: '#666' }}
            tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 10, fill: '#666' }}
            domain={['auto', 'auto']}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: '#1A1A1A', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#A0A0A0' }}
          />

          {/* Daily weight dots */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#666"
            strokeWidth={0}
            dot={{ fill: '#666', r: 3 }}
            activeDot={{ fill: '#CDFF00', r: 5 }}
          />

          {/* 7-day moving average */}
          <Line
            type="monotone"
            dataKey="average"
            stroke="#CDFF00"
            strokeWidth={2}
            dot={false}
          />

          {/* Goal line */}
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="#CDFF00"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Chart Performance

Recharts can struggle with large datasets on low-end devices. Apply these optimizations:

- **Memoization**: Wrap `WeightChart` in `React.memo()` to prevent unnecessary re-renders
- **Downsampling for 3M+ periods**: Reduce 365 daily points to 52 weekly averages
- **Downsampling for "All" period**: If more than 1 year of data, downsample to monthly averages
- **Performance budget**: Chart must render in < 500ms on iPhone 8 equivalent
- **Testing target**: Verify 60fps scrolling on lowest-target device (iPhone SE) using DevTools performance profiler

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/body-composition/types.ts` | Data types for weight, photos, measurements |
| `src/lib/body-composition/weight-analysis.ts` | Moving average, trend calculation |
| `src/lib/body-composition/body-fat.ts` | Navy method calculator |
| `src/components/body-composition/WeightChart.tsx` | Recharts weight trend chart |
| `src/components/body-composition/WeightInput.tsx` | Number pad weight entry |
| `src/components/body-composition/PhotoCapture.tsx` | Camera with pose guide overlay |
| `src/components/body-composition/PhotoComparison.tsx` | Side-by-side slider comparison |
| `src/components/body-composition/MeasurementForm.tsx` | Multi-field body measurement input |
| `src/components/body-composition/MeasurementChart.tsx` | Per-site trend chart |
| `src/components/body-composition/BodyFatCalculator.tsx` | Navy method input form |
| `src/components/body-composition/BodyFatReference.tsx` | Visual body fat % reference |
| `src/components/body-composition/BodyTabs.tsx` | Tab navigation for body section |
| `src/app/body/page.tsx` | Body composition main page |
| `src/app/body/photos/page.tsx` | Photo comparison page |
| `src/lib/body-composition/photo-compression.ts` | Canvas-based photo resize and compression |

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/db.ts` | Add weightEntries, progressPhotos, bodyMeasurements, bodyFatEntries stores |
| `src/components/shared/BottomNav.tsx` | Add "Body" tab to bottom navigation |
| `src/app/layout.tsx` | Include body route in navigation config |

---

## 8. Implementation Plan

### Dependencies
- [ ] Recharts already in project (used for stats charts)
- [ ] Dexie.js already in project (IndexedDB wrapper)
- [ ] No new external dependencies required
- [ ] Camera API available via standard `navigator.mediaDevices`

### Build Order

1. [ ] **Define types** - Create body composition type definitions
2. [ ] **Extend Dexie schema** - Add 4 new tables (weight, photos, measurements, body fat)
3. [ ] **Build weight analysis utils** - Moving average, trend, weekly rate
4. [ ] **Build Navy method calculator** - Body fat estimation logic
5. [ ] **Create WeightChart** - Recharts line chart with trend overlay
6. [ ] **Create WeightInput** - Number pad component for quick entry
7. [ ] **Create Body page** - Main page with tab navigation
8. [ ] **Create PhotoCapture** - Camera integration with pose guides
9. [ ] **Create PhotoComparison** - Canvas-based slider comparison
10. [ ] **Create MeasurementForm** - Multi-field input with pre-fill
11. [ ] **Create MeasurementChart** - Per-site trend visualization
12. [ ] **Create BodyFatCalculator** - Navy method form and result
13. [ ] **Wire bottom navigation** - Add "Body" tab to bottom nav
14. [ ] **Test on iOS Safari PWA** - Camera permissions, IndexedDB photo storage

### Agents to Consult
- **Frontend Specialist** - Chart configuration, photo comparison UX
- **Database Specialist** - Dexie.js schema for large Blob storage (photos)
- **PWA Specialist** - Camera API on iOS Safari, IndexedDB storage limits
- **Progress Analyst** - Weight trend analysis, meaningful rate-of-change thresholds

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| First weight entry (no trend data) | Show single dot, no trend line until 3+ entries |
| Massive weight change (>5kg in a day) | Confirm with user: "Are you sure? This is a large change" |
| Multiple entries same day | Keep most recent entry, show edit option |
| No photos yet for comparison | Show "Take your first progress photo" prompt |
| Camera permission denied | Fall back to photo gallery picker |
| IndexedDB storage full (many photos) | Warn user, suggest exporting old photos |
| Unit switch mid-data (kg to lbs) | Convert all historical data on toggle, store canonical in kg |
| Navy method gives unrealistic result (<5% or >50%) | Show warning: "Result may be inaccurate - check measurements" |
| Missing measurement fields | Allow partial entries, only calculate body fat when required fields present |
| Photo Blob exceeds IndexedDB quota on older iOS devices | Catch QuotaExceededError, prompt user to free space or reduce photo quality |
| User switches between metric and imperial rapidly | Debounce unit toggle, only convert once per 500ms to prevent rounding drift |

---

## 10. Testing

### Functional Tests
- [ ] Weight entry saves to IndexedDB correctly
- [ ] 7-day moving average calculates correctly (verified against manual calculation)
- [ ] Period filters show correct date ranges
- [ ] Weekly rate of change is accurate
- [ ] Trend detection (gaining/losing/maintaining) triggers at correct thresholds
- [ ] Navy method matches reference calculator values
- [ ] Photo capture saves to IndexedDB as Blob
- [ ] Photo comparison slider moves smoothly
- [ ] Measurements save with correct units (cm/in conversion)
- [ ] Delta calculations are correct (current vs previous)
- [ ] kg/lbs toggle converts and displays correctly
- [ ] Goal weight reference line appears on chart
- [ ] Data persists across app close and reopen

### UI Verification
- [ ] Weight chart renders smoothly with 365 data points
- [ ] Number pad touch targets are 48px+ minimum
- [ ] Photo comparison slider is responsive to touch
- [ ] Measurement cards display correctly on iPhone SE (small viewport)
- [ ] Dark theme colors render correctly on all components
- [ ] Camera viewfinder fills screen with pose guide overlay
- [ ] Tab navigation scrolls horizontally if needed
- [ ] Works offline (all data from local cache)
- [ ] Test on iOS Safari PWA (camera permissions)
- [ ] Test on Android Chrome

---

## 11. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] IndexedDB migration tested (upgrade path from current schema)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested (camera, photo storage)
- [ ] Offline functionality verified
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IndexedDB photo storage fills up | Users lose ability to save new photos | Compress photos to 1080p max, implement storage quota warning |
| Weight fluctuations cause anxiety | Users obsess over daily changes | Emphasize 7-day average as "true weight", de-emphasize daily values |
| Navy method accuracy is limited | Users make decisions based on inaccurate body fat % | Add disclaimer: "Estimate only - DEXA for accurate measurement" |
| Camera API inconsistencies across browsers | Photos don't capture on some devices | Fall back to file input picker, test on top 5 devices |
| Chart performance with large datasets | Slow rendering with 1000+ data points | Downsample data for long periods (weekly averages for 1Y+) |

---

## 13. Dependencies

- Recharts (already installed) for weight and measurement charts
- Dexie.js (already installed) for local data storage
- No new npm dependencies required
- Camera API is native browser capability
- Should be implemented after core workout tracking is stable

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: renumbered all 14 sections to match standard, added 2 edge cases (quota exceeded, unit toggle debounce) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
