import { getClerkId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Public endpoint: templates are browsable without auth
// Auth is used optionally to mark "my templates"
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const splitType = searchParams.get("splitType");
  const difficulty = searchParams.get("difficulty");
  const dayCount = searchParams.get("dayCount");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "upvotes";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  if (search && search.length > 200) {
    return NextResponse.json({ error: "Search too long" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (splitType && splitType !== "all") {
    where.splitType = splitType;
  }
  if (difficulty && difficulty !== "all") {
    where.difficulty = difficulty;
  }
  if (dayCount && dayCount !== "all") {
    const parsed = parseInt(dayCount);
    if (!isNaN(parsed)) {
      where.dayCount = parsed;
    }
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
  const userId = await getClerkId();
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
  const userId = await getClerkId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Validate required fields
  if (!body.programName || typeof body.programName !== 'string' || body.programName.length > 200) {
    return NextResponse.json({ error: "Invalid program name" }, { status: 400 });
  }
  if (body.authorName && (typeof body.authorName !== 'string' || body.authorName.length > 100)) {
    return NextResponse.json({ error: "Invalid author name" }, { status: 400 });
  }

  const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
  if (body.difficulty && !VALID_DIFFICULTIES.includes(body.difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
  }

  const VALID_SPLITS = ["ppl", "upper_lower", "full_body", "bro_split", "other"];
  if (body.splitType && !VALID_SPLITS.includes(body.splitType)) {
    return NextResponse.json({ error: "Invalid split type" }, { status: 400 });
  }

  // Validate programData is a valid object (not a string, not null)
  if (!body.programData || typeof body.programData !== 'object' || Array.isArray(body.programData)) {
    return NextResponse.json({ error: "Invalid program data" }, { status: 400 });
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
