/**
 * Date conversion utilities for cloud sync.
 *
 * IndexedDB stores dates as ISO strings (e.g., "2026-01-02T10:30:00.000Z"),
 * but Drizzle ORM / Prisma expect Date objects and call .toISOString() on them.
 * These helpers transform string dates to Date objects at the API boundary.
 */

/**
 * Safely converts a string or Date to a Date object.
 * Returns null if the input is null/undefined or invalid.
 */
export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    console.warn(`[toDate] Invalid date value: "${value}"`);
    return null;
  }
  return date;
}

/**
 * Converts a string date to Date object, with fallback to current time.
 * Use for required timestamp fields like createdAt.
 */
export function toDateRequired(value: string | Date | null | undefined): Date {
  const date = toDate(value);
  if (!date) {
    if (value) {
      console.warn(`[toDateRequired] Falling back to new Date() for invalid value: "${value}"`);
    }
    return new Date();
  }
  return date;
}
