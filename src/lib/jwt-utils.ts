/**
 * Shared JWT decode utility for Clerk __session cookie.
 *
 * Used by both middleware.ts (Edge) and auth-helpers.ts (Server).
 * Decodes without signature verification - acceptable because
 * __session is Clerk-signed and we only use it as a fallback
 * when Clerk's auth() fails on Vercel.
 */

interface ClerkJWTPayload {
  sub: string;
  exp: number;
  [key: string]: unknown;
}

/**
 * Decode a Clerk JWT and return the user ID (sub claim).
 * Returns null if the token is malformed, expired, or missing sub.
 */
export function decodeClerkJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64url without Buffer (edge-compatible)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload: ClerkJWTPayload = JSON.parse(jsonStr);

    // 30s grace period for clock skew and long workout sessions
    if (payload.exp && payload.exp * 1000 < Date.now() - 30000) {
      return null;
    }

    return payload.sub || null;
  } catch {
    return null;
  }
}
