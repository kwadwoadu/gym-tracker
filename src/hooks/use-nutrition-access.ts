'use client';

import { useUser } from '@clerk/nextjs';
import { canAccessNutrition } from '@/lib/feature-flags';

/**
 * Hook to check if the current user has access to nutrition features
 * Returns loading state while Clerk is initializing
 */
export function useNutritionAccess() {
  const { user, isLoaded } = useUser();

  // While loading, we don't know yet
  if (!isLoaded) {
    return {
      hasAccess: false,
      isLoading: true,
      email: null,
    };
  }

  // Not signed in
  if (!user) {
    return {
      hasAccess: false,
      isLoading: false,
      email: null,
    };
  }

  // Get primary email
  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? null;

  return {
    hasAccess: canAccessNutrition(primaryEmail),
    isLoading: false,
    email: primaryEmail,
  };
}
