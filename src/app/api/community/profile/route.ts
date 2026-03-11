import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// --- Input Validation Helpers ---

const DISPLAY_NAME_MAX = 50;
const BIO_MAX = 500;
const HANDLE_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

function validateAvatarUrl(url: unknown): string | null {
  if (url === null || url === undefined || url === "") return null;
  if (typeof url !== "string") return "avatarUrl must be a string";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "avatarUrl must use http or https protocol";
    }
  } catch {
    return "avatarUrl is not a valid URL";
  }
  return null;
}

function validateProfileFields(body: Record<string, unknown>): string | null {
  const { displayName, bio, handle } = body;

  if (displayName !== undefined && displayName !== null) {
    if (typeof displayName !== "string") return "displayName must be a string";
    if (displayName.length > DISPLAY_NAME_MAX) {
      return `displayName must be ${DISPLAY_NAME_MAX} characters or fewer`;
    }
  }

  if (bio !== undefined && bio !== null) {
    if (typeof bio !== "string") return "bio must be a string";
    if (bio.length > BIO_MAX) {
      return `bio must be ${BIO_MAX} characters or fewer`;
    }
  }

  if (handle !== undefined && handle !== null) {
    if (typeof handle !== "string") return "handle must be a string";
    if (!HANDLE_REGEX.test(handle)) {
      return "handle must be 3-30 characters and contain only letters, numbers, hyphens, or underscores";
    }
  }

  return null;
}

// GET /api/community/profile - Get own profile
export const GET = withAuth(async (req, user) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(profile);
});

// PUT /api/community/profile - Update own profile
export const PUT = withAuth(async (req, user) => {
  const body = await req.json();

  // REV-001: Validate avatarUrl protocol (prevent XSS via javascript:/data: URIs)
  const avatarUrlError = validateAvatarUrl(body.avatarUrl);
  if (avatarUrlError) {
    return NextResponse.json({ error: avatarUrlError }, { status: 400 });
  }

  // REV-008: Validate profile field lengths and format
  const fieldError = validateProfileFields(body);
  if (fieldError) {
    return NextResponse.json({ error: fieldError }, { status: 400 });
  }

  const { displayName, avatarUrl, bio, handle, shareStreak, shareVolume, shareWorkouts } = body;

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName,
      avatarUrl,
      bio,
      handle,
      shareStreak,
      shareVolume,
      shareWorkouts,
    },
    create: {
      userId: user.id,
      displayName,
      avatarUrl,
      bio,
      handle,
      shareStreak: shareStreak ?? true,
      shareVolume: shareVolume ?? false,
      shareWorkouts: shareWorkouts ?? true,
    },
  });

  return NextResponse.json(profile);
});
