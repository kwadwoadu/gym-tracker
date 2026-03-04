# Settings Page Restructure

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

The settings page (`/settings`) is a single 1,061-line file that renders every setting on one scrollable page. This causes several issues:

- **Overwhelming UX**: Users must scroll through 1050px+ of settings to find what they need
- **No organization**: Profile settings, training preferences, nutrition targets, and data management are all interleaved on one page
- **Performance**: The entire page renders on mount, including nutrition profile queries, export/import logic, profile mutations, and program data - even if the user only wants to change one setting
- **Maintainability**: A single 1000+ line React component is difficult to modify, test, and review

The settings page currently contains these distinct sections:
1. **Profile**: Display name, bio, handle, avatar, sharing preferences
2. **Training**: Weight unit, progression increment, rest timer defaults, sound/vibration
3. **Nutrition**: Calorie targets (training/rest days), macros, phase, gain rate, check intervals
4. **Data**: Export, import, reset, sign out

A user who wants to change their rest timer duration must scroll past profile fields and find it among training settings. A user who wants to export data must scroll to the very bottom.

---

## 2. Solution

Split the settings page into four sub-pages, each on its own route:

### Settings Index (`/settings`)
A clean list of 4 categories with icons, each linking to its sub-page:
- Profile (user icon)
- Training (dumbbell icon)
- Nutrition (utensils icon)
- Data (database icon)

Add a search bar at the top that filters settings across all categories.

### Sub-pages
- `/settings/profile` - Display name, bio, handle, avatar, sharing preferences, sign out
- `/settings/training` - Weight unit, progression, rest timer, sound, vibration, program management
- `/settings/nutrition` - Calorie targets, macros, phase, gain rate, check intervals
- `/settings/data` - Export, import, reset program, account management

Each sub-page is its own file, keeping component size under 300 lines.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Setting reachability | Any setting in 2 taps from home | UX audit: home -> settings -> category -> setting |
| Settings page load time | < 500ms (from ~800ms current) | Performance profiler |
| Search usage | 20% of settings visitors use search | Track search input focus events |
| Settings file LOC | Each sub-page < 300 lines | Code metrics |
| User satisfaction | Reduced support questions about "where is X setting" | Support ticket tracking |

---

## 4. Requirements

### Must Have
- [ ] Settings index page with 4 category cards
- [ ] Profile sub-page (`/settings/profile`)
- [ ] Training sub-page (`/settings/training`)
- [ ] Nutrition sub-page (`/settings/nutrition`)
- [ ] Data sub-page (`/settings/data`)
- [ ] Back navigation from each sub-page to settings index
- [ ] All existing settings preserved with identical functionality

### Should Have
- [ ] Search bar on settings index that filters across all categories
- [ ] Setting count badge on each category card
- [ ] Last-modified indicator on categories ("Updated 2 days ago")
- [ ] Smooth page transitions between settings and sub-pages
- [ ] Success toast after saving any setting

### Won't Have (this version)
- Deep linking to individual settings (e.g., `/settings/training#rest-timer`)
- Settings sync across devices
- Settings profiles/presets
- Undo for setting changes
- Settings import/export (separate from data export)

---

## 5. User Flow

### Flow 1: Change Rest Timer
1. User taps Settings icon (gear) from home page
2. Settings index shows 4 category cards
3. User taps "Training" card
4. Training settings page loads with rest timer, progression, unit, sound sections
5. User adjusts rest timer slider
6. Setting auto-saves on change
7. User taps back arrow to return to settings index

### Flow 2: Search for a Setting
1. User opens Settings
2. Taps search bar at top
3. Types "calor"
4. Search results show: "Calories (Training Day)" and "Calories (Rest Day)" under Nutrition
5. User taps result
6. Navigates to `/settings/nutrition` with the calorie section scrolled into view

### Flow 3: Export Data
1. User opens Settings
2. Taps "Data" card
3. Data page shows Export, Import, Reset sections
4. User taps "Export All Data"
5. JSON file downloads
6. Success toast: "Data exported successfully"

