/**
 * Prompt templates for AI program generation
 */

import type { OnboardingProfile } from "@/lib/api-client";

interface ExerciseRef {
  id: string;
  name: string;
  equipment: string;
  muscleGroups: string[];
}

interface ProgramPromptInput {
  profile: OnboardingProfile;
  exercises: ExerciseRef[];
  preferences?: {
    sessionMinutes?: number;
    focusArea?: string;
    mesocycleWeeks?: number;
  };
  historySummary?: string;
}

export function buildSystemPrompt(): string {
  return `You are a certified strength and conditioning specialist (CSCS) with 15+ years of experience programming for all levels. You design evidence-based training programs using periodization principles.

RULES:
- Output ONLY valid JSON matching the schema below. No markdown, no explanations outside JSON.
- Use ONLY exercise IDs from the provided exercise list. Never invent exercise IDs.
- Label supersets alphabetically: "A", "B", "C", "D", etc.
- Each superset should have 1-3 exercises (1 = straight set, 2-3 = superset/triset).
- Tempo format: "T:XYZW" where X=eccentric seconds, Y=bottom pause, Z=concentric (A=controlled, X=explosive), W=top pause. Example: "T:30A1"
- Rest between sets of the same superset: 60-90s. Rest between different supersets: 90-180s.
- Maximum 25 working sets per session (excluding warmup/finisher).
- For injuries, substitute with safe alternatives - never include movements that aggravate the injury.
- Progression strategy must match experience level: linear (beginner), undulating (intermediate), block (advanced).

OUTPUT SCHEMA:
{
  "name": "string - program name",
  "description": "string - 1-2 sentence program summary",
  "durationWeeks": "number (4-12)",
  "daysPerWeek": "number (2-6)",
  "days": [
    {
      "name": "string - day name (e.g. 'Upper Push')",
      "supersets": [
        {
          "label": "string - 'A', 'B', etc.",
          "exercises": [
            {
              "exerciseId": "string - must be from exercise list",
              "sets": "number (1-6)",
              "reps": "string - e.g. '8-10' or '12'",
              "tempo": "string - optional tempo notation",
              "restSeconds": "number (30-300)",
              "notes": "string - optional coaching cue"
            }
          ]
        }
      ],
      "warmup": [/* optional warmup exercises, same format */],
      "finisher": [/* optional finisher exercises, same format */]
    }
  ],
  "deloadWeek": "number - optional, which week is deload",
  "progressionStrategy": "string - how to progress week to week"
}`;
}

export function buildUserPrompt(input: ProgramPromptInput): string {
  const { profile, exercises, preferences, historySummary } = input;

  const exerciseList = exercises
    .map((e) => `- ${e.id}: ${e.name} [${e.equipment}] (${e.muscleGroups.join(", ")})`)
    .join("\n");

  let prompt = `Generate a training program for this athlete:

PROFILE:
- Goals: ${profile.goals?.join(", ") || "general fitness"}
- Experience: ${profile.experienceLevel || "intermediate"}
- Training days/week: ${profile.trainingDaysPerWeek || 3}
- Equipment: ${profile.equipment || "full gym"}
- Injuries: ${profile.injuries?.length ? profile.injuries.join(", ") : "none"}`;

  if (profile.weightKg) {
    prompt += `\n- Body weight: ${profile.weightKg}kg`;
  }

  if (preferences) {
    if (preferences.sessionMinutes) {
      prompt += `\n- Target session length: ${preferences.sessionMinutes} minutes`;
    }
    if (preferences.focusArea) {
      prompt += `\n- Focus area: ${preferences.focusArea}`;
    }
    if (preferences.mesocycleWeeks) {
      prompt += `\n- Mesocycle length: ${preferences.mesocycleWeeks} weeks`;
    }
  }

  if (historySummary) {
    prompt += `\n\nTRAINING HISTORY:\n${historySummary}`;
  }

  prompt += `\n\nAVAILABLE EXERCISES:\n${exerciseList}`;
  prompt += `\n\nGenerate the program JSON now.`;

  return prompt;
}
