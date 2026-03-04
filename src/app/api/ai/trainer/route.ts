import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAIClient } from "@/lib/ai/ai-client";
import { TRAINER_SYSTEM } from "@/lib/ai/prompts/trainer-prompt";

interface TrainerMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const ai = getAIClient();

    // Build conversation messages
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add context as first user message if provided
    if (context) {
      messages.push({
        role: "user",
        content: `[CONTEXT - Do not respond to this, just use it for reference]\n${context}`,
      });
      messages.push({
        role: "assistant",
        content: "Understood, I have your training context loaded.",
      });
    }

    // Add conversation history (last 20 messages)
    const recentHistory = (history as TrainerMessage[]).slice(-20);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await ai.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.6,
      system: TRAINER_SYSTEM,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in AI response");
    }

    let jsonText = textBlock.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    try {
      const result = JSON.parse(jsonText);
      return NextResponse.json({ success: true, data: result });
    } catch {
      // If AI didn't return valid JSON, wrap the text
      return NextResponse.json({
        success: true,
        data: {
          message: textBlock.text.trim(),
          suggestions: [],
          riskLevel: "none",
        },
      });
    }
  } catch (error) {
    console.error("Trainer error:", error);
    return NextResponse.json(
      { error: "Failed to process trainer request" },
      { status: 500 }
    );
  }
}
