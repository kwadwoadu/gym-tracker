"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EXERCISE_FORM_DATA } from "@/data/form-cues";
import { FormSheet } from "@/components/form-library/FormSheet";
import { ExerciseFormCard } from "@/components/form-library/ExerciseFormCard";
import { ChipFilter } from "@/components/shared/chip-filter";
import { HEADING, LABEL } from "@/lib/typography";

const MUSCLE_FILTERS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

// Map exercises to filter groups
function getFilterGroup(muscles: { name: string; activation: string }[]): string[] {
  const groups: string[] = [];
  for (const m of muscles) {
    const n = m.name.toLowerCase();
    if (n.includes("chest") || n.includes("pec")) groups.push("Chest");
    if (n.includes("back") || n.includes("lat") || n.includes("rhomb") || n.includes("erector")) groups.push("Back");
    if (n.includes("quad") || n.includes("hamstring") || n.includes("glute") || n.includes("calf")) groups.push("Legs");
    if (n.includes("delt") || n.includes("shoulder")) groups.push("Shoulders");
    if (n.includes("bicep") || n.includes("tricep") || n.includes("forearm")) groups.push("Arms");
    if (n.includes("core") || n.includes("abs")) groups.push("Core");
  }
  return [...new Set(groups)];
}

export default function FormLibraryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const exercises = useMemo(() => {
    return Object.entries(EXERCISE_FORM_DATA).map(([name, data]) => ({
      name: name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      key: name,
      data,
      groups: getFilterGroup(data.muscles),
    }));
  }, []);

  const totalExerciseCount = exercises.length;

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filter !== "All" && !ex.groups.includes(filter)) return false;
      return true;
    });
  }, [exercises, search, filter]);

  // Group by first muscle group
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const ex of filtered) {
      const group = ex.groups[0] || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(ex);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pb-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className={`${HEADING.h3} text-foreground`}>Form Library</h1>
        </div>
        <span className={`${LABEL.caption} text-muted-foreground`}>
          {totalExerciseCount}+ exercises
        </span>
      </header>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-card rounded-xl p-3 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Muscle Filters */}
      <div className="px-4 pb-4">
        <ChipFilter
          options={MUSCLE_FILTERS}
          selected={filter}
          onSelect={setFilter}
        />
      </div>

      {/* Exercise count indicator */}
      <div className="px-4 pb-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} exercise{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Exercise List */}
      <div className="px-4 space-y-6">
        {Object.entries(grouped).map(([group, exs]) => (
          <div key={group}>
            <h3 className={`${LABEL.caption} text-muted-foreground mb-2`}>
              {group}
            </h3>
            <div className="space-y-2">
              {exs.map((ex) => (
                <ExerciseFormCard
                  key={ex.key}
                  name={ex.name}
                  muscleGroups={ex.data.muscles}
                  formCues={ex.data.cues}
                  onClick={() => setSelectedExercise(ex.name)}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No exercises found</p>
          </div>
        )}
      </div>

      {/* Form Sheet */}
      <FormSheet
        exerciseName={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
