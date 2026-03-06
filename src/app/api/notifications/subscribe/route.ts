import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getClerkId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await req.json();

  await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId,
        endpoint: subscription.endpoint,
      },
    },
    update: {
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? "",
      updatedAt: new Date(),
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? "",
    },
  });

  return NextResponse.json({ success: true });
}
