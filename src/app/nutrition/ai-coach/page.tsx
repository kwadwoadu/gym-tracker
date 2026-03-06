"use client";

import { useState, useCallback } from "react";
import {
  Camera,
  Sparkles,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoLogger } from "@/components/nutrition/photo-logger";
import {
  MealSuggestionCard,
  type MealSuggestion,
} from "@/components/nutrition/meal-suggestion-card";
import {
  GroceryList,
  GroceryListLoading,
} from "@/components/nutrition/grocery-list";
import { type FoodAnalysis } from "@/components/nutrition/macro-result-card";
import { MEAL_TEMPLATES } from "@/data/meal-templates";

type ActiveSection = "none" | "photo" | "suggestions" | "grocery";

export default function AICoachPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("none");
  const [suggestions, setSuggestions] = useState<MealSuggestion[] | null>(null);
  const [suggestionsMessage, setSuggestionsMessage] = useState<string>("");
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [groceryData, setGroceryData] = useState<{
    sections: Array<{
      name: string;
      items: Array<{ name: string; quantity: string }>;
    }>;
    skippedStaples: string[];
    totalEstimatedCost: string;
  } | null>(null);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [savedMeals, setSavedMeals] = useState<FoodAnalysis[]>([]);
  const [mealSlot, setMealSlot] = useState<string>("dinner");

  const handlePhotoSave = useCallback((analysis: FoodAnalysis) => {
    setSavedMeals((prev) => [...prev, analysis]);
    setActiveSection("none");
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setActiveSection("suggestions");
    setSuggestionsLoading(true);

    // Calculate consumed macros from saved meals
    const consumed = savedMeals.reduce(
      (acc, m) => ({
        protein: acc.protein + m.totalProtein,
        carbs: acc.carbs + m.totalCarbs,
        fat: acc.fat + m.totalFat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    // Daily targets (reasonable defaults)
    const targets = { protein: 180, carbs: 250, fat: 70 };
    const remaining = {
      protein: Math.max(0, targets.protein - consumed.protein),
      carbs: Math.max(0, targets.carbs - consumed.carbs),
      fat: Math.max(0, targets.fat - consumed.fat),
    };

    try {
      const res = await fetch("/api/ai/meal-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remainingProtein: remaining.protein,
          remainingCarbs: remaining.carbs,
          remainingFat: remaining.fat,
          mealSlot,
          templates: MEAL_TEMPLATES.map((t) => ({
            id: t.id,
            name: t.name,
            protein: t.protein,
            carbs: t.carbs,
            fat: t.fat,
            calories: t.calories,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const { data } = await res.json();
      setSuggestions(data.suggestions);
      setSuggestionsMessage(data.message);
    } catch {
      setSuggestions([]);
      setSuggestionsMessage(
        "Could not generate suggestions. Try again later."
      );
    } finally {
      setSuggestionsLoading(false);
    }
  }, [savedMeals, mealSlot]);

  const fetchGroceryList = useCallback(async () => {
    setActiveSection("grocery");
    setGroceryLoading(true);

    // Use meal templates with ingredients for grocery generation
    const mealsWithIngredients = MEAL_TEMPLATES.filter(
      (t) => t.ingredients && t.ingredients.length > 0
    ).map((t) => ({
      name: t.name,
      ingredients: t.ingredients || [],
      servings: 2, // 2 servings per meal over the week
    }));

    try {
      const res = await fetch("/api/ai/grocery-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: mealsWithIngredients, days: 7 }),
      });

      if (!res.ok) throw new Error("Failed");

      const { data } = await res.json();
      setGroceryData(data);
    } catch {
      setGroceryData(null);
    } finally {
      setGroceryLoading(false);
    }
  }, []);

  const handleAddSuggestion = useCallback((suggestion: MealSuggestion) => {
    // Add to saved meals as if it was logged
    const analysis: FoodAnalysis = {
      foods: [
        {
          name: suggestion.name,
          protein: suggestion.protein,
          carbs: suggestion.carbs,
          fat: suggestion.fat,
          calories: suggestion.calories,
          confidence: "high" as const,
        },
      ],
      totalProtein: suggestion.protein,
      totalCarbs: suggestion.carbs,
      totalFat: suggestion.fat,
      totalCalories: suggestion.calories,
    };
    setSavedMeals((prev) => [...prev, analysis]);
    setActiveSection("none");
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Today's logged meals summary */}
      {savedMeals.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Logged Today via AI
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-dim-foreground">Protein</p>
              <p className="text-sm font-bold text-primary">
                {savedMeals.reduce((s, m) => s + m.totalProtein, 0)}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Carbs</p>
              <p className="text-sm font-bold text-blue-400">
                {savedMeals.reduce((s, m) => s + m.totalCarbs, 0)}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Fat</p>
              <p className="text-sm font-bold text-orange-400">
                {savedMeals.reduce((s, m) => s + m.totalFat, 0)}g
              </p>
            </div>
            <div>
              <p className="text-xs text-dim-foreground">Calories</p>
              <p className="text-sm font-bold text-white">
                {savedMeals.reduce((s, m) => s + m.totalCalories, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {activeSection === "none" && (
        <div className="space-y-3">
          <Button
            onClick={() => setActiveSection("photo")}
            className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-semibold text-base"
          >
            <Camera className="w-5 h-5 mr-2" />
            Log Meal with Photo
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={fetchSuggestions}
              variant="outline"
              className="h-12 border-border text-white hover:bg-card"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Suggest Meal
            </Button>
            <Button
              onClick={fetchGroceryList}
              variant="outline"
              className="h-12 border-border text-white hover:bg-card"
            >
              <ShoppingCart className="w-4 h-4 mr-2 text-primary" />
              Grocery List
            </Button>
          </div>

          {/* Meal slot selector for suggestions */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-dim-foreground">Suggesting for:</span>
            <select
              value={mealSlot}
              onChange={(e) => setMealSlot(e.target.value)}
              className="text-xs bg-card text-white border border-border rounded-lg px-3 py-1.5"
            >
              <option value="breakfast">Breakfast</option>
              <option value="midMorning">Mid-Morning</option>
              <option value="lunch">Lunch</option>
              <option value="snack">Snack</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>
      )}

      {/* Photo Logger */}
      {activeSection === "photo" && (
        <PhotoLogger
          onSave={handlePhotoSave}
          onClose={() => setActiveSection("none")}
        />
      )}

      {/* AI Suggestions */}
      {activeSection === "suggestions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Suggestions
            </h3>
            <button
              onClick={() => setActiveSection("none")}
              className="text-xs text-primary"
            >
              Close
            </button>
          </div>

          {suggestionsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Finding the best meals...
              </p>
            </div>
          ) : (
            <>
              {suggestionsMessage && (
                <p className="text-sm text-muted-foreground">{suggestionsMessage}</p>
              )}
              {suggestions?.map((s, i) => (
                <MealSuggestionCard
                  key={i}
                  suggestion={s}
                  onAdd={handleAddSuggestion}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Grocery List */}
      {activeSection === "grocery" && (
        <div className="space-y-3">
          {!groceryLoading && (
            <div className="flex justify-end">
              <button
                onClick={() => setActiveSection("none")}
                className="text-xs text-primary"
              >
                Close
              </button>
            </div>
          )}
          {groceryLoading ? (
            <GroceryListLoading />
          ) : groceryData ? (
            <GroceryList data={groceryData} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Could not generate grocery list. Try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
