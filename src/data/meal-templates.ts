// Meal Templates for Nutrition Tracking
// All meals are lactose-free and simple to prepare
// NO dairy (including Greek yogurt, cottage cheese, cheese)
// NO quinoa (use rice instead)

export type MealCategory = 'breakfast' | 'midMorning' | 'lunch' | 'snack' | 'dinner';

export interface MealTemplate {
  id: string;
  name: string;
  category: MealCategory;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  calories: number;
  prepTime: string; // e.g., "5 min", "Batch prep"
  ingredients?: string[];
  isShake?: boolean; // Can have supplements mixed in (for shake builder)
}

export const MEAL_TEMPLATES: MealTemplate[] = [
  // ============================================================
  // Breakfast (B1-B4) - Target: 35-40g protein
  // ============================================================
  {
    id: 'B1',
    name: 'Power Oats + Whey',
    category: 'breakfast',
    protein: 39,
    carbs: 70,
    fat: 15,
    calories: 580,
    prepTime: '5 min',
    ingredients: ['80g oats', '1 scoop whey isolate', '1 banana', '1 tbsp almond butter'],
  },
  {
    id: 'B2',
    name: 'Egg White Scramble + Turkey Bacon',
    category: 'breakfast',
    protein: 41,
    carbs: 20,
    fat: 18,
    calories: 400,
    prepTime: '10 min',
    ingredients: ['2 whole eggs', '150g egg whites', '3 turkey bacon slices', 'spinach', '1 slice sourdough'],
  },
  {
    id: 'B3',
    name: 'Overnight Oats + Whey',
    category: 'breakfast',
    protein: 37,
    carbs: 65,
    fat: 12,
    calories: 520,
    prepTime: 'Prep night before',
    ingredients: ['80g oats', '1 scoop whey isolate', '1 tbsp chia seeds', '200ml lactose-free milk', '1 tsp honey'],
  },
  {
    id: 'B4',
    name: 'Protein Pancakes',
    category: 'breakfast',
    protein: 35,
    carbs: 45,
    fat: 10,
    calories: 410,
    prepTime: '15 min',
    ingredients: ['1 banana', '2 eggs', '1 scoop whey isolate', '40g oat flour', 'maple syrup'],
  },

  // ============================================================
  // Mid-Morning (M1-M3) - Target: 25-30g protein
  // ============================================================
  {
    id: 'M1',
    name: 'Protein Shake + Banana',
    category: 'midMorning',
    protein: 34,
    carbs: 35,
    fat: 3,
    calories: 300,
    prepTime: '2 min',
    ingredients: ['1 scoop whey isolate', '1 banana', '250ml lactose-free milk'],
    isShake: true,
  },
  {
    id: 'M2',
    name: 'Hard Boiled Eggs (3) + Rice Cakes',
    category: 'midMorning',
    protein: 22,
    carbs: 20,
    fat: 18,
    calories: 330,
    prepTime: 'Batch prep',
    ingredients: ['3 hard boiled eggs', '2 rice cakes', '0.5 avocado'],
  },
  {
    id: 'M3',
    name: 'Turkey Roll-Ups',
    category: 'midMorning',
    protein: 25,
    carbs: 5,
    fat: 8,
    calories: 190,
    prepTime: '3 min',
    ingredients: ['120g turkey breast slices', 'mustard', 'lettuce'],
  },

  // ============================================================
  // Lunch (L1-L5) - Target: 45-50g protein
  // ============================================================
  {
    id: 'L1',
    name: 'Chicken Salad Bowl',
    category: 'lunch',
    protein: 50,
    carbs: 12,
    fat: 22,
    calories: 450,
    prepTime: '10 min',
    ingredients: ['200g chicken breast', 'mixed greens', 'cherry tomatoes', 'cucumber', '1.5 tbsp olive oil'],
  },
  {
    id: 'L2',
    name: 'Tuna Rice Bowl',
    category: 'lunch',
    protein: 54,
    carbs: 50,
    fat: 14,
    calories: 550,
    prepTime: '10 min',
    ingredients: ['2 cans tuna (200g)', '150g cooked rice', '0.5 avocado', 'soy sauce', 'sesame seeds'],
  },
  {
    id: 'L3',
    name: 'Turkey Wrap',
    category: 'lunch',
    protein: 48,
    carbs: 35,
    fat: 12,
    calories: 440,
    prepTime: '5 min',
    ingredients: ['150g turkey breast', '50g extra turkey slices', '1 large tortilla', 'hummus', 'lettuce', 'tomato'],
  },
  {
    id: 'L4',
    name: 'Salmon + Rice',
    category: 'lunch',
    protein: 45,
    carbs: 45,
    fat: 20,
    calories: 540,
    prepTime: '20 min',
    ingredients: ['180g salmon fillet', '150g cooked rice', 'roasted vegetables', '1 tbsp olive oil'],
  },
  {
    id: 'L5',
    name: 'Beef Stir Fry + Rice',
    category: 'lunch',
    protein: 50,
    carbs: 45,
    fat: 15,
    calories: 520,
    prepTime: '15 min',
    ingredients: ['180g lean beef strips', '200g stir fry vegetables', '150g rice', 'soy sauce', 'sesame oil'],
  },

  // ============================================================
  // Snack (S1-S4) - Target: 15-20g protein
  // ============================================================
  {
    id: 'S1',
    name: 'Protein Bar',
    category: 'snack',
    protein: 20,
    carbs: 20,
    fat: 8,
    calories: 230,
    prepTime: '0 min',
    ingredients: ['1 protein bar (Barebells, Quest - check for lactose)'],
  },
  {
    id: 'S2',
    name: 'Deli Meat Roll-Ups',
    category: 'snack',
    protein: 18,
    carbs: 2,
    fat: 3,
    calories: 110,
    prepTime: '2 min',
    ingredients: ['100g turkey/chicken deli slices', 'mustard'],
  },
  {
    id: 'S3',
    name: 'Edamame',
    category: 'snack',
    protein: 17,
    carbs: 12,
    fat: 7,
    calories: 180,
    prepTime: '5 min',
    ingredients: ['150g shelled edamame', 'sea salt'],
  },
  {
    id: 'S4',
    name: 'Protein Shake (plain)',
    category: 'snack',
    protein: 25,
    carbs: 3,
    fat: 2,
    calories: 130,
    prepTime: '2 min',
    ingredients: ['1 scoop whey isolate', 'water'],
    isShake: true,
  },

  // ============================================================
  // Dinner (D1-D5) - Target: 45-50g protein
  // ============================================================
  {
    id: 'D1',
    name: 'Chicken + Sweet Potato',
    category: 'dinner',
    protein: 53,
    carbs: 45,
    fat: 15,
    calories: 530,
    prepTime: '25 min',
    ingredients: ['200g chicken breast', '200g sweet potato', '150g broccoli', '1 tbsp olive oil'],
  },
  {
    id: 'D2',
    name: 'White Fish + Vegetables',
    category: 'dinner',
    protein: 56,
    carbs: 15,
    fat: 20,
    calories: 460,
    prepTime: '20 min',
    ingredients: ['250g cod/sea bass', '200g roasted vegetables', '1.5 tbsp olive oil', '0.5 lemon'],
  },
  {
    id: 'D3',
    name: 'Lean Beef Burger (no bun) + Salad',
    category: 'dinner',
    protein: 53,
    carbs: 8,
    fat: 28,
    calories: 500,
    prepTime: '15 min',
    ingredients: ['200g lean ground beef (93%)', 'large salad', '1 tbsp olive oil dressing'],
  },
  {
    id: 'D4',
    name: 'Shrimp Stir Fry + Rice Noodles',
    category: 'dinner',
    protein: 57,
    carbs: 55,
    fat: 5,
    calories: 500,
    prepTime: '15 min',
    ingredients: ['250g shrimp', '200g mixed vegetables', '80g dry rice noodles', 'soy sauce', 'garlic'],
  },
  {
    id: 'D5',
    name: 'Egg Frittata (eggs + turkey sausage)',
    category: 'dinner',
    protein: 58,
    carbs: 10,
    fat: 25,
    calories: 490,
    prepTime: '30 min',
    ingredients: ['4 whole eggs', '150g egg whites', '100g turkey sausage', '150g diced vegetables'],
  },
];

