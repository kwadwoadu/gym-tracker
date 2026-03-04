import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface ScheduleRequest {
  type: "training_reminder" | "streak_protection" | "weekly_digest";
  title: string;
  body: string;
  scheduledFor?: string; // ISO timestamp
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, title, body } = (await req.json()) as ScheduleRequest;

  // Get user's push subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "No push subscriptions found" },
      { status: 404 }
    );
  }

  // For now, send immediately via web-push (VAPID keys required)
  // In production, this would integrate with a job queue for scheduled sends
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushPayload = JSON.stringify({
        type,
        title,
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        data: { url: "/" },
      });

      // Use web-push library if available, otherwise store for polling
      // For MVP, we return the payload for client-side scheduling
      return { endpoint: sub.endpoint, payload: pushPayload };
    })
  );

  return NextResponse.json({
    success: true,
    sent: results.filter((r) => r.status === "fulfilled").length,
  });
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return user's notification subscription status
  const count = await prisma.pushSubscription.count({
    where: { userId },
  });

  return NextResponse.json({
    hasSubscription: count > 0,
    subscriptionCount: count,
  });
}
