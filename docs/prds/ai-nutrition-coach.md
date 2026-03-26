# AI Nutrition Coach

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 3 - AI Features

---

## 1. Problem Statement

SetFlow's current nutrition tracking is manual and template-based. Users select from pre-built meal templates (`meal-templates.ts`, 17 meals) and log compliance (hit protein goal yes/no, calories on target yes/no). This approach has three major gaps:

1. **No food recognition**: Users must manually identify meals and estimate macros, which is tedious and error-prone
2. **No personalization**: Meal recommendations are static templates, not adjusted to remaining daily targets or workout timing
3. **No post-workout guidance**: Users don't know what to eat after training to optimize recovery and muscle protein synthesis
4. **No grocery planning**: Users plan meals but have no automated way to generate shopping lists

The nutrition feature is currently gated to `k@adu.dk` only, but expanding it with AI capabilities would make it viable for all users.

---

## 2. Proposed Solution

An AI-powered nutrition coach that combines photo-based meal logging, personalized recommendations, and automated grocery list generation. The system builds on the existing nutrition infrastructure (meal plans, compliance logging, supplement tracking) and adds intelligent automation.

### Core Behaviors

1. **Photo-Based Meal Logging**: User snaps a photo of their plate. Vision AI identifies foods, estimates portions, and calculates macros:
   - "Grilled chicken breast (~200g): 46g protein, 0g carbs, 3g fat"
   - "Brown rice (~150g): 3g protein, 35g carbs, 1g fat"
   - "Steamed broccoli (~100g): 3g protein, 7g carbs, 0g fat"
   - Total: 52g protein, 42g carbs, 4g fat, 412 calories
   - User confirms or adjusts before saving

2. **Smart Meal Recommendations**: Based on remaining daily macro targets, the AI suggests meals:
   - Morning: "You need 140g protein today. Start with Meal B2 (Greek yogurt bowl, 35g protein)"
   - Post-workout: "After your push session, have a shake with 40g whey + banana for fast recovery"
   - Evening: "You're 30g protein short. Add a casein shake before bed."
   - Recommendations pull from the user's existing meal template library first, then suggest new options

3. **Post-Workout Nutrition Timing**: Integrates with workout session data:
   - Detects workout completion
   - Suggests immediate post-workout nutrition based on session type and duration
   - "You just finished a 65-minute hypertrophy session. Aim for 40g protein + 60g carbs within 30 minutes."
   - Recommends specific meals/shakes from the user's library

4. **Grocery List Generation**: AI generates a weekly grocery list from the meal plan:
   - Aggregates ingredients across all planned meals for the week
   - Groups by store section (produce, meat, dairy, pantry)
   - Adjusts quantities for planned servings
   - Accounts for items likely already in pantry (oils, spices, staples)

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Photo logging accuracy | >85% correct macro estimation (within 15% of actual) | Compare AI estimates to nutrition database lookups |
| Photo logging adoption | >40% of meals logged via photo (vs. manual template) | Track input method per meal log |
| Recommendation acceptance | >35% of meal suggestions followed | Track suggestion shown vs. meal logged |
| Grocery list generation | >50% of weekly planners generate a list | Track list generation events |
| Protein goal compliance | +20% improvement in daily protein target hit rate | Compare before/after compliance stats |
| Nutrition feature expansion | Remove k@adu.dk gate within 3 months of AI launch | Business decision based on engagement data |

---

## 4. Requirements

### Must Have
- [ ] Photo-based meal logging: snap photo, AI identifies foods and estimates macros
- [ ] User can confirm or adjust AI-estimated macros before saving
- [ ] Smart meal recommendations based on remaining daily macro targets
- [ ] Recommendations pull from user's existing meal template library first
- [ ] Post-workout nutrition timing suggestions (triggered by workout completion)
- [ ] Photo compressed to max 1MB before API call
- [ ] API key stays server-side (Vercel API route)
- [ ] Feature gated behind `AI_NUTRITION_COACH` feature flag

### Should Have
- [ ] Grocery list generation from weekly meal plan
- [ ] Grocery list grouped by store section (produce, meat, dairy, pantry)
- [ ] "Add missed item" option on photo analysis results
- [ ] Macro uncertainty ranges for restaurant/unclear food ("Protein: 35-45g")
- [ ] Save new AI-suggested meals as templates
- [ ] Dietary restriction awareness in recommendations
- [ ] Post-workout banner auto-dismisses after 2 hours