### Flow 4: Sign Out
1. User opens Settings
2. Taps "Profile" card
3. Scrolls to bottom of profile page
4. Taps "Sign Out" button
5. Confirmation dialog appears
6. User confirms, redirected to landing page

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `SettingsIndex` | Category list with search |
| `SettingsCategoryCard` | Tappable card for each category |
| `SettingsSearch` | Search input with cross-category filtering |
| `SettingsHeader` | Back button + category title |
| `ProfileSettings` | Profile sub-page content |
| `TrainingSettings` | Training sub-page content |
| `NutritionSettings` | Nutrition sub-page content |
| `DataSettings` | Data sub-page content |

### Visual Design

**Settings Index**:
- Search bar: full-width, 44px height, `#1A1A1A` bg, magnifying glass icon
- Category cards: full-width, 72px height, icon left, title + subtitle, chevron right
- Card backgrounds: `#1A1A1A`
- Card spacing: 8px gap

**Category Cards**:
```
+------------------------------------------+
| [icon]  Profile                     [>]  |
|         Name, bio, avatar, sharing       |
+------------------------------------------+
| [icon]  Training                    [>]  |
|         Units, rest timer, sounds        |
+------------------------------------------+
| [icon]  Nutrition                   [>]  |
|         Calories, macros, phase          |
+------------------------------------------+
| [icon]  Data                        [>]  |
|         Export, import, reset            |
+------------------------------------------+
```

**Sub-page Layout**:
- Back button + title in header
- Grouped sections with labels
- Same input components as current (Switch, Slider, Input)
- Auto-save on change with brief success indicator

### Wireframe - Settings Index

```
+------------------------------------------+
| [<] Settings                             |
+------------------------------------------+
| [search icon] Search settings...         |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | [user]  Profile                  [>] | |
| |         Name, bio, sharing           | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [dumb]  Training                 [>] | |
| |         Units, rest timer, sounds    | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [fork]  Nutrition                [>] | |
| |         Calories, macros, phase      | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [db]    Data                     [>] | |
| |         Export, import, reset         | |
| +--------------------------------------+ |
|                                          |
| v1.2.0                                  |
+------------------------------------------+
```

### Wireframe - Training Sub-page

```
+------------------------------------------+
| [<] Training Settings                    |
+------------------------------------------+
|                                          |
| UNITS                                    |
| +--------------------------------------+ |
| | Weight Unit          [kg] / [lbs]    | |
| +--------------------------------------+ |
|                                          |
| PROGRESSION                              |
| +--------------------------------------+ |
| | Weight Increment                     | |
| | [0.5] [1.0] [1.25] [2.5] kg         | |
| +--------------------------------------+ |
|                                          |
| REST TIMER                               |
| +--------------------------------------+ |
| | Default Rest (seconds)               | |
| | [||||||||||............] 90s          | |
| |                                      | |
| | Sound              [switch ON]       | |
| | Vibration           [switch ON]       | |
| +--------------------------------------+ |
|                                          |
| PROGRAM                                  |
| +--------------------------------------+ |
| | Active: Nordic PPL                   | |
| | [Switch Program]                     | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

---

## 7. Technical Spec

### Route Structure

```
src/app/settings/
  page.tsx          -> Settings index (category list + search)
  layout.tsx        -> Shared layout (optional)
  profile/
    page.tsx        -> Profile settings
  training/
    page.tsx        -> Training settings
  nutrition/
    page.tsx        -> Nutrition settings
  data/
    page.tsx        -> Data management
```

### Search Implementation

```typescript
// /src/lib/settings-search.ts
export interface SearchableSetting {
  id: string;
  label: string;
  description: string;
  category: 'profile' | 'training' | 'nutrition' | 'data';
  route: string;
}

