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
  Target,
  Flame,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { challengesApi } from "@/lib/api-client";
import type { ChallengeType } from "@/lib/api-client";

const challengeTypes: { value: ChallengeType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "streak", label: "Streak", icon: <Flame className="w-5 h-5" />, description: "Workout for consecutive days" },
  { value: "workouts", label: "Workouts", icon: <Calendar className="w-5 h-5" />, description: "Complete a number of workouts" },
  { value: "volume", label: "Volume", icon: <Dumbbell className="w-5 h-5" />, description: "Lift a total weight volume" },
  { value: "consistency", label: "Consistency", icon: <Target className="w-5 h-5" />, description: "Hit workout targets consistently" },
];

export default function CreateChallengePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChallengeType>("workouts");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  // Default end date to 30 days from start
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    const start = new Date(date);
    start.setDate(start.getDate() + 30);
    setEndDate(start.toISOString().split("T")[0]);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      challengesApi.create({
        name,
        description: description || undefined,
        type,
        target: parseInt(target, 10),
        startDate,
        endDate,
      }),
    onSuccess: (challenge) => {
      router.push(`/community/challenges/${challenge.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target || !startDate || !endDate) return;
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
          <h1 className="text-xl font-bold">Create Challenge</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Challenge Name</Label>
          <Input
            id="name"
            placeholder="e.g., 30-Day Workout Challenge"
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
            placeholder="Describe the challenge rules"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Type */}
        <div className="space-y-3">
          <Label>Challenge Type</Label>
          <RadioGroup value={type} onValueChange={(v) => setType(v as ChallengeType)}>
            <div className="grid grid-cols-1 gap-3">
              {challengeTypes.map((t) => (
                <Card
                  key={t.value}
                  className={`p-4 cursor-pointer transition-colors ${
                    type === t.value ? "border-[#CDFF00] bg-[#CDFF00]/10" : "hover:bg-white/5"
                  }`}
                  onClick={() => setType(t.value)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={t.value} id={t.value} />
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {t.icon}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={t.value} className="cursor-pointer font-medium">
                        {t.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Target */}
        <div className="space-y-2">
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            type="number"
            placeholder={type === "volume" ? "e.g., 50000 (kg)" : "e.g., 30"}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            min={1}
          />
          <p className="text-xs text-muted-foreground">
            {type === "streak" && "Number of consecutive workout days"}
            {type === "workouts" && "Number of workouts to complete"}
            {type === "volume" && "Total weight in kg to lift"}
            {type === "consistency" && "Number of targets to hit"}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
          <Button
            type="submit"
            size="lg"
            className="w-full h-14"
            disabled={!name.trim() || !target || !startDate || !endDate || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Challenge"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
