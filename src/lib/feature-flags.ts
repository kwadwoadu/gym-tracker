// Feature flags for gating features to specific users
// Note: Nutrition is now open to all users (SetFlow v2.0)

/**
 * Check if a user can access the nutrition feature
 * @param email - User's email address (from Clerk)
 * @returns true - Nutrition is now open to all users
 */
export function canAccessNutrition(email: string | null | undefined): boolean {
  // SetFlow v2.0: Nutrition is now open to all users
  return true;
}

/**
 * Check if a Clerk user ID corresponds to an allowed nutrition user
 * This is useful when you only have the Clerk ID
 * @param clerkId - Clerk user ID
 * @param email - User's email from Clerk user object
 * @returns true - Nutrition is now open to all users
 */
export function canAccessNutritionByClerkId(
  clerkId: string | null | undefined,
  email: string | null | undefined
): boolean {
  // SetFlow v2.0: Nutrition is now open to all users
  return true;
}

// Future feature flags can be added here
// Example:
// export function canAccessFeatureX(email: string | null | undefined): boolean {
//   const FEATURE_X_EMAILS = ['user@example.com'];
//   if (!email) return false;
//   return FEATURE_X_EMAILS.includes(email.toLowerCase());
// }
