import { NextResponse } from "next/server";
import webpush from "web-push";

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_CONTACT = "mailto:k@adu.dk";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface SendRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function POST(req: Request) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "VAPID keys not configured" },
      { status: 500 }
    );
  }

  try {
    const { subscription, title, body, data } =
      (await req.json()) as SendRequest;

    if (!subscription || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields: subscription, title, body" },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: data || { url: "/" },
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push notification send error:", error);

    // Handle expired/invalid subscriptions
    const webPushErr = error as { statusCode?: number };
    if (webPushErr.statusCode === 410) {
      return NextResponse.json(
        { error: "Subscription expired", expired: true },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
