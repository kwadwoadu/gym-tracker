import { getClerkId } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { NutritionNav } from '@/components/nutrition/nutrition-nav';

export default async function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string | null = null;
  try {
    userId = await getClerkId();
  } catch {
    redirect('/');
  }

  if (!userId) {
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