export const SEARCHABLE_SETTINGS: SearchableSetting[] = [
  { id: 'display-name', label: 'Display Name', description: 'Your public name', category: 'profile', route: '/settings/profile' },
  { id: 'bio', label: 'Bio', description: 'Short bio for your profile', category: 'profile', route: '/settings/profile' },
  { id: 'handle', label: 'Handle', description: 'Your unique username', category: 'profile', route: '/settings/profile' },
  { id: 'share-streak', label: 'Share Streak', description: 'Show streak on community profile', category: 'profile', route: '/settings/profile' },
  { id: 'share-volume', label: 'Share Volume', description: 'Show volume on community profile', category: 'profile', route: '/settings/profile' },
  { id: 'share-workouts', label: 'Share Workouts', description: 'Show workouts on community profile', category: 'profile', route: '/settings/profile' },
  { id: 'weight-unit', label: 'Weight Unit', description: 'Kilograms or pounds', category: 'training', route: '/settings/training' },
  { id: 'progression', label: 'Weight Increment', description: 'Progression step size', category: 'training', route: '/settings/training' },
  { id: 'rest-timer', label: 'Rest Timer', description: 'Default rest duration between sets', category: 'training', route: '/settings/training' },
  { id: 'sound', label: 'Sound', description: 'Rest timer completion sound', category: 'training', route: '/settings/training' },
  { id: 'vibration', label: 'Vibration', description: 'Haptic feedback on timer end', category: 'training', route: '/settings/training' },
  { id: 'calories-training', label: 'Calories (Training Day)', description: 'Daily calorie target on training days', category: 'nutrition', route: '/settings/nutrition' },
  { id: 'calories-rest', label: 'Calories (Rest Day)', description: 'Daily calorie target on rest days', category: 'nutrition', route: '/settings/nutrition' },
  { id: 'protein', label: 'Protein Target', description: 'Daily protein in grams', category: 'nutrition', route: '/settings/nutrition' },
  { id: 'phase', label: 'Nutrition Phase', description: 'Bulk, cut, or maintenance', category: 'nutrition', route: '/settings/nutrition' },
  { id: 'export', label: 'Export Data', description: 'Download all workout data as JSON', category: 'data', route: '/settings/data' },
  { id: 'import', label: 'Import Data', description: 'Import workout data from JSON', category: 'data', route: '/settings/data' },
  { id: 'reset', label: 'Reset Program', description: 'Delete all data and start fresh', category: 'data', route: '/settings/data' },
  { id: 'sign-out', label: 'Sign Out', description: 'Log out of your account', category: 'profile', route: '/settings/profile' },
];

