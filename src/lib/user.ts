/**
 * User helpers - re-exports for convenience
 */
import { getCurrentUser } from "./auth-helpers";

// Alias for community API routes
export const getOrCreateUser = getCurrentUser;
