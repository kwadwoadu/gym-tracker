"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Loader2,
  Users,
  Target,
  Dumbbell,
  Heart,
  Zap,
} from "lucide-react";
import { groupsApi } from "@/lib/api-client";
import type { GroupGoalType } from "@/lib/api-client";

const goalTypes: { value: GroupGoalType; label: string; icon: React.ReactNode }[] = [
  { value: "strength", label: "Strength", icon: <Dumbbell className="w-5 h-5" /> },
  { value: "weight_loss", label: "Weight Loss", icon: <Heart className="w-5 h-5" /> },
  { value: "muscle_building", label: "Muscle Building", icon: <Target className="w-5 h-5" /> },
  { value: "endurance", label: "Endurance", icon: <Zap className="w-5 h-5" /> },
  { value: "general", label: "General", icon: <Users className="w-5 h-5" /> },
];

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GroupGoalType>("general");

  const createMutation = useMutation({
    mutationFn: () =>
      groupsApi.create({
        name,
        description: description || undefined,
        goalType,
        isPublic: true,
      }),
    onSuccess: (group) => {
      router.push(`/community/groups/${group.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Create Group</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Group Name</Label>
          <Input
            id="name"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe what your group is about"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Goal Type */}
        <div className="space-y-3">
          <Label>Goal Type</Label>
          <RadioGroup value={goalType} onValueChange={(v) => setGoalType(v as GroupGoalType)}>
            <div className="grid grid-cols-1 gap-3">
              {goalTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`p-4 cursor-pointer transition-colors ${
                    goalType === type.value ? "border-[#CDFF00] bg-[#CDFF00]/10" : "hover:bg-white/5"
                  }`}
                  onClick={() => setGoalType(type.value)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {type.icon}
                    </div>
                    <Label htmlFor={type.value} className="flex-1 cursor-pointer font-medium">
                      {type.label}
                    </Label>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
          <Button
            type="submit"
            size="lg"
            className="w-full h-14"
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
