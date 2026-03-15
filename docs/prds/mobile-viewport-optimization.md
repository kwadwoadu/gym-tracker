# Mobile Viewport Optimization

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-16
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

SetFlow has horizontal scroll on some mobile screens, breaking the PWA experience. Two root causes identified:

### 1.1 Bottom Tab Bar Overflow

The bottom tab bar (`src/components/layout/bottom-tab-bar.tsx`) has 6 buttons (5 tabs + More), each with `min-w-[64px]`:

- 6 buttons x 64px = 384px minimum
- Plus `px-2` container padding = ~400px needed
- iPhone SE viewport = 375px, standard iPhone = 390px
- Both overflow horizontally, causing a scrollbar

**Affected lines:** 78 (tab button class) and 95 (More button class)

### 1.2 Warmup Exercise Badge Cutoff

The pre-workout dashboard (`src/components/home/PreWorkoutDashboard.tsx`) shows warmup exercises with a badge ("X reps"). The badge has `shrink-0` preventing flex shrinking, and the exercise name has no truncation:

- Long exercise names + non-shrinkable badge = content exceeds container width
- Right-side cutoff visible where "reps" badges get clipped

**Affected lines:** 69-71

---

## 2. Solution

### 2.1 Tab Bar Fix

Replace `min-w-[64px]` with `flex-1 min-w-0` on both the tab buttons and the More button. This allows buttons to share available space equally and shrink below 64px on narrow viewports.

| File | Line | Change |
|------|------|--------|
| `bottom-tab-bar.tsx` | 78 | Replace `min-w-[64px]` with `flex-1 min-w-0` |
| `bottom-tab-bar.tsx` | 95 | Replace `min-w-[64px]` with `flex-1 min-w-0` |

**Before:**
```tsx
"flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-[49px] transition-colors"
```

**After:**
```tsx
"flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-[49px] transition-colors"
```

### 2.2 Warmup Badge Fix

Add `min-w-0` to the flex container and `truncate` to the exercise name so long names get ellipsized instead of pushing content off-screen.

| File | Line | Change |
|------|------|--------|
| `PreWorkoutDashboard.tsx` | 69 | Add `min-w-0` to the flex container div |
| `PreWorkoutDashboard.tsx` | 70 | Add `truncate` to exercise name `<p>` |

**Before:**
```tsx
<div className="flex items-center justify-between">
  <p className="text-sm font-medium text-white">{name}</p>
```

**After:**
```tsx
<div className="flex items-center justify-between min-w-0">
  <p className="text-sm font-medium text-white truncate">{name}</p>
```

---

## 3. Success Metrics

| Metric | Target |
|--------|--------|
| Horizontal scroll on any screen | 0 occurrences |
| Tab bar fits iPhone SE (375px) | No overflow |
| Tab bar fits standard iPhone (390px) | No overflow |
| Warmup exercises display without cutoff | All badges visible |

---

## 4. Implementation Checklist

- [ ] Fix tab bar: change `min-w-[64px]` to `flex-1 min-w-0` on tab button (line 78)
- [ ] Fix tab bar: change `min-w-[64px]` to `flex-1 min-w-0` on More button (line 95)
- [ ] Fix warmup: add `min-w-0` to flex container div (line 69)
- [ ] Fix warmup: add `truncate` to exercise name `<p>` (line 70)
- [ ] Test on 375px viewport (iPhone SE)
- [ ] Test on 390px viewport (standard iPhone)
- [ ] Verify no horizontal scroll on Home, Program, Stats, Nutrition, Settings
- [ ] Verify tab labels still readable on narrow screens

---

## 5. Launch Criteria

- [ ] No horizontal scroll on any screen at 375px+ viewport width
- [ ] All tab icons and labels visible and tappable
- [ ] Warmup exercise names truncate gracefully with ellipsis
- [ ] Warmup badges ("X reps") fully visible
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Tab labels get too narrow on iPhone SE | Labels are short (4-8 chars), 62px per tab at 375px is sufficient |
| Truncated exercise names lose meaning | Truncation only kicks in for very long names; most exercise names fit |

---

*Created: 2026-03-16*
