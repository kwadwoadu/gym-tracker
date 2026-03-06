'use client';

import { useNutritionAccess } from '@/hooks/use-nutrition-access';
import { redirect } from 'next/navigation';
import { NutritionNav } from '@/components/nutrition/nutrition-nav';

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasAccess, isLoading } = useNutritionAccess();

  // Show loading state while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect if no access
  if (!hasAccess) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <NutritionNav />
      <main className="container mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}
