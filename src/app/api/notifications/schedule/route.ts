import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_CONTACT = "mailto:k@adu.dk";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

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

  // Send push notification to each subscription
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

      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          );
          return { endpoint: sub.endpoint, sent: true };
        } catch (error) {
          // Remove expired subscriptions
          if (
            error instanceof webpush.WebPushError &&
            error.statusCode === 410
          ) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            return { endpoint: sub.endpoint, sent: false, expired: true };
          }
          throw error;
        }
      }

      // Fallback: return payload for client-side scheduling
      return { endpoint: sub.endpoint, payload: pushPayload };
    })
  );

  const sent = results.filter(
    (r) => r.status === "fulfilled" && (r.value as { sent?: boolean }).sent
  ).length;

  return NextResponse.json({
    success: true,
    sent,
    total: subscriptions.length,
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
