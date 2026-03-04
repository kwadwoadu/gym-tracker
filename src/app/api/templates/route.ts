import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const splitType = searchParams.get("splitType");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "upvotes";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (splitType && splitType !== "all") {
    where.splitType = splitType;
  }
  if (search) {
    where.OR = [
      { programName: { contains: search, mode: "insensitive" } },
      { authorName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" as const }
      : { upvotes: "desc" as const };

  const [templates, total] = await Promise.all([
    prisma.workoutTemplate.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workoutTemplate.count({ where }),
  ]);

  // Check if current user has voted on these templates
  const { userId } = await auth();
  let votedIds: Set<string> = new Set();
  if (userId) {
    const votes = await prisma.templateVote.findMany({
      where: {
        userId,
        templateId: { in: templates.map((t) => t.id) },
      },
      select: { templateId: true },
    });
    votedIds = new Set(votes.map((v) => v.templateId));
  }

  const result = templates.map((t) => ({
    ...t,
    hasVoted: votedIds.has(t.id),
  }));

  return NextResponse.json({ templates: result, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.programName || !body.programData || !body.difficulty || !body.splitType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const template = await prisma.workoutTemplate.create({
    data: {
      authorId: userId,
      authorName: body.authorName || "Anonymous",
      programName: body.programName,
      description: body.description || "",
      difficulty: body.difficulty,
      splitType: body.splitType,
      dayCount: body.dayCount || 0,
      estimatedDuration: body.estimatedDuration || 0,
      programData: body.programData,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
