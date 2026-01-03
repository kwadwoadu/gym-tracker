import { NextResponse } from "next/server";

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    healthy: true,
    dexieCloud: {
      configured: !!process.env.NEXT_PUBLIC_DEXIE_CLOUD_URL,
    },
  };

  return NextResponse.json(status, { status: 200 });
}
