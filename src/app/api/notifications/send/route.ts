import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import webpush from "web-push";
import { ensureVapidConfigured } from "@/lib/web-push-config";

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
  const userId = await getClerkId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ensureVapidConfigured()) {
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

    // Validate subscription structure
    if (
      !subscription.endpoint ||
      typeof subscription.endpoint !== "string" ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid subscription: endpoint and keys (p256dh, auth) required" },
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
