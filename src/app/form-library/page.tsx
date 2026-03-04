"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EXERCISE_FORM_DATA } from "@/data/form-cues";
import { FormSheet } from "@/components/form-library/FormSheet";

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
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pb-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white">Form Library</h1>
      </header>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Muscle Filters */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MUSCLE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                filter === f
                  ? "bg-[#CDFF00] text-black"
                  : "bg-[#1A1A1A] text-white/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="px-4 space-y-6">
        {Object.entries(grouped).map(([group, exs]) => (
          <div key={group}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
              {group}
            </h3>
            <div className="space-y-2">
              {exs.map((ex) => (
                <Card
                  key={ex.key}
                  className="bg-[#1A1A1A] border-[#2A2A2A] p-4 active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => setSelectedExercise(ex.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {ex.name}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {ex.data.cues.length} cues - {ex.data.muscles
                          .filter((m) => m.activation === "primary")
                          .map((m) => m.name)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-white/30" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">No exercises found</p>
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
