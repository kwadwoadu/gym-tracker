'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { customSupplementsApi } from '@/lib/api-client';

interface SupplementCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMING_OPTIONS = [
  { value: 'morning', label: 'Morning (Wake Up)' },
  { value: 'pre-workout', label: 'Pre-Workout' },
  { value: 'post-workout', label: 'Post-Workout' },
  { value: 'evening', label: 'Evening' },
  { value: 'with-meal', label: 'With Meal' },
  { value: 'before-bed', label: 'Before Bed' },
];

export function SupplementCreator({ isOpen, onClose }: SupplementCreatorProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [timing, setTiming] = useState('');
  const [notes, setNotes] = useState('');

  const createMutation = useMutation({
    mutationFn: customSupplementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-supplements'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setName('');
    setDose('');
    setTiming('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dose || !timing) return;

    createMutation.mutate({
      name,
      dose,
      timing,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Supplement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#A0A0A0]">Supplement Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Creatine Monohydrate"
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              required
            />
          </div>

          {/* Dose */}
          <div className="space-y-2">
            <Label htmlFor="dose" className="text-[#A0A0A0]">Dose *</Label>
            <Input
              id="dose"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g., 5g or 1 scoop"
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
              required
            />
          </div>

          {/* Timing */}
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Timing *</Label>
            <Select value={timing} onValueChange={setTiming} required>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="When to take" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                {TIMING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#A0A0A0]">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Take with food for better absorption"
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white min-h-[80px]"
            />
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
              disabled={!name || !dose || !timing || createMutation.isPending}
              className="flex-1 bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add Supplement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