### Won't Have (This Version)
- [ ] Barcode scanning for packaged food
- [ ] Integration with food delivery apps
- [ ] Calorie counting from video (e.g., filming a buffet)
- [ ] Meal plan auto-generation for the full week
- [ ] Restaurant menu database lookup

---

## 5. User Flows

### Flow 1: Photo-Based Meal Logging

1. User opens nutrition page and taps "Log Meal"
2. Camera preview appears with "Center your plate in the frame" guide
3. User taps "Take Photo" (or selects from gallery)
4. Photo compressed to <1MB and sent to Claude Sonnet 4.6 vision API
5. Loading spinner overlays photo thumbnail (3-5s)
6. AI returns identified foods with estimated portions and macros
7. User reviews detected items (each editable: tap to adjust weight/macros)
8. User can tap "+ Add missed item" for undetected foods
9. Total macros displayed with "Remaining today" summary
10. User taps "Save Meal" - data stored in IndexedDB/Prisma

### Flow 2: Meal Recommendations

1. User opens nutrition page; system calculates remaining daily macros
2. "AI Suggestions" section shows meals matching remaining targets
3. Suggestions prioritize user's existing templates (sorted by macro match %)
4. New AI-generated suggestions shown below with "Save as Template" option
5. User taps "Add to Plan" on a suggestion
6. Meal added to today's plan; remaining macros updated

### Flow 3: Post-Workout Nutrition

1. User completes workout session (taps "End Workout")
2. Banner appears at top of screen: "You just finished Upper Push (65 min)"
3. Banner shows recommended macros: "40g protein + 60g fast carbs within 30 min"
4. Banner suggests specific items from user's supplement/meal library
5. User taps "Log This Meal" to quick-log the suggested post-workout nutrition
6. Or taps "Remind in 15 min" for a delayed notification
7. Banner auto-dismisses after 2 hours if not interacted with

### Flow 4: Grocery List Generation

1. User navigates to meal planner with meals planned for the week
2. User taps "Generate Grocery List"
3. AI aggregates ingredients across all planned meals
4. List displayed grouped by store section with quantities
5. Common pantry items (oils, spices) shown as "Already in pantry (skipped)"
6. User can check off items, share list, or copy to clipboard

---

