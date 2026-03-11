import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getOrCreateUser>>>;

type AuthHandler = (req: Request, user: AuthUser) => Promise<Response>;

type AuthHandlerWithParams<P = Record<string, string>> = (
  req: Request,
  user: AuthUser,
  params: P
) => Promise<Response>;

/**
 * Higher-order function that wraps an API route handler with auth check.
 * Eliminates the repeated getOrCreateUser + null check pattern.
 */
export function withAuth(handler: AuthHandler) {
  return async (req: Request) => {
    try {
      const user = await getOrCreateUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return handler(req, user);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

/**
 * withAuth variant for routes with dynamic params (e.g., [id]).
 * Next.js 15 passes params as a Promise.
 */
export function withAuthParams<P = Record<string, string>>(
  handler: AuthHandlerWithParams<P>
) {
  return async (req: Request, context: { params: Promise<P> }) => {
    try {
      const user = await getOrCreateUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const params = await context.params;
      return handler(req, user, params);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
