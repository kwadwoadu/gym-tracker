'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Hook to check if the current user has access to nutrition features
 * SetFlow v2.0: Nutrition is now open to all users
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

  // SetFlow v2.0: Nutrition is now open to all users
  return {
    hasAccess: true,
    isLoading: false,
    email: primaryEmail,
  };
}
