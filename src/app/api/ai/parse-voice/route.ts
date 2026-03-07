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
    const { transcript, exerciseName, lastWeight, lastReps } = body;

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
    }

    const systemPrompt = `You are a workout set data parser. Extract structured data from voice transcripts during gym workouts.

Rules:
- Extract weight (in kg), reps, and RPE (1-10 scale)
- "same" means repeat the last weight
- "up X" means add X to last weight
- "down X" means subtract X from last weight
- Natural RPE: easy=5, moderate=7, hard=8, very hard=9, failed/max=10
- Respond only with JSON: { "weight": number|null, "reps": number|null, "rpe": number|null }`;

    const userPrompt = `Transcript: "${transcript}"
Current exercise: ${exerciseName || "unknown"}
Last weight: ${lastWeight || "unknown"}kg
Last reps: ${lastReps || "unknown"}`;

    const result = await generateJSON<{
      weight: number | null;
      reps: number | null;
      rpe: number | null;
    }>(systemPrompt, userPrompt, {
      maxTokens: 64,
      temperature: 0.1,
      model: "gpt-4o-mini",
    });

    return NextResponse.json({ parsed: result });
  } catch (error) {
    console.error("Voice parse API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
