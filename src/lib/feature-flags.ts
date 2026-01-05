// Feature flags for gating features to specific users
// Currently used for nutrition tracking (k@adu.dk only)

// Email whitelist for nutrition feature
const NUTRITION_ALLOWED_EMAILS = ['k@adu.dk'];

/**
 * Check if a user can access the nutrition feature
 * @param email - User's email address (from Clerk)
 * @returns true if the user has access to nutrition features
 */
export function canAccessNutrition(email: string | null | undefined): boolean {
  if (!email) return false;
  return NUTRITION_ALLOWED_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if a Clerk user ID corresponds to an allowed nutrition user
 * This is useful when you only have the Clerk ID
 * @param clerkId - Clerk user ID
 * @param email - User's email from Clerk user object
 * @returns true if the user has access to nutrition features
 */
export function canAccessNutritionByClerkId(
  clerkId: string | null | undefined,
  email: string | null | undefined
): boolean {
  // We check by email, not by Clerk ID
  return canAccessNutrition(email);
}

// Future feature flags can be added here
// Example:
// export function canAccessFeatureX(email: string | null | undefined): boolean {
//   const FEATURE_X_EMAILS = ['user@example.com'];
//   if (!email) return false;
//   return FEATURE_X_EMAILS.includes(email.toLowerCase());
// }
