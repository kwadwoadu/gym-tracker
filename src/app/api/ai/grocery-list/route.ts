import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { generateJSON } from "@/lib/ai/ai-client";
import { GROCERY_LIST_SYSTEM } from "@/lib/ai/prompts/nutrition-prompt";

interface GroceryList {
  sections: Array<{
    name: string;
    items: Array<{ name: string; quantity: string }>;
  }>;
  skippedStaples: string[];
  totalEstimatedCost: string;
}

export async function POST(request: Request) {
  try {
    const userId = await getClerkId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meals, days = 7 } = await request.json();

    const userPrompt = `Generate a grocery list for ${days} days of meal prep.

Planned meals:
${meals
  .map(
    (m: { name: string; ingredients: string[]; servings: number }) =>
      `- ${m.name} (x${m.servings}): ${m.ingredients.join(", ")}`
  )
  .join("\n")}

Aggregate quantities and group by store section.`;

    const result = await generateJSON<GroceryList>(
      GROCERY_LIST_SYSTEM,
      userPrompt,
      { model: "claude-3-5-haiku-latest", maxTokens: 2048, temperature: 0.3 }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Grocery list error:", error);
    return NextResponse.json(
      { error: "Failed to generate grocery list" },
      { status: 500 }
    );
  }
}