## 6. Technical Spec

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    AI Nutrition Coach                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Photo Logging          Recommendations     Grocery List   │
│  ┌──────────┐          ┌──────────┐       ┌──────────┐    │
│  │ Camera   │          │ Macro    │       │ Meal Plan│    │
│  │ Capture  │          │ Tracker  │       │ Analyzer │    │
│  └────┬─────┘          └────┬─────┘       └────┬─────┘    │
│       |                     |                  |           │
│       v                     v                  v           │
│  ┌──────────┐          ┌──────────┐       ┌──────────┐    │
│  │ Vision   │          │ Claude   │       │ Claude   │    │
│  │ API      │          │ API      │       │ API      │    │
│  │ (food ID)│          │ (suggest)│       │ (list)   │    │
│  └────┬─────┘          └────┬─────┘       └────┬─────┘    │
│       |                     |                  |           │
│       v                     v                  v           │
│  ┌──────────┐          ┌──────────┐       ┌──────────┐    │
│  │ Macro    │          │ Meal     │       │ Grocery  │    │
│  │ Estimator│          │ Matcher  │       │ List     │    │
│  └──────────┘          └──────────┘       └──────────┘    │
│                                                            │
│  Data Sources:                                             │
│  - meal-templates.ts (17 meals)                            │
│  - supplement-protocol.ts                                  │
│  - NutritionLog (Prisma)                                   │
│  - MealPlan (Prisma)                                       │
│  - WorkoutLog (IndexedDB)                                  │
│  - OnboardingProfile (IndexedDB)                           │
└────────────────────────────────────────────────────────────┘
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/nutrition-coach.ts` | Core orchestrator: photo analysis, recommendations, grocery list |
| `/src/lib/ai/food-recognizer.ts` | Vision API integration for photo-based food identification |
| `/src/lib/ai/macro-estimator.ts` | Macro calculation from identified foods and estimated portions |
| `/src/lib/ai/meal-recommender.ts` | Recommendation engine: remaining macros -> meal suggestions |
| `/src/lib/ai/grocery-generator.ts` | Grocery list generation from weekly meal plan |
| `/src/lib/ai/prompts/nutrition-prompt.ts` | Prompt templates for nutrition AI calls |
| `/src/components/nutrition/photo-logger.tsx` | Camera capture + photo preview + AI analysis UI |
| `/src/components/nutrition/macro-result-card.tsx` | Display AI-estimated macros with edit capability |
| `/src/components/nutrition/meal-suggestion-card.tsx` | Recommended meal card with "Add to plan" action |
| `/src/components/nutrition/post-workout-nutrition.tsx` | Post-workout nutrition suggestion banner |
| `/src/components/nutrition/grocery-list.tsx` | Weekly grocery list view with section grouping |
| `/src/hooks/use-nutrition-coach.ts` | React hook for nutrition coach state and AI interactions |
| `/src/app/api/ai/analyze-food/route.ts` | API route for food photo analysis |
| `/src/app/api/ai/meal-recommendation/route.ts` | API route for meal recommendations |
| `/src/app/api/ai/grocery-list/route.ts` | API route for grocery list generation |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/nutrition/daily-checklist.tsx` | Add "Log with Photo" button alongside manual compliance toggles |
| `/src/components/nutrition/meal-planner.tsx` | Add AI recommendation section; add "Generate Grocery List" button |
| `/src/components/nutrition/time-period-section.tsx` | Integrate meal suggestions into time period views |
| `/src/components/nutrition/nutrition-nav.tsx` | Add "AI Coach" tab |
| `/src/app/nutrition/page.tsx` | Add post-workout nutrition banner when workout recently completed |
| `/src/lib/queries.ts` | Add `useAnalyzeFood()`, `useMealRecommendations()`, `useGroceryList()` mutations |
| `/src/lib/feature-flags.ts` | Add `AI_NUTRITION_COACH` feature flag |
| `/src/data/meal-templates.ts` | Add ingredient breakdown per meal (for grocery list generation) |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| None new | Uses Claude API vision capability (already in `ai-client.ts`) | - |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Food recognition model | Claude Sonnet 4.6 with vision (best food identification accuracy for complex image analysis) |
| Photo input | Base64-encoded image, max 1MB (auto-compressed) |
| Input tokens (photo) | ~1,500 (image + prompt) |
| Output tokens (photo) | ~300 (food list with macros) |
| Recommendation model | Claude 4.5 Haiku (claude-haiku-4-5-20251001, fast for text-only suggestions) |
| Grocery list model | Claude 4.5 Haiku (claude-haiku-4-5-20251001) |
| Latency (photo) | 3-5 seconds |
| Latency (recommendations) | 1-2 seconds |
| Cost per photo analysis | ~$0.01-0.02 |
| Offline fallback | Manual template selection (existing behavior) |
| Macro database | AI's training data + structured output validation against known ranges |

---

## 7. Design

### Photo Logging Flow

```
┌─────────────────────────────────────────┐
│  Log Meal                         [x]   │
├─────────────────────────────────────────┤
│                                          │
│  ┌───────────────────────────────────┐   │
│  │                                   │   │
│  │       Camera preview              │   │
│  │                                   │   │
│  │                                   │   │
│  │    Center your plate              │   │
│  │    in the frame                   │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
│                                          │
│  [Take Photo]  [Choose from Gallery]     │
│                                          │
│  Or select from templates:               │
│  [B1] [B2] [B3] [L1] [L2] ...          │
└─────────────────────────────────────────┘
```

### AI Analysis Result

```
┌─────────────────────────────────────────┐
│  Meal Analysis                           │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────┐                    │
│  │  [Photo thumb]   │  Lunch             │
│  └──────────────────┘  12:45 PM          │
│                                          │
│  Detected foods:                         │
│  ┌────────────────────────────────────┐  │
│  │ Grilled chicken breast (~200g)     │  │
│  │ P: 46g  C: 0g  F: 3g    [Edit]   │  │
│  ├────────────────────────────────────┤  │
│  │ Brown rice (~150g)                 │  │
│  │ P: 3g   C: 35g  F: 1g   [Edit]   │  │
│  ├────────────────────────────────────┤  │
│  │ Steamed broccoli (~100g)           │  │
│  │ P: 3g   C: 7g   F: 0g   [Edit]   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  + Add missed item                       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Total: 52g P | 42g C | 4g F       │  │
│  │ Calories: 412                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Remaining today: 88g P | 158g C | 56g F │
│                                          │
│  [Save Meal]                [Retake]     │
└─────────────────────────────────────────┘
```

