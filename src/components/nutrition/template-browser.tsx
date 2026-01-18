"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UtensilsCrossed,
  Pill,
  Clock,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { MEAL_TEMPLATES, CATEGORY_LABELS, type MealTemplate, type MealCategory } from "@/data/meal-templates";
import { SUPPLEMENT_PROTOCOLS, DAY_TYPE_LABELS, type DayType } from "@/data/supplement-protocol";
import { customMealsApi, customSupplementsApi } from "@/lib/api-client";

export function TemplateBrowser() {
  const [activeTab, setActiveTab] = useState<"meals" | "supplements">("meals");
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>("breakfast");
  const [selectedDayType, setSelectedDayType] = useState<DayType>("rest");
  const queryClient = useQueryClient();

  // Track which templates have been saved
  const [savedMeals, setSavedMeals] = useState<Set<string>>(new Set());
  const [savedSupplements, setSavedSupplements] = useState<Set<string>>(new Set());

  // Mutation to save a meal template
  const saveMealMutation = useMutation({
    mutationFn: (template: MealTemplate) =>
      customMealsApi.create({
        name: template.name,
        category: template.category,
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        calories: template.calories,
        prepTime: template.prepTime,
        ingredients: template.ingredients,
      }),
    onSuccess: (_, template) => {
      setSavedMeals((prev) => new Set(prev).add(template.id));
      queryClient.invalidateQueries({ queryKey: ["custom-meals"] });
    },
  });

  // Mutation to save a supplement template
  const saveSupplementMutation = useMutation({
    mutationFn: (item: { name: string; dose: string; timing: string; notes?: string }) =>
      customSupplementsApi.create(item),
    onSuccess: (_, item) => {
      setSavedSupplements((prev) => new Set(prev).add(item.name));
      queryClient.invalidateQueries({ queryKey: ["custom-supplements"] });
    },
  });

  // Get meals by category
  const filteredMeals = MEAL_TEMPLATES.filter((m) => m.category === selectedCategory);

  // Get supplements by day type
  const supplementBlocks = SUPPLEMENT_PROTOCOLS[selectedDayType];

  const categories: MealCategory[] = ["breakfast", "midMorning", "lunch", "snack", "dinner"];
  const dayTypes: DayType[] = ["rest", "am-training", "pm-training"];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "meals" | "supplements")}>
        <TabsList className="w-full flex overflow-x-auto flex-nowrap bg-[#1A1A1A] p-1 rounded-lg">
          <TabsTrigger
            value="meals"
            className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-[#CDFF00] data-[state=active]:text-[#0A0A0A]"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Meals ({MEAL_TEMPLATES.length})
          </TabsTrigger>
          <TabsTrigger
            value="supplements"
            className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-[#CDFF00] data-[state=active]:text-[#0A0A0A]"
          >
            <Pill className="w-4 h-4" />
            Supplements
          </TabsTrigger>
        </TabsList>

        {/* Meal Templates */}
        <TabsContent value="meals" className="mt-4 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap ${selectedCategory === cat ? "bg-[#CDFF00] text-[#0A0A0A]" : ""}`}
              >
                {CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>

          {/* Meal Cards */}
          <div className="space-y-3">
            {filteredMeals.map((meal) => {
              const isSaved = savedMeals.has(meal.id);
              const isSaving = saveMealMutation.isPending && saveMealMutation.variables?.id === meal.id;

              return (
                <Card key={meal.id} className="p-4 bg-[#1A1A1A] border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{meal.name}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {meal.id}
                        </Badge>
                      </div>

                      {/* Macros */}
                      <div className="flex gap-3 text-sm text-muted-foreground mb-2">
                        <span className="text-[#CDFF00]">{meal.protein}g P</span>
                        <span>{meal.carbs}g C</span>
                        <span>{meal.fat}g F</span>
                        <span className="text-white">{meal.calories} kcal</span>
                      </div>

                      {/* Prep time */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{meal.prepTime}</span>
                      </div>

                      {/* Ingredients */}
                      {meal.ingredients && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {meal.ingredients.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Save Button */}
                    <Button
                      variant={isSaved ? "secondary" : "outline"}
                      size="sm"
                      className="shrink-0"
                      onClick={() => saveMealMutation.mutate(meal)}
                      disabled={isSaved || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSaved ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Supplement Templates */}
        <TabsContent value="supplements" className="mt-4 space-y-4">
          {/* Day Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {dayTypes.map((type) => (
              <Button
                key={type}
                variant={selectedDayType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDayType(type)}
                className={`flex-shrink-0 whitespace-nowrap ${selectedDayType === type ? "bg-[#CDFF00] text-[#0A0A0A]" : ""}`}
              >
                {DAY_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>

          {/* Supplement Blocks */}
          <div className="space-y-4">
            {supplementBlocks.map((block) => (
              <Card key={block.id} className="p-4 bg-[#1A1A1A] border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{block.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{block.label}</h3>
                    <p className="text-xs text-muted-foreground">{block.timeRange}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {block.items.map((item) => {
                    const itemKey = `${block.id}-${item.id}`;
                    const isSaved = savedSupplements.has(item.name);

                    return (
                      <div
                        key={itemKey}
                        className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{item.name}</span>
                            {item.optional && (
                              <Badge variant="outline" className="text-[10px]">
                                Optional
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.dose}</span>
                            {item.notes && <span>- {item.notes}</span>}
                          </div>
                        </div>

                        <Button
                          variant={isSaved ? "secondary" : "ghost"}
                          size="sm"
                          className="shrink-0 h-8 w-8 p-0"
                          onClick={() =>
                            saveSupplementMutation.mutate({
                              name: item.name,
                              dose: item.dose,
                              timing: block.id,
                              notes: item.notes,
                            })
                          }
                          disabled={isSaved}
                        >
                          {isSaved ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
