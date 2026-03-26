import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getAIClient } from "@/lib/ai/ai-client";
import { TRAINER_SYSTEM } from "@/lib/ai/prompts/trainer-prompt";
import { buildServerContext } from "@/lib/ai/context-engine";

interface TrainerMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history = [], recoveryScore } = await request.json();

    // Validate message length
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Validate and sanitize history - only allow user/assistant roles
    const safeHistory = (history as Array<{ role: string; content: string }>)
      .filter(msg =>
        msg &&
        typeof msg.content === 'string' &&
        msg.content.length <= 2000 &&
        (msg.role === 'user' || msg.role === 'assistant')
      )
      .slice(-20) as Array<{ role: "user" | "assistant"; content: string }>;

    // Fetch all user data server-side in parallel
    const [recentWorkouts, personalRecords, activeProgram, onboardingProfile, totalWorkoutCount] =
      await Promise.all([
        prisma.workoutLog.findMany({
          where: { userId: user.id, isComplete: true },
          orderBy: { startTime: "desc" },
          take: 10,
        }),
        prisma.personalRecord.findMany({
          where: { userId: user.id },
          orderBy: { date: "desc" },
          take: 5,
        }),
        prisma.program.findFirst({
          where: { userId: user.id, isActive: true },
          include: {
            trainingDays: {
              select: { name: true, supersets: true },
              orderBy: { dayNumber: "asc" },
            },
          },
        }),
        prisma.onboardingProfile.findUnique({
          where: { userId: user.id },
        }),
        prisma.workoutLog.count({
          where: { userId: user.id, isComplete: true },
        }),
      ]);

    // Build context server-side from real DB data
    const context = buildServerContext(
      recentWorkouts,
      personalRecords,
      activeProgram,
      onboardingProfile,
      totalWorkoutCount,
      typeof recoveryScore === "number" ? recoveryScore : undefined,
    );

    const ai = getAIClient();

    // Build conversation messages
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    // System prompt
    messages.push({ role: "system", content: TRAINER_SYSTEM });

    // Inject server-built context
    messages.push({
      role: "user",
      content: `[CONTEXT - Do not respond to this, just use it for reference]\n${context}`,
    });
    messages.push({
      role: "assistant",
      content: "Understood, I have your training context loaded.",
    });

    // Add sanitized conversation history
    for (const msg of safeHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await ai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      temperature: 0.6,
      messages,
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

    try {
      const result = JSON.parse(jsonText);
      return NextResponse.json({ success: true, data: result });
    } catch {
      // If AI didn't return valid JSON, wrap the text
      return NextResponse.json({
        success: true,
        data: {
          message: responseText,
          suggestions: [],
          followUpPrompts: [],
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
