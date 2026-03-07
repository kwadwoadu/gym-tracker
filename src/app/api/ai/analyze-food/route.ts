import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { getAIClient } from "@/lib/ai/ai-client";
import {
  FOOD_ANALYSIS_SYSTEM,
  FOOD_ANALYSIS_USER,
} from "@/lib/ai/prompts/nutrition-prompt";

export async function POST(request: Request) {
  try {
    const userId = await getClerkId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64, mimeType = "image/jpeg" } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const ai = getAIClient();

    const response = await ai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        { role: "system", content: FOOD_ANALYSIS_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: FOOD_ANALYSIS_USER,
            },
          ],
        },
      ],
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error("No text content in AI response");
    }

    let jsonText = responseText;
    const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonText);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Food analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food" },
      { status: 500 }
    );
  }
}
