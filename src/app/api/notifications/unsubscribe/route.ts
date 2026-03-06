import { NextResponse } from "next/server";
import { getClerkId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getClerkId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = await req.json();

  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });

  return NextResponse.json({ success: true });
}
