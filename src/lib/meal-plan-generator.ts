import {
  MEAL_TEMPLATES,
  type MealCategory,
  type MealSlot,
  type MealSlots,
  type MealTemplate,
} from '@/data/meal-templates';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DayPlan {
  date: string; // YYYY-MM-DD
  dayType: 'training' | 'rest' | 'hiit';
  slots: MealSlots; // { breakfast: "B1", midMorning: "M2", ... }
  totals: { protein: number; carbs: number; fat: number; calories: number };
}

export interface NutritionProfile {
  caloriesTrainingDay: number;
  caloriesRestDay: number;
  proteinTrainingDay: number;
  carbsTrainingDay: number;
  fatTrainingDay: number;
  proteinRestDay: number;
  carbsRestDay: number;
  fatRestDay: number;
  dietaryRestrictions: string[];
}

export interface CustomMeal {
  id: string;
  name: string;
  category: MealCategory;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface GeneratePlanInput {
  profile: NutritionProfile;
  startDate: string; // YYYY-MM-DD
  trainingDays: number[]; // 0=Sun,1=Mon,...6=Sat - which days are training
  hiitDays?: number[]; // which days are HIIT (default: [3] = Wednesday)
  existingPlans?: DayPlan[]; // For regenerating single days
  customMeals?: CustomMeal[]; // User custom meals to include in pool
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_ORDER: MealSlot[] = ['breakfast', 'midMorning', 'lunch', 'snack', 'dinner'];

const SLOT_TO_CATEGORY: Record<MealSlot, MealCategory> = {
  breakfast: 'breakfast',
  midMorning: 'midMorning',
  lunch: 'lunch',
  snack: 'snack',
  dinner: 'dinner',
};

const VARIETY_PENALTY = 0.7;
const CALORIE_TOLERANCE = 0.1; // 10%

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function getDayOfWeek(dateStr: string): number {
  return parseDate(dateStr).getDay();
}

function getDayType(
  dateStr: string,
  trainingDays: number[],
  hiitDays: number[],
): 'training' | 'rest' | 'hiit' {
  const dow = getDayOfWeek(dateStr);
  if (hiitDays.includes(dow)) return 'hiit';
  if (trainingDays.includes(dow)) return 'training';
  return 'rest';
}

function getMacroTargets(
  profile: NutritionProfile,
  dayType: 'training' | 'rest' | 'hiit',
): MacroTargets {
  // HIIT days use training-day macros
  const isTraining = dayType === 'training' || dayType === 'hiit';
  return {
    protein: isTraining ? profile.proteinTrainingDay : profile.proteinRestDay,
    carbs: isTraining ? profile.carbsTrainingDay : profile.carbsRestDay,
    fat: isTraining ? profile.fatTrainingDay : profile.fatRestDay,
    calories: isTraining ? profile.caloriesTrainingDay : profile.caloriesRestDay,
  };
}

function buildMealPool(
  templates: MealTemplate[],
  customMeals: CustomMeal[] | undefined,
): MealTemplate[] {
  const pool = [...templates];
  if (customMeals) {
    for (const cm of customMeals) {
      pool.push({
        id: cm.id,
        name: cm.name,
        category: cm.category,
        protein: cm.protein,
        carbs: cm.carbs,
        fat: cm.fat,
        calories: cm.calories,
        prepTime: 'Custom',
      });
    }
  }
  return pool;
}

function filterCandidates(
  pool: MealTemplate[],
  category: MealCategory,
  dietaryRestrictions: string[],
  usedIdsToday: Set<string>,
): MealTemplate[] {
  return pool.filter((meal) => {
    if (meal.category !== category) return false;
    if (usedIdsToday.has(meal.id)) return false;
    // Check dietary restrictions against meal name and ingredients
    if (dietaryRestrictions.length > 0) {
      const mealText = [
        meal.name.toLowerCase(),
        ...(meal.ingredients ?? []).map((i) => i.toLowerCase()),
      ].join(' ');
      for (const restriction of dietaryRestrictions) {
        if (mealText.includes(restriction.toLowerCase())) return false;
      }
    }
    return true;
  });
}

function scoreMeal(
  meal: MealTemplate,
  remaining: MacroTargets,
  targets: MacroTargets,
  yesterdaySameSlotId: string | null,
): number {
  // Avoid division by zero
  const safeProtein = targets.protein || 1;
  const safeCarbs = targets.carbs || 1;
  const safeFat = targets.fat || 1;

  const proteinScore = (1 - Math.abs(remaining.protein - meal.protein) / safeProtein) * 2;
  const carbsScore = 1 - Math.abs(remaining.carbs - meal.carbs) / safeCarbs;
  const fatScore = 1 - Math.abs(remaining.fat - meal.fat) / safeFat;

  let score = proteinScore + carbsScore + fatScore;

  // Penalize same meal as yesterday's same slot
  if (yesterdaySameSlotId !== null && meal.id === yesterdaySameSlotId) {
    score *= VARIETY_PENALTY;
  }

  return score;
}

function pickBestMeal(
  candidates: MealTemplate[],
  remaining: MacroTargets,
  targets: MacroTargets,
  yesterdaySameSlotId: string | null,
): MealTemplate | null {
  if (candidates.length === 0) return null;

  let bestMeal = candidates[0];
  let bestScore = -Infinity;

  for (const meal of candidates) {
    const s = scoreMeal(meal, remaining, targets, yesterdaySameSlotId);
    if (s > bestScore) {
      bestScore = s;
      bestMeal = meal;
    }
  }

  return bestMeal;
}

function calculateTotals(
  slotAssignments: Record<MealSlot, MealTemplate | null>,
): MacroTargets {
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let calories = 0;

  for (const slot of SLOT_ORDER) {
    const meal = slotAssignments[slot];
    if (meal) {
      protein += meal.protein;
      carbs += meal.carbs;
      fat += meal.fat;
      calories += meal.calories;
    }
  }

  return { protein, carbs, fat, calories };
}

function buildMealSlots(
  slotAssignments: Record<MealSlot, MealTemplate | null>,
): MealSlots {
  return {
    breakfast: slotAssignments.breakfast?.id ?? null,
    midMorning: slotAssignments.midMorning?.id ?? null,
    lunch: slotAssignments.lunch?.id ?? null,
    snack: slotAssignments.snack?.id ?? null,
    dinner: slotAssignments.dinner?.id ?? null,
  };
}

// ---------------------------------------------------------------------------
// Calorie adjustment pass
// ---------------------------------------------------------------------------

function adjustForCalories(
  slotAssignments: Record<MealSlot, MealTemplate | null>,
  pool: MealTemplate[],
  targets: MacroTargets,
  dietaryRestrictions: string[],
  usedIdsToday: Set<string>,
): void {
  const totals = calculateTotals(slotAssignments);
  const targetCalories = targets.calories;
  const upperBound = targetCalories * (1 + CALORIE_TOLERANCE);
  const lowerBound = targetCalories * (1 - CALORIE_TOLERANCE);

  if (totals.calories > upperBound) {
    // Over target: swap the highest-calorie non-breakfast meal for a lighter one
    let worstSlot: MealSlot | null = null;
    let worstCalories = 0;

    for (const slot of SLOT_ORDER) {
      if (slot === 'breakfast') continue;
      const meal = slotAssignments[slot];
      if (meal && meal.calories > worstCalories) {
        worstCalories = meal.calories;
        worstSlot = slot;
      }
    }

    if (worstSlot) {
      const category = SLOT_TO_CATEGORY[worstSlot];
      const currentMeal = slotAssignments[worstSlot];
      const candidates = pool.filter((m) => {
        if (m.category !== category) return false;
        if (currentMeal && m.id === currentMeal.id) return false;
        if (currentMeal && m.calories >= currentMeal.calories) return false;
        if (dietaryRestrictions.length > 0) {
          const mealText = [
            m.name.toLowerCase(),
            ...(m.ingredients ?? []).map((i) => i.toLowerCase()),
          ].join(' ');
          for (const restriction of dietaryRestrictions) {
            if (mealText.includes(restriction.toLowerCase())) return false;
          }
        }
        // Don't reuse a meal already picked for another slot today
        for (const s of SLOT_ORDER) {
          if (s !== worstSlot && slotAssignments[s]?.id === m.id) return false;
        }
        return true;
      });

      if (candidates.length > 0) {
        // Pick the one that brings total closest to target
        let bestSwap = candidates[0];
        let bestDiff = Infinity;
        for (const c of candidates) {
          const newTotal = totals.calories - worstCalories + c.calories;
          const diff = Math.abs(newTotal - targetCalories);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSwap = c;
          }
        }
        usedIdsToday.delete(slotAssignments[worstSlot]?.id ?? '');
        slotAssignments[worstSlot] = bestSwap;
        usedIdsToday.add(bestSwap.id);
      }
    }
  } else if (totals.calories < lowerBound) {
    // Under target: swap the lightest non-breakfast meal for a heavier one
    let lightestSlot: MealSlot | null = null;
    let lightestCalories = Infinity;

    for (const slot of SLOT_ORDER) {
      if (slot === 'breakfast') continue;
      const meal = slotAssignments[slot];
      if (meal && meal.calories < lightestCalories) {
        lightestCalories = meal.calories;
        lightestSlot = slot;
      }
    }

    if (lightestSlot) {
      const category = SLOT_TO_CATEGORY[lightestSlot];
      const currentMeal = slotAssignments[lightestSlot];
      const candidates = pool.filter((m) => {
        if (m.category !== category) return false;
        if (currentMeal && m.id === currentMeal.id) return false;
        if (currentMeal && m.calories <= currentMeal.calories) return false;
        if (dietaryRestrictions.length > 0) {
          const mealText = [
            m.name.toLowerCase(),
            ...(m.ingredients ?? []).map((i) => i.toLowerCase()),
          ].join(' ');
          for (const restriction of dietaryRestrictions) {
            if (mealText.includes(restriction.toLowerCase())) return false;
          }
        }
        for (const s of SLOT_ORDER) {
          if (s !== lightestSlot && slotAssignments[s]?.id === m.id) return false;
        }
        return true;
      });

      if (candidates.length > 0) {
        let bestSwap = candidates[0];
        let bestDiff = Infinity;
        for (const c of candidates) {
          const newTotal = totals.calories - lightestCalories + c.calories;
          const diff = Math.abs(newTotal - targetCalories);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSwap = c;
          }
        }
        usedIdsToday.delete(slotAssignments[lightestSlot]?.id ?? '');
        slotAssignments[lightestSlot] = bestSwap;
        usedIdsToday.add(bestSwap.id);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Core day generation
// ---------------------------------------------------------------------------

function generateDay(
  dateStr: string,
  dayType: 'training' | 'rest' | 'hiit',
  profile: NutritionProfile,
  pool: MealTemplate[],
  previousDayPlan: DayPlan | null,
): DayPlan {
  const targets = getMacroTargets(profile, dayType);
  const remaining: MacroTargets = { ...targets };
  const usedIdsToday = new Set<string>();
  const slotAssignments: Record<MealSlot, MealTemplate | null> = {
    breakfast: null,
    midMorning: null,
    lunch: null,
    snack: null,
    dinner: null,
  };

  for (const slot of SLOT_ORDER) {
    const category = SLOT_TO_CATEGORY[slot];
    const candidates = filterCandidates(
      pool,
      category,
      profile.dietaryRestrictions,
      usedIdsToday,
    );

    const yesterdaySameSlotId = previousDayPlan?.slots[slot] ?? null;

    const picked = pickBestMeal(candidates, remaining, targets, yesterdaySameSlotId);
    if (picked) {
      slotAssignments[slot] = picked;
      usedIdsToday.add(picked.id);
      remaining.protein -= picked.protein;
      remaining.carbs -= picked.carbs;
      remaining.fat -= picked.fat;
      remaining.calories -= picked.calories;
    }
  }

  // Calorie adjustment pass
  adjustForCalories(
    slotAssignments,
    pool,
    targets,
    profile.dietaryRestrictions,
    usedIdsToday,
  );

  const totals = calculateTotals(slotAssignments);
  const slots = buildMealSlots(slotAssignments);

  return {
    date: dateStr,
    dayType,
    slots,
    totals,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateWeekPlan(input: GeneratePlanInput): DayPlan[] {
  const {
    profile,
    startDate,
    trainingDays,
    hiitDays = [3],
    customMeals,
  } = input;

  const pool = buildMealPool(MEAL_TEMPLATES, customMeals);
  const weekPlan: DayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const dateStr = i === 0 ? startDate : addDays(startDate, i);
    const dayType = getDayType(dateStr, trainingDays, hiitDays);
    const previousDayPlan = weekPlan.length > 0 ? weekPlan[weekPlan.length - 1] : null;

    const dayPlan = generateDay(dateStr, dayType, profile, pool, previousDayPlan);
    weekPlan.push(dayPlan);
  }

  return weekPlan;
}

export function generateSingleDay(
  input: GeneratePlanInput & { targetDate: string },
): DayPlan {
  const {
    profile,
    trainingDays,
    hiitDays = [3],
    existingPlans,
    customMeals,
    targetDate,
  } = input;

  const pool = buildMealPool(MEAL_TEMPLATES, customMeals);
  const dayType = getDayType(targetDate, trainingDays, hiitDays);

  // Find the previous day's plan from existingPlans for variety penalty
  const previousDateStr = addDays(targetDate, -1);
  const previousDayPlan =
    existingPlans?.find((p) => p.date === previousDateStr) ?? null;

  return generateDay(targetDate, dayType, profile, pool, previousDayPlan);
}
