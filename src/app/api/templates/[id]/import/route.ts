import { getClerkId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getClerkId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: templateId } = await params;

  // Increment import counter
  const template = await prisma.workoutTemplate.update({
    where: { id: templateId },
    data: { imports: { increment: 1 } },
  });

  return NextResponse.json({ programData: template.programData });
}
