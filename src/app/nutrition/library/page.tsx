'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtensilsCrossed, Pill, BookOpen } from 'lucide-react';
import { MealLibrary } from '@/components/nutrition/meal-library';
import { SupplementLibrary } from '@/components/nutrition/supplement-library';
import { TemplateBrowser } from '@/components/nutrition/template-browser';

export default function NutritionLibraryPage() {
  const [activeTab, setActiveTab] = useState('meals');

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Nutrition Library</h1>
        <p className="text-sm text-[#666666] mt-1">
          Manage your custom meals and supplements
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[#1A1A1A] p-1 rounded-lg">
          <TabsTrigger
            value="meals"
            className="flex items-center gap-2 data-[state=active]:bg-[#CDFF00] data-[state=active]:text-[#0A0A0A]"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Meals
          </TabsTrigger>
          <TabsTrigger
            value="supplements"
            className="flex items-center gap-2 data-[state=active]:bg-[#CDFF00] data-[state=active]:text-[#0A0A0A]"
          >
            <Pill className="w-4 h-4" />
            Supps
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="flex items-center gap-2 data-[state=active]:bg-[#CDFF00] data-[state=active]:text-[#0A0A0A]"
          >
            <BookOpen className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="mt-4">
          <MealLibrary />
        </TabsContent>

        <TabsContent value="supplements" className="mt-4">
          <SupplementLibrary />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateBrowser />
        </TabsContent>
      </Tabs>
    </div>
  );
}