### Meal Recommendations

```
┌─────────────────────────────────────────┐
│  AI Suggestions for Dinner               │
├─────────────────────────────────────────┤
│                                          │
│  You need: 65g protein, 80g carbs        │
│                                          │
│  From your templates:                    │
│  ┌────────────────────────────────────┐  │
│  │ D3: Salmon + Sweet Potato          │  │
│  │ P: 42g  C: 55g  F: 18g            │  │
│  │ 92% macro match                    │  │
│  │ [Add to Plan]                      │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ D1: Chicken Stir-Fry              │  │
│  │ P: 38g  C: 45g  F: 12g            │  │
│  │ 78% macro match                    │  │
│  │ [Add to Plan]                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  New suggestion:                         │
│  ┌────────────────────────────────────┐  │
│  │ Turkey meatballs + pasta           │  │
│  │ P: 48g  C: 72g  F: 14g            │  │
│  │ 95% macro match                    │  │
│  │ [Save as Template]  [Add to Plan]  │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Post-Workout Nutrition Banner

```
┌─────────────────────────────────────────┐
│  Post-Workout Nutrition          [x]    │
│                                          │
│  You just finished: Upper Push (65 min)  │
│  Estimated calories burned: ~420         │
│                                          │
│  Eat within 30 min:                      │
│  - 40g protein (whey shake ideal)        │
│  - 60g fast carbs (banana, rice cakes)   │
│                                          │
│  From your supplements:                  │
│  S4: Post-workout shake (40g whey +      │
│      creatine + banana)                  │
│                                          │
│  [Log This Meal]   [Remind in 15 min]    │
└─────────────────────────────────────────┘
```

### Grocery List

```
┌─────────────────────────────────────────┐
│  Grocery List - Week of Mar 4            │
├─────────────────────────────────────────┤
│                                          │
│  Protein                                 │
│  [ ] Chicken breast - 1.4kg             │
│  [ ] Salmon fillets - 600g              │
│  [ ] Turkey mince - 500g                │
│  [ ] Eggs - 18                          │
│                                          │
│  Produce                                 │
│  [ ] Broccoli - 3 heads                 │
│  [ ] Sweet potatoes - 4                 │
│  [ ] Bananas - 7                        │
│  [ ] Spinach - 2 bags                   │
│                                          │
│  Grains & Carbs                          │
│  [ ] Brown rice - 1kg                   │
│  [ ] Oats - 500g                        │
│                                          │
│  Already in pantry (skipped):            │
│  Olive oil, salt, pepper, garlic         │
│                                          │
│  [Share List]  [Copy to Clipboard]       │
└─────────────────────────────────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| PhotoLogger | `photo-logger.tsx` | Camera capture + gallery picker + photo preview |
| MacroResultCard | `macro-result-card.tsx` | AI-estimated food items with edit capability |
| MealSuggestionCard | `meal-suggestion-card.tsx` | Recommended meal with macro match % and "Add to Plan" |
| PostWorkoutNutrition | `post-workout-nutrition.tsx` | Post-workout banner with timing and suggestions |
| GroceryList | `grocery-list.tsx` | Weekly list with section grouping and checkboxes |
| useNutritionCoach | `use-nutrition-coach.ts` | Hook for photo analysis, recommendations, grocery state |

### Visual Spec

| Element | Value |
|---------|-------|
| Background | #0A0A0A |
| Card surface | #1A1A1A |
| Protein progress bar | #CDFF00 (accent) |
| Carbs progress bar | #3B82F6 (blue) |
| Fat progress bar | #F59E0B (orange) |
| Macro match badge >80% | #22C55E (green) |
| Macro match badge 60-80% | #F59E0B (yellow) |
| Macro match badge <60% | #EF4444 (red) |
| Post-workout banner | #1A1A1A bg with #CDFF00 left accent border |
| Grocery checklist | Checkbox in #CDFF00 when checked, #666666 unchecked |
| Photo loading spinner | Circular spinner in #CDFF00 overlaying photo |
| Font | Inter, 16px body, 14px macro values |
| Touch targets | 44px minimum for all interactive elements |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Shared AI client (`ai-client.ts`) exists from PRD 1
- [ ] Existing nutrition system (meal plans, compliance, supplements) complete
- [ ] Claude vision capability available in API
- [ ] Camera API (MediaDevices) available in target browsers
- [ ] Meal templates with ingredient breakdowns (needs update)

