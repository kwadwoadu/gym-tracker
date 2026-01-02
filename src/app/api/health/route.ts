import { NextResponse } from "next/server";
import { cloudDb, isCloudSyncEnabled } from "@/lib/db/neon";
import { sql } from "drizzle-orm";

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      configured: !!process.env.DATABASE_URL,
      cloudSyncEnabled: isCloudSyncEnabled(),
      connected: false,
      error: null as string | null,
    },
  };

  // Test actual database connection
  if (cloudDb && isCloudSyncEnabled()) {
    try {
      // Simple query to verify connection works
      await cloudDb.execute(sql`SELECT 1`);
      status.database.connected = true;
    } catch (error) {
      status.database.connected = false;
      status.database.error = error instanceof Error ? error.message : "Unknown database error";
    }
  } else {
    status.database.error = "cloudDb is null or sync disabled";
  }

  const httpStatus = status.database.connected ? 200 : 503;

  return NextResponse.json(status, { status: httpStatus });
}
