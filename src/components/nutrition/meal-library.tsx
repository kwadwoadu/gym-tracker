'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, UtensilsCrossed, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { customMealsApi, type CustomMeal } from '@/lib/api-client';
import { MealCreator } from './meal-creator';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  midMorning: 'Mid-Morning',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

const CATEGORY_COLORS: Record<string, string> = {
  breakfast: 'bg-yellow-500/20 text-yellow-500',
  midMorning: 'bg-orange-500/20 text-orange-500',
  lunch: 'bg-green-500/20 text-green-500',
  snack: 'bg-purple-500/20 text-purple-500',
  dinner: 'bg-blue-500/20 text-blue-500',
};

interface MealLibraryProps {
  onSelectMeal?: (meal: CustomMeal) => void;
  selectable?: boolean;
}

export function MealLibrary({ onSelectMeal, selectable = false }: MealLibraryProps) {
  const queryClient = useQueryClient();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<CustomMeal | null>(null);

  const { data: meals, isLoading } = useQuery({
    queryKey: ['custom-meals'],
    queryFn: customMealsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customMealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-meals'] });
      setMealToDelete(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">My Meals</h2>
          {meals && meals.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {meals.length}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreatorOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Meal
        </Button>
      </div>

      {/* Meals Grid */}
      {meals && meals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meals.map((meal) => (
            <Card
              key={meal.id}
              className={cn(
                "bg-card border-border p-4",
                selectable && "cursor-pointer hover:border-primary/50 transition-colors"
              )}
              onClick={() => selectable && onSelectMeal?.(meal)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", CATEGORY_COLORS[meal.category])}>
                      {CATEGORY_LABELS[meal.category] || meal.category}
                    </Badge>
                    {meal.prepTime && (
                      <span className="flex items-center gap-1 text-xs text-dim-foreground">
                        <Clock className="w-3 h-3" />
                        {meal.prepTime}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-white truncate">{meal.name}</h3>

                  {/* Macros */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="text-primary font-medium">{meal.protein}g P</span>
                    <span>{meal.carbs}g C</span>
                    <span>{meal.fat}g F</span>
                    <span className="flex items-center gap-1 text-dim-foreground">
                      <Flame className="w-3 h-3" />
                      {meal.calories}
                    </span>
                  </div>

                  {/* Ingredients */}
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <p className="text-xs text-dim-foreground mt-2 truncate">
                      {(meal.ingredients as string[]).join(', ')}
                    </p>
                  )}
                </div>

                {!selectable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMealToDelete(meal);
                    }}
                    className="text-dim-foreground hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-8 text-center">
          <UtensilsCrossed className="w-12 h-12 text-dim-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No custom meals yet</p>
          <Button
            onClick={() => setIsCreatorOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Meal
          </Button>
        </Card>
      )}

      {/* Creator Modal */}
      <MealCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!mealToDelete} onOpenChange={() => setMealToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Meal</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{mealToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mealToDelete && deleteMutation.mutate(mealToDelete.id)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