### Build Order

1. **Create food recognizer** - `/src/lib/ai/food-recognizer.ts` with image compression, base64 encoding, Claude vision API call
2. **Create macro estimator** - `/src/lib/ai/macro-estimator.ts` with food-to-macro mapping and validation
3. **Create nutrition prompts** - `/src/lib/ai/prompts/nutrition-prompt.ts` for photo analysis, recommendations, grocery
4. **Create photo analysis API route** - `/src/app/api/ai/analyze-food/route.ts`
5. **Create photo logger component** - `photo-logger.tsx` with camera capture and gallery selection
6. **Create macro result card** - `macro-result-card.tsx` with editable food items
7. **Create meal recommender** - `/src/lib/ai/meal-recommender.ts` matching remaining macros to templates
8. **Create recommendation API route** - `/src/app/api/ai/meal-recommendation/route.ts`
9. **Create meal suggestion card** - `meal-suggestion-card.tsx` with match % and action buttons
10. **Create post-workout nutrition** - `post-workout-nutrition.tsx` banner component
11. **Create grocery generator** - `/src/lib/ai/grocery-generator.ts` aggregating meal plan ingredients
12. **Create grocery API route** - `/src/app/api/ai/grocery-list/route.ts`
13. **Create grocery list component** - `grocery-list.tsx` with section grouping
14. **Update meal templates** - Add ingredient breakdowns to `meal-templates.ts`
15. **Integrate with existing nutrition pages** - Modify `daily-checklist.tsx`, `meal-planner.tsx`, `nutrition-nav.tsx`
16. **Add feature flag** - `AI_NUTRITION_COACH` in `feature-flags.ts`

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Unrecognizable food in photo | Show "Couldn't identify all items. Please add manually." with partial results |
| Mixed/overlapping foods (e.g., stew) | AI estimates total macros for the dish; show "Estimated - mixed dish" label |
| Restaurant food with unknown preparation | AI adds uncertainty range: "Protein: 35-45g (preparation method unknown)" |
| Photo of packaged food with label | AI reads nutrition label if visible; otherwise estimates from food type |
| User has no meal templates | Recommendations come entirely from AI suggestions; prompt to save favorites |
| Offline photo capture | Save photo locally; queue for analysis when back online |
| User rejects all AI estimates | Fall back to manual macro entry; learn from corrections over time |
| Dietary restrictions not specified | Prompt user to set restrictions on first recommendation use |
| Grocery list for incomplete meal plan | Generate for planned days only; note "X days not planned" |
| Multiple photos of same meal | Detect duplicate based on timestamp + similarity; ask "Same meal or different?" |
| Non-food photos (accidental) | AI returns "No food detected in this image" gracefully |

---

## 10. Testing

### Functional Tests
- [ ] Photo capture works on iOS Safari (camera and gallery)
- [ ] Photo capture works on Chrome Android
- [ ] Photo compressed to <1MB before API call
- [ ] AI correctly identifies common foods (chicken, rice, broccoli, eggs)
- [ ] AI returns reasonable macro estimates (within 15% of database values)
- [ ] User can edit individual food items in analysis results
- [ ] "Add missed item" adds manual entry to the meal
- [ ] Recommendations match remaining daily macros (protein priority)
- [ ] Recommendations pull from user templates before suggesting new meals
- [ ] Post-workout banner appears after workout completion
- [ ] Post-workout banner auto-dismisses after 2 hours
- [ ] "Remind in 15 min" sets delayed notification
- [ ] Grocery list aggregates ingredients correctly across meals
- [ ] Grocery list groups items by store section
- [ ] Pantry staples excluded from grocery list
- [ ] Offline: photo saved locally, queued for analysis when back online
- [ ] Non-food photo returns "No food detected" gracefully

