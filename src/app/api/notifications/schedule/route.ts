import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";
import { ensureVapidConfigured } from "@/lib/web-push-config";

const VALID_TYPES = ["training_reminder", "streak_protection", "weekly_digest"] as const;
type NotificationType = (typeof VALID_TYPES)[number];

interface ScheduleRequest {
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor?: string;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, title, body } = (await req.json()) as ScheduleRequest;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!title || !body) {
    return NextResponse.json(
      { error: "Missing required fields: title, body" },
      { status: 400 }
    );
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "No push subscriptions found" },
      { status: 404 }
    );
  }

  const vapidReady = ensureVapidConfigured();

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

      if (vapidReady) {
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
          const webPushErr = error as { statusCode?: number };
          if (webPushErr.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            return { endpoint: sub.endpoint, sent: false, expired: true };
          }
          throw error;
        }
      }

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

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.pushSubscription.count({
    where: { userId },
  });

  return NextResponse.json({
    hasSubscription: count > 0,
    subscriptionCount: count,
  });
}
