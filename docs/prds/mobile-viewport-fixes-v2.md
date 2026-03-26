# PRD: Mobile Viewport Fixes v2

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-26
> **Priority:** P1
> **Roadmap Phase:** Maintenance

---

## 1. Problem

Two mobile layout bugs break the SetFlow PWA on phones (375px-430px viewports):

**Bug A: Home page horizontal overflow**
The "HOW ARE YOU FEELING?" emoji row in RecoveryAssessment forces 5 emoji buttons into a single `flex justify-between` row with `flex-1` on each. On 375px screens, the 5th emoji ("Great") gets clipped off the right edge, and the entire page gains unwanted horizontal scroll.

**Bug B: AI Coach chat input invisible**
The trainer page's chat input bar uses `fixed bottom-0` positioning. The bottom tab bar (`bottom-tab-bar.tsx`) also uses `fixed bottom-0 z-40` with 49px height. The nav bar completely covers the input field, making it impossible to type messages to the AI Coach.

Both bugs affect every mobile user on every session.

---

## 2. Solution

**Bug A:** Make the emoji row responsive by centering buttons with consistent gap spacing and preventing overflow. Remove `flex-1` that forces equal-width buttons and add `flex-shrink-0` so they don't compress below their natural size.

**Bug B:** Offset the trainer input bar above the bottom nav by using `bottom-[60px]` instead of `bottom-0`. Increase the message area bottom padding to prevent messages from hiding behind the input.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Emoji row fully visible | All 5 emojis visible and tappable on iPhone SE (375px) | Visual check in DevTools mobile emulation |
| No horizontal scroll on home | Zero horizontal overflow | DevTools Elements panel, no scrollbar |
| Chat input visible on trainer | Input field and send button visible above nav | Screenshot on 375px viewport |
| Messages scrollable to input | Last message visible above input bar | Manual scroll test |

---

## 4. Requirements

### Must Have
- [x] All 5 recovery emojis visible on 375px viewport
- [x] No horizontal page scroll on home page
- [x] AI Coach chat input visible above bottom navigation
- [x] Messages don't hide behind input bar (adequate bottom padding)
- [x] Touch targets remain 44px+ minimum

### Should Have
- [x] Emoji row centered, not edge-to-edge
- [x] Consistent spacing between emojis across viewport sizes

### Won't Have (this version)
- Responsive emoji grid (2 rows on very small screens)
- Hiding bottom nav on trainer page

---

## 5. User Flow

### Bug A: Emoji Row
1. User opens SetFlow home page on mobile
2. RestDayDashboard or PreWorkoutDashboard shows recovery assessment
3. All 5 emojis (Exhausted, Tired, Moderate, Good, Great) are visible and tappable
4. Page has no horizontal scroll

### Bug B: AI Coach
1. User navigates to AI Coach (via FAB or More menu)
2. Chat messages display with welcome message
3. Input field is visible above the bottom nav bar
4. User can type and send messages
5. Response appears in chat, scrolling works correctly

---

## 6. Design

### Bug A: Emoji Row (Before/After)

Before:
```
[Exhausted][Tired][Moderate][Good][Gr...  <- cut off
```

After:
```
  [Exhausted] [Tired] [Moderate] [Good] [Great]
  ^-- centered with even gaps, all visible --^
```

### Bug B: AI Coach (Before/After)

Before:
```
| Chat messages...          |
|                           |
| [Home][Program][Stats]... | <- nav covers input
```

After:
```
| Chat messages...          |
| [Ask your AI coach...][>] | <- input above nav
| [Home][Program][Stats]... | <- nav below
```

---

## 7. Technical Spec

### Files to Modify

| File | Change |
|------|--------|
| `src/components/rest-day/RecoveryAssessment.tsx` | Fix emoji row: replace `flex justify-between` with `flex justify-center gap-3`, remove `flex-1`, add `flex-shrink-0` |
| `src/app/trainer/page.tsx` | Fix input: change `fixed bottom-0` to `fixed bottom-[60px]`, update message area `pb-32` to `pb-44` |

### RecoveryAssessment.tsx Changes (line ~63)

Current:
```tsx
<div className="flex items-center justify-between gap-1">
```

Fix:
```tsx
<div className="flex items-center justify-center gap-3">
```

Current emoji buttons (line ~69):
```tsx
<button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl ...">
```

Fix:
```tsx
<button className="flex-shrink-0 w-16 flex flex-col items-center gap-1 py-2 rounded-xl ...">
```

### trainer/page.tsx Changes (line ~251)

Current:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-background/95 ...">
```

Fix:
```tsx
<div className="fixed bottom-[60px] left-0 right-0 bg-background/95 ...">
```

Current message area (line ~180):
```tsx
<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
```

Fix:
```tsx
<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-44">
```

---

## 8. Implementation Plan

### Dependencies
- None, pure CSS/className changes

### Build Order
1. [x] Fix emoji row in RecoveryAssessment.tsx
2. [x] Fix trainer input positioning in trainer/page.tsx
3. [x] Test on 375px viewport (iPhone SE)
4. [x] Deploy to Vercel

---

## 9. Testing

- [x] All 5 emojis visible on 375px viewport
- [x] No horizontal scroll on home page
- [x] Chat input visible above bottom nav on trainer page
- [x] Can type and send messages in AI Coach
- [x] Messages scroll correctly, last message not hidden
- [x] Touch targets 44px+ on all buttons
- [x] Works on iOS Safari PWA

---

## 10. Launch Checklist

- [x] Code complete
- [x] Visual verification on mobile
- [x] Deploy to gym.adu.dk

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Initial PRD created |