export function searchSettings(query: string): SearchableSetting[] {
  const lower = query.toLowerCase();
  return SEARCHABLE_SETTINGS.filter(s =>
    s.label.toLowerCase().includes(lower) ||
    s.description.toLowerCase().includes(lower)
  );
}
```

### Component Extraction from Current Settings Page

The current 1,061-line `settings/page.tsx` will be split as follows:

| Current Lines (approx.) | Content | Target File |
|---|---|---|
| 67-165 | Profile state, mutations, queries | `settings/profile/page.tsx` |
| 53-58, 84-88 | Training settings queries | `settings/training/page.tsx` |
| 88-130 | Nutrition state, field handlers | `settings/nutrition/page.tsx` |
| Export/import/reset logic | Data operations | `settings/data/page.tsx` |
| Shared toast, loading states | Common utilities | `src/components/settings/SettingsToast.tsx` |

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/settings/profile/page.tsx` | Profile settings sub-page |
| `src/app/settings/training/page.tsx` | Training settings sub-page |
| `src/app/settings/nutrition/page.tsx` | Nutrition settings sub-page |
| `src/app/settings/data/page.tsx` | Data management sub-page |
| `src/components/settings/SettingsCategoryCard.tsx` | Category navigation card |
| `src/components/settings/SettingsSearch.tsx` | Cross-category search |
| `src/components/settings/SettingsHeader.tsx` | Sub-page header with back button |
| `src/components/settings/SettingsToast.tsx` | Shared toast notification |
| `src/lib/settings-search.ts` | Search index and filtering |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/settings/page.tsx` | Replace with settings index (category list + search), ~150 lines |
| `src/components/layout/bottom-tab-bar.tsx` | Ensure settings icon navigates to `/settings` index |
| `src/components/layout/sidebar.tsx` | Update settings link if needed |

### Files to Remove (after extraction)

No files are removed. The existing `settings/page.tsx` is rewritten from 1,061 lines to ~150 lines (settings index).

---

## 8. Implementation Plan

### Dependencies
- [ ] No external dependencies required
- [ ] All UI components already available (Card, Switch, Slider, Input from shadcn/ui)
- [ ] Clerk SignOutButton already imported

### Build Order

1. [ ] **Create `SettingsHeader`** - Reusable back button + title
2. [ ] **Create `SettingsToast`** - Shared toast component
3. [ ] **Create `SettingsCategoryCard`** - Category navigation card
4. [ ] **Extract Profile settings** - Move profile logic to `/settings/profile/page.tsx`
5. [ ] **Extract Training settings** - Move training logic to `/settings/training/page.tsx`
6. [ ] **Extract Nutrition settings** - Move nutrition logic to `/settings/nutrition/page.tsx`
7. [ ] **Extract Data settings** - Move export/import/reset to `/settings/data/page.tsx`
8. [ ] **Rewrite settings index** - Replace 1,061 lines with category list (~150 lines)
9. [ ] **Create `settings-search.ts`** - Search index
10. [ ] **Create `SettingsSearch`** - Search UI component
11. [ ] **Wire search to navigation** - Tap result navigates to sub-page
12. [ ] **Testing** - Verify all settings work, no regression

### Agents to Consult
- **Frontend Specialist** - Component extraction, route structure
- **Code Reviewer** - Verify no settings lost during extraction

---

## 9. Testing

### Functional Tests
- [ ] All 4 category cards navigate to correct sub-pages
- [ ] Back button returns to settings index from every sub-page
- [ ] Profile: display name, bio, handle save correctly
- [ ] Profile: sharing toggles persist
- [ ] Profile: avatar displays
- [ ] Profile: sign out works
- [ ] Training: weight unit switches between kg and lbs
- [ ] Training: progression increment saves
- [ ] Training: rest timer slider saves value
- [ ] Training: sound and vibration toggles work
- [ ] Nutrition: calorie targets save for training and rest days
- [ ] Nutrition: macro targets save
- [ ] Nutrition: phase selection saves
- [ ] Nutrition: gain rate and check interval save
- [ ] Data: export downloads JSON file
- [ ] Data: import loads JSON file correctly
- [ ] Data: reset shows confirmation dialog
- [ ] Data: reset completes successfully
- [ ] Search: typing filters settings across categories
- [ ] Search: tapping result navigates to correct sub-page
- [ ] Search: empty query shows all categories
- [ ] Search: no results shows friendly message

### UI Verification
- [ ] Settings index loads in < 500ms
- [ ] Category cards meet 44px touch target minimum
- [ ] Sub-pages render without layout shift
- [ ] Toast notifications appear and auto-dismiss
- [ ] Dark theme colors correct on all sub-pages
- [ ] Works offline (settings from cached queries)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome
- [ ] Test on iPhone SE (smallest viewport)

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] All settings extracted to sub-pages
- [ ] No settings functionality lost (regression check)
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User bookmarked old settings page URL | `/settings` still works, shows index |
| Deep link to setting that moved | Redirect to correct sub-page (future enhancement) |
| Setting save fails (network error) | Show error toast, keep old value, retry option |
| Nutrition not unlocked | Hide Nutrition category card entirely |
| User on slow connection | Sub-pages show loading skeleton, settings cached after first load |
| Search with special characters | Sanitize input, no regex injection |
| Browser back button from sub-page | Returns to settings index (Next.js handles this) |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing settings during extraction | Feature regression | Create checklist of every setting, verify 1:1 after extraction |
| React Query cache mismatch across pages | Stale data | Use same query keys across all sub-pages |
| Search index out of sync with actual settings | Missing results | Generate search index from component props, not hardcoded |
| Route changes break bottom tab bar | Navigation confusion | Update tab bar to highlight "Settings" for all `/settings/*` routes |
| Clerk SignOutButton behavior changes | Sign out breaks | Test sign out flow specifically |

---

## Dependencies

- None - this is a pure refactoring of existing functionality
- Can be implemented independently of other PRDs
- No backend changes required

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
