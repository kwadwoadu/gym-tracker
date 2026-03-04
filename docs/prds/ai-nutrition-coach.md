# AI Nutrition Coach

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 3 - AI Features

---

## Problem Statement

SetFlow's current nutrition tracking is manual and template-based. Users select from pre-built meal templates (`meal-templates.ts`, 17 meals) and log compliance (hit protein goal yes/no, calories on target yes/no). This approach has three major gaps:

1. **No food recognition**: Users must manually identify meals and estimate macros, which is tedious and error-prone
2. **No personalization**: Meal recommendations are static templates, not adjusted to remaining daily targets or workout timing
3. **No post-workout guidance**: Users don't know what to eat after training to optimize recovery and muscle protein synthesis
4. **No grocery planning**: Users plan meals but have no automated way to generate shopping lists

The nutrition feature is currently gated to `k@adu.dk` only, but expanding it with AI capabilities would make it viable for all users.

---

## Proposed Solution

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

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Photo logging accuracy | >85% correct macro estimation (within 15% of actual) | Compare AI estimates to nutrition database lookups |
| Photo logging adoption | >40% of meals logged via photo (vs. manual template) | Track input method per meal log |
| Recommendation acceptance | >35% of meal suggestions followed | Track suggestion shown vs. meal logged |
| Grocery list generation | >50% of weekly planners generate a list | Track list generation events |
| Protein goal compliance | +20% improvement in daily protein target hit rate | Compare before/after compliance stats |
| Nutrition feature expansion | Remove k@adu.dk gate within 3 months of AI launch | Business decision based on engagement data |

---

## User Stories

- As a user eating lunch, I want to snap a photo of my plate and have macros estimated automatically so I don't have to search a food database.
- As a user who just finished a workout, I want to know exactly what to eat and when for optimal recovery.
- As a user tracking macros, I want to see what meals will help me hit my remaining protein target for the day.
- As a user meal-prepping on Sunday, I want a grocery list generated from my planned meals for the week.
- As a user eating out at a restaurant, I want to photograph my meal and get a reasonable macro estimate even for non-standard dishes.
- As a user with dietary restrictions (lactose-free), I want recommendations that respect my existing meal template constraints.

---

## Technical Scope

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
| Food recognition model | Claude 3.5 Sonnet with vision (best food identification accuracy) |
| Photo input | Base64-encoded image, max 1MB (auto-compressed) |
| Input tokens (photo) | ~1,500 (image + prompt) |
| Output tokens (photo) | ~300 (food list with macros) |
| Recommendation model | Claude 3.5 Haiku (fast for text-only suggestions) |
| Grocery list model | Claude 3.5 Haiku |
| Latency (photo) | 3-5 seconds |
| Latency (recommendations) | 1-2 seconds |
| Cost per photo analysis | ~$0.01-0.02 |
| Offline fallback | Manual template selection (existing behavior) |
| Macro database | AI's training data + structured output validation against known ranges |

---

## Design Requirements

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

### Visual Style
- Photo analysis: loading spinner over photo thumbnail while AI processes
- Macro bars: horizontal progress bars in accent (#CDFF00) for protein, blue for carbs, orange for fat
- Recommendation cards: subtle match percentage badge (green for >80%, yellow for 60-80%)
- Grocery list: clean checklist with section headers and checkboxes
- Post-workout banner: appears at top of nutrition page after workout, auto-dismisses after 2 hours
- Dark theme consistent with SetFlow design system

---

## Edge Cases

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

## Privacy & Data

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

## Priority

**P2 - Could Ship**

The nutrition coach extends an already-built nutrition system with AI intelligence. Photo logging addresses the biggest friction point (manual macro entry), and personalized recommendations add genuine value. The feature benefits from the existing meal template library and supplement tracking infrastructure. However, it requires vision API integration (higher cost per interaction than text-only AI features) and accuracy validation for food recognition.

---

## Dependencies

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

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
