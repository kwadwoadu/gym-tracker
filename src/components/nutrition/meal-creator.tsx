'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customMealsApi } from '@/lib/api-client';

interface MealCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'midMorning', label: 'Mid-Morning' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'dinner', label: 'Dinner' },
];

export function MealCreator({ isOpen, onClose }: MealCreatorProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const createMutation = useMutation({
    mutationFn: customMealsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-meals'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setName('');
    setCategory('');
    setProtein('');
    setCarbs('');
    setFat('');
    setPrepTime('');
    setIngredients([]);
    setNewIngredient('');
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const calculateCalories = () => {
    const p = parseInt(protein) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    return p * 4 + c * 4 + f * 9;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    createMutation.mutate({
      name,
      category,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      calories: calculateCalories(),
      prepTime: prepTime || undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Custom Meal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#A0A0A0]">Meal Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken & Rice Bowl"
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-[#A0A0A0]">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-[#A0A0A0]">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-[#A0A0A0]">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                min="0"
              />
            </div>
          </div>

          {/* Calculated Calories */}
          <div className="bg-[#2A2A2A] rounded-lg p-3 text-center">
            <p className="text-xs text-[#666666]">Calculated Calories</p>
            <p className="text-2xl font-bold text-[#CDFF00]">{calculateCalories()}</p>
          </div>

          {/* Prep Time */}
          <div className="space-y-2">
            <Label htmlFor="prepTime" className="text-[#A0A0A0]">Prep Time</Label>
            <Input
              id="prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="e.g., 15 min"
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Ingredients (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add ingredient"
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleAddIngredient}
                className="border-[#3A3A3A] text-[#CDFF00]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#2A2A2A] rounded text-sm text-white"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(i)}
                      className="text-[#666666] hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#3A3A3A] text-[#A0A0A0]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !category || createMutation.isPending}
              className="flex-1 bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create Meal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