### UI Verification
- [ ] Camera preview shows centering guide
- [ ] Loading spinner overlays photo during analysis
- [ ] Macro bars use correct colors (protein #CDFF00, carbs #3B82F6, fat #F59E0B)
- [ ] Match percentage badges use correct color thresholds
- [ ] Post-workout banner has #CDFF00 left accent
- [ ] Grocery list checkboxes are 44px touch targets
- [ ] Dark theme (#0A0A0A bg, #1A1A1A cards) consistent
- [ ] Font sizes match design system (Inter, 16px body)
- [ ] "Remaining today" summary updates after saving meal
- [ ] Photo thumbnail shown in meal log entry

---

## 11. Launch Checklist

- [ ] Feature flag `AI_NUTRITION_COACH` added and tested (on/off)
- [ ] Claude vision API route working (photo analysis)
- [ ] Photo compression verified (<1MB before API call)
- [ ] Macro estimation accuracy validated against 20+ common meals
- [ ] Meal templates updated with ingredient breakdowns
- [ ] Dietary restriction field added to nutrition profile
- [ ] Camera permission flow tested on iOS Safari
- [ ] Camera permission flow tested on Chrome Android
- [ ] Post-workout banner integration tested end-to-end
- [ ] Grocery list tested with full-week meal plan
- [ ] Consent dialog copy reviewed for photo analysis
- [ ] Offline photo queuing tested
- [ ] Cost monitoring: track vision API spend per day (higher per-call than text)
- [ ] Nutrition feature gate expanded beyond k@adu.dk if adoption metrics met
- [ ] Tested on iOS Safari PWA mode

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inaccurate macro estimation | Users lose trust in AI nutrition advice | Show estimates with uncertainty ranges; allow easy editing; validate against food databases |
| Vision API cost (higher than text-only) | Budget overrun | Rate limit photo analyses (e.g., 10/day); use Claude Sonnet 4.6 only for photos, Haiku for text |
| Mixed/complex dishes hard to analyze | Poor accuracy on real-world meals | Show "Estimated - mixed dish" label; allow manual override; improve prompts over time |
| Camera permission denied | Feature unusable | Provide manual template selection as fallback; show instructions to enable in Settings |
| Grocery list inaccurate quantities | User buys wrong amounts | Show quantities as estimates; allow manual adjustment before sharing |
| Post-workout timing not always relevant | Banner annoys users who eat intuitively | Dismissible with X; auto-dismiss after 2 hours; toggle off in Settings |
| Nutrition feature still gated to single user | Limited validation data | Plan expansion to beta users after 2 weeks of internal testing |
| Photo of packaged food with visible label | AI ignores label, estimates poorly | Train prompt to read nutrition labels when visible; prefer label data over estimation |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| Existing nutrition system (meal plans, compliance, supplements) | Complete | Foundation to build on |
| AI client (`ai-client.ts`) | Created in PRD 1 | API calls |
| Claude vision capability | Available | Photo analysis |
| Meal templates with ingredient breakdowns | Needs update | Grocery list generation |
| Nutrition profile (dietary restrictions) | Needs extension | Personalized recommendations |
| Feature flags system | Complete | Gating rollout |
| PRD 1 (AI Program Generation) | Recommended first | Shared AI infrastructure |
| Workout session data | Complete | Post-workout nutrition timing |

### Integration with Existing Nutrition Components

| Existing Component | Integration |
|-------------------|-------------|
| `daily-checklist.tsx` | Add photo logging button |
| `meal-planner.tsx` | AI recommendations section + grocery list button |
| `meal-template-card.tsx` | Show AI-suggested meals in same card format |
| `macros-summary.tsx` | Update with AI-logged meal data |
| `supplements-checklist.tsx` | Post-workout supplement reminders |
| `time-period-section.tsx` | AI suggestions per time period |
| `compliance-card.tsx` | Include photo-logged meals in compliance stats |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Meal photos | Sent to Claude API for food recognition | Not stored by API; local copy optional |
| Macro estimates | Stored in Prisma (NutritionLog) | Until user deletes |
| Meal plan data | Stored in Prisma (MealPlan) | Until user deletes |
| Dietary preferences | Stored locally (OnboardingProfile extension) | Until user deletes |
| Grocery lists | Generated on demand, optionally saved locally | Session-only unless saved |
| Supplement data | Already stored in Prisma | No change |

### User Consent
- First photo analysis: "SetFlow will send your meal photo to analyze its nutritional content. Photos are not stored on our servers."
- Clear option to use manual logging only (no AI)
- Photo storage on device is optional (user can choose to keep or discard after analysis)

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: Updated models to Claude Sonnet 4.6 (vision) and Claude 4.5 Haiku (text). Added Requirements (MoSCoW), User Flows, Implementation Plan, Component Table, Visual Spec, Testing, Launch Checklist, Risks & Mitigations. Restructured to 14-section standard. |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
