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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-pulse text-[#A0A0A0]">Loading...</div>
      </div>
    );
  }

  // Redirect if no access
  if (!hasAccess) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <NutritionNav />
      <main className="container mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}
