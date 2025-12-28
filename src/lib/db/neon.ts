import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Check if we have database URL (only available in cloud mode)
const hasDatabase = !!process.env.DATABASE_URL;

// Create connection only if DATABASE_URL is available
const sql = hasDatabase ? neon(process.env.DATABASE_URL!) : null;

// Export drizzle instance (null if no database)
export const cloudDb = sql ? drizzle(sql, { schema }) : null;

// Check if cloud sync is available
export function isCloudSyncEnabled(): boolean {
  return hasDatabase && cloudDb !== null;
}
