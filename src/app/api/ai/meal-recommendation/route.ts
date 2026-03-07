import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { generateJSON } from "@/lib/ai/ai-client";
import { MEAL_RECOMMENDATION_SYSTEM } from "@/lib/ai/prompts/nutrition-prompt";

interface MealSuggestion {
  suggestions: Array<{
    type: "template" | "custom";
    templateId?: string;
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    matchPercentage: number;
    reason: string;
  }>;
  message: string;
}

export async function POST(request: Request) {
  try {
    const userId = await getClerkId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { remainingProtein, remainingCarbs, remainingFat, mealSlot, templates } =
      await request.json();

    const userPrompt = `Remaining targets for ${mealSlot}:
- Protein: ${remainingProtein}g
- Carbs: ${remainingCarbs}g
- Fat: ${remainingFat}g

Available meal templates:
${templates
  .map(
    (t: { id: string; name: string; protein: number; carbs: number; fat: number; calories: number }) =>
      `${t.id}: ${t.name} (P:${t.protein}g C:${t.carbs}g F:${t.fat}g, ${t.calories}cal)`
  )
  .join("\n")}

Suggest the best meals to hit my remaining targets.`;

    const result = await generateJSON<MealSuggestion>(
      MEAL_RECOMMENDATION_SYSTEM,
      userPrompt,
      { model: "gpt-4o-mini", maxTokens: 1024, temperature: 0.5 }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Meal recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
