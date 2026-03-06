import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { generateJSON } from "@/lib/ai/ai-client";

export async function POST(request: Request) {
  try {
    const userId = await getClerkId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseName, sessionData, history, analysisType } = body;

    if (!exerciseName || !analysisType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are a certified strength and conditioning coach (CSCS) integrated into a gym workout app.
Your role is to provide brief, actionable coaching cues during an active workout session.

Rules:
- Keep responses under 100 words
- Be specific with numbers (weight, reps, rest times)
- Never suggest anything dangerous or beyond the user's demonstrated ability
- Respond in JSON format with: { "title": string, "message": string, "action": string | null }`;

    const userPrompt = `Analysis type: ${analysisType}
Exercise: ${exerciseName}
Current session data: ${JSON.stringify(sessionData)}
Recent history (last 4 weeks): ${JSON.stringify(history)}

Provide a coaching suggestion.`;

    const result = await generateJSON<{
      title: string;
      message: string;
      action: string | null;
    }>(systemPrompt, userPrompt, {
      maxTokens: 256,
      temperature: 0.3,
      model: "claude-3-5-haiku-latest",
    });

    return NextResponse.json({ suggestion: result });
  } catch (error) {
    console.error("Copilot API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
