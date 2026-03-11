import { describe, it, expect, vi, afterEach } from "vitest";
import { decodeClerkJwt } from "../jwt-utils";

/**
 * Create a fake JWT with base64url-encoded payload.
 * Uses base64url (not standard base64) to match real Clerk token format.
 * CAUTION: Creates unsigned tokens for unit testing only.
 */
function fakeJwt(payload: Record<string, unknown>): string {
  const toBase64Url = (str: string) =>
    btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe("decodeClerkJwt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns user ID from valid token", () => {
    const token = fakeJwt({ sub: "user_abc123", exp: Math.floor(Date.now() / 1000) + 300 });
    expect(decodeClerkJwt(token)).toBe("user_abc123");
  });

  it("returns null for malformed token (not 3 parts)", () => {
    expect(decodeClerkJwt("only.two")).toBeNull();
    expect(decodeClerkJwt("single")).toBeNull();
    expect(decodeClerkJwt("")).toBeNull();
  });

  it("returns null for expired token beyond grace period", () => {
    const expiredLongAgo = Math.floor(Date.now() / 1000) - 60; // 60s ago (> 30s grace)
    const token = fakeJwt({ sub: "user_abc123", exp: expiredLongAgo });
    expect(decodeClerkJwt(token)).toBeNull();
  });

  it("returns user ID for recently expired token within grace period", () => {
    const recentlyExpired = Math.floor(Date.now() / 1000) - 10; // 10s ago (< 30s grace)
    const token = fakeJwt({ sub: "user_abc123", exp: recentlyExpired });
    expect(decodeClerkJwt(token)).toBe("user_abc123");
  });

  it("returns null when sub is missing", () => {
    const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 });
    expect(decodeClerkJwt(token)).toBeNull();
  });

  it("returns null for invalid JSON payload", () => {
    const toBase64Url = (str: string) =>
      btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const header = toBase64Url(JSON.stringify({ alg: "RS256" }));
    const badBody = toBase64Url("not-json{{{");
    expect(decodeClerkJwt(`${header}.${badBody}.sig`)).toBeNull();
  });

  it("correctly decodes base64url characters (+, /, =)", () => {
    // Payload with characters that differ between base64 and base64url
    const token = fakeJwt({ sub: "user_with+special/chars==", exp: Math.floor(Date.now() / 1000) + 300 });
    expect(decodeClerkJwt(token)).toBe("user_with+special/chars==");
  });
});
