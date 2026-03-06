"use client";

import { Card } from "@/components/ui/card";

interface MuscleInfo {
  name: string;
  activation: "primary" | "secondary";
}

interface FormCue {
  text: string;
  phase: string;
}

interface ExerciseFormCardProps {
  name: string;
  muscleGroups: MuscleInfo[];
  formCues: FormCue[];
  onClick?: () => void;
}

export function ExerciseFormCard({
  name,
  muscleGroups,
  formCues,
  onClick,
}: ExerciseFormCardProps) {
  const primaryMuscles = muscleGroups.filter((m) => m.activation === "primary");
  const secondaryMuscles = muscleGroups.filter((m) => m.activation === "secondary");

  return (
    <Card
      className="bg-card rounded-xl p-4 border-border active:scale-[0.98] transition-transform cursor-pointer"
      onClick={onClick}
    >
      {/* Exercise name */}
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>

      {/* Muscle activation badges */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {primaryMuscles.map((m) => (
          <span
            key={m.name}
            className="text-[11px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full"
          >
            {m.name}
          </span>
        ))}
        {secondaryMuscles.map((m) => (
          <span
            key={m.name}
            className="text-[11px] font-medium bg-gym-blue/20 text-gym-blue px-2 py-0.5 rounded-full"
          >
            {m.name}
          </span>
        ))}
      </div>

      {/* Inline numbered form cues */}
      {formCues.length > 0 && (
        <div className="mt-3 space-y-1">
          {formCues.map((cue, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground/60 font-medium">{i + 1}.</span>{" "}
              {cue.text}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
