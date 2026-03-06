'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Pill, Clock } from 'lucide-react';
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
import { customSupplementsApi, type CustomSupplement } from '@/lib/api-client';
import { SupplementCreator } from './supplement-creator';
import { cn } from '@/lib/utils';

const TIMING_LABELS: Record<string, string> = {
  morning: 'Morning',
  'pre-workout': 'Pre-Workout',
  'post-workout': 'Post-Workout',
  evening: 'Evening',
  'with-meal': 'With Meal',
  'before-bed': 'Before Bed',
};

const TIMING_COLORS: Record<string, string> = {
  morning: 'bg-yellow-500/20 text-yellow-500',
  'pre-workout': 'bg-orange-500/20 text-orange-500',
  'post-workout': 'bg-green-500/20 text-green-500',
  evening: 'bg-purple-500/20 text-purple-500',
  'with-meal': 'bg-blue-500/20 text-blue-500',
  'before-bed': 'bg-indigo-500/20 text-indigo-500',
};

interface SupplementLibraryProps {
  onSelectSupplement?: (supplement: CustomSupplement) => void;
  selectable?: boolean;
}

export function SupplementLibrary({ onSelectSupplement, selectable = false }: SupplementLibraryProps) {
  const queryClient = useQueryClient();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [supplementToDelete, setSupplementToDelete] = useState<CustomSupplement | null>(null);

  const { data: supplements, isLoading } = useQuery({
    queryKey: ['custom-supplements'],
    queryFn: customSupplementsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customSupplementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-supplements'] });
      setSupplementToDelete(null);
    },
  });

  // Group supplements by timing
  const groupedSupplements = supplements?.reduce((acc, supp) => {
    const timing = supp.timing;
    if (!acc[timing]) acc[timing] = [];
    acc[timing].push(supp);
    return acc;
  }, {} as Record<string, CustomSupplement[]>);

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
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">My Supplements</h2>
          {supplements && supplements.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {supplements.length}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreatorOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Supplement
        </Button>
      </div>

      {/* Supplements by Timing */}
      {groupedSupplements && Object.keys(groupedSupplements).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedSupplements).map(([timing, supps]) => (
            <div key={timing}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-dim-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  {TIMING_LABELS[timing] || timing}
                </h3>
              </div>
              <div className="space-y-2">
                {supps.map((supp) => (
                  <Card
                    key={supp.id}
                    className={cn(
                      "bg-card border-border p-3",
                      selectable && "cursor-pointer hover:border-primary/50 transition-colors"
                    )}
                    onClick={() => selectable && onSelectSupplement?.(supp)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-white truncate">{supp.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-primary">{supp.dose}</span>
                            <Badge className={cn("text-xs", TIMING_COLORS[timing])}>
                              {TIMING_LABELS[timing] || timing}
                            </Badge>
                          </div>
                          {supp.notes && (
                            <p className="text-xs text-dim-foreground mt-1 truncate">{supp.notes}</p>
                          )}
                        </div>
                      </div>

                      {!selectable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSupplementToDelete(supp);
                          }}
                          className="text-dim-foreground hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-8 text-center">
          <Pill className="w-12 h-12 text-dim-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No supplements yet</p>
          <Button
            onClick={() => setIsCreatorOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Supplement
          </Button>
        </Card>
      )}

      {/* Creator Modal */}
      <SupplementCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!supplementToDelete} onOpenChange={() => setSupplementToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Supplement</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{supplementToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => supplementToDelete && deleteMutation.mutate(supplementToDelete.id)}
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
