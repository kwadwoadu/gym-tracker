/**
 * Date conversion utilities for sync API
 *
 * IndexedDB stores dates as ISO strings, but PostgreSQL via Drizzle
 * expects Date objects for timestamp columns.
 */

/**
 * Safely converts a string or Date to a Date object.
 * Returns null if the input is null/undefined or invalid.
 */
export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Converts a string date to Date object, with fallback to current time.
 * Use for required timestamp fields like createdAt.
 */
export function toDateRequired(value: string | Date | null | undefined): Date {
  const date = toDate(value);
  return date || new Date();
}