// Slot types for meal planning
export type MealSlot = 'breakfast' | 'midMorning' | 'lunch' | 'snack' | 'dinner';

export interface MealSlots {
  breakfast: string | null;
  midMorning: string | null;
  lunch: string | null;
  snack: string | null;
  dinner: string | null;
}

// Helper functions
export function getMealById(id: string): MealTemplate | undefined {
  return MEAL_TEMPLATES.find((meal) => meal.id === id);
}

export function getMealsByCategory(category: MealCategory): MealTemplate[] {
  return MEAL_TEMPLATES.filter((meal) => meal.category === category);
}

export function calculateTotalMacros(slots: MealSlots): {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
} {
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let calories = 0;

  Object.values(slots).forEach((mealId) => {
    if (mealId) {
      const meal = getMealById(mealId);
      if (meal) {
        protein += meal.protein;
        carbs += meal.carbs;
        fat += meal.fat;
        calories += meal.calories;
      }
    }
  });

  return { protein, carbs, fat, calories };
}

// Category display names
export const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  midMorning: 'Mid-Morning',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

// Slot display names (same as category labels)
export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  midMorning: 'Mid-Morning',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

// Helper to check if a meal is a shake (can have supplements mixed in)
export function isShakeMeal(mealId: string): boolean {
  const meal = getMealById(mealId);
  return meal?.isShake === true;
}

// Get all shake meals
export function getShakeMeals(): MealTemplate[] {
  return MEAL_TEMPLATES.filter((meal) => meal.isShake === true);
}
