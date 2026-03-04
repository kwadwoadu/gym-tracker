import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: templateId } = await params;

  // Check if vote exists
  const existing = await prisma.templateVote.findUnique({
    where: { templateId_userId: { templateId, userId } },
  });

  if (existing) {
    // Remove vote
    await prisma.templateVote.delete({ where: { id: existing.id } });
    await prisma.workoutTemplate.update({
      where: { id: templateId },
      data: { upvotes: { decrement: 1 } },
    });
    return NextResponse.json({ voted: false });
  } else {
    // Add vote
    await prisma.templateVote.create({
      data: { templateId, userId },
    });
    await prisma.workoutTemplate.update({
      where: { id: templateId },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ voted: true });
  }
}
