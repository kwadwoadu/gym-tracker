# Local-First Data Model Pattern

## When to Use

- PWA with offline-first requirements
- Apps that must work without network
- Data-heavy apps with complex relationships
- When user owns their data locally

## Core Principle

IndexedDB as single source of truth. No backend required for core functionality. Use Dexie.js for cleaner API over raw IndexedDB.

## Implementation

### Database Setup with Dexie

```typescript
// CORRECT: Typed database with EntityTable
import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("GymTrackerDB") as Dexie & {
  exercises: EntityTable<Exercise, "id">;
  programs: EntityTable<Program, "id">;
  workoutLogs: EntityTable<WorkoutLog, "id">;
};

db.version(1).stores({
  exercises: "id, name, *muscleGroups, equipment",
  programs: "id, name, isActive",
  workoutLogs: "id, date, programId, dayId, isComplete",
});
```

### Schema Versioning

```typescript
// CORRECT: Increment version when adding tables/indexes
db.version(1).stores({ exercises: "id, name" });
db.version(2).stores({
  exercises: "id, name",
  onboardingProfiles: "id"  // New table
});
db.version(3).stores({
  exercises: "id, name",
  onboardingProfiles: "id",
  achievements: "id, achievementId, unlockedAt"  // Another new table
});

// WRONG: Modifying existing version
db.version(1).stores({
  exercises: "id, name",
  onboardingProfiles: "id"  // Breaking change!
});
```

### Type-Safe Interfaces

```typescript
// CORRECT: Full interface definitions
export interface Exercise {
  id: string;
  name: string;
  videoUrl?: string;
  muscleGroups: string[];
  equipment: string;
  isCustom: boolean;
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  date: string;  // ISO date
  programId: string;
  dayId: string;
  sets: SetLog[];  // Embedded array, not separate table
  isComplete: boolean;
}
```

### UUID Generation

```typescript
// CORRECT: Use crypto.randomUUID()
export function generateId(): string {
  return crypto.randomUUID();
}

// WRONG: Auto-increment (breaks sync, not portable)
// WRONG: Custom UUID implementation
```

### Query Patterns

```typescript
// CORRECT: Use Dexie query methods
const workouts = await db.workoutLogs
  .where("dayId").equals(dayId)
  .reverse()
  .sortBy("date");

const activeProgram = await db.programs
  .where("isActive").equals(1)
  .first();

// WRONG: Fetch all then filter in JS
const all = await db.workoutLogs.toArray();
const filtered = all.filter(w => w.dayId === dayId);
```

### Singleton Settings Pattern

```typescript
// CORRECT: Single row for settings with default fallback
const DEFAULT_SETTINGS: UserSettings = {
  id: "user-settings",
  weightUnit: "kg",
  soundEnabled: true,
};

export async function getUserSettings(): Promise<UserSettings> {
  const settings = await db.userSettings.get("user-settings");
  return settings || DEFAULT_SETTINGS;
}

export async function updateUserSettings(updates: Partial<UserSettings>) {
  const current = await getUserSettings();
  await db.userSettings.put({ ...current, ...updates, id: "user-settings" });
}
```

### Embedded vs Separate Tables

```typescript
// CORRECT: Embed child entities when always accessed together
interface WorkoutLog {
  id: string;
  sets: SetLog[];  // Embedded - sets always accessed with workout
}

// CORRECT: Separate table when accessed independently
// exercises table - exercises queried independently of workouts
```

## Files Using This Pattern

- `/lib/db.ts` - Full database schema and operations
- `/lib/seed.ts` - Initial data seeding
- All components via `import db from "@/lib/db"`

## Gotchas

1. **Always await** - IndexedDB is async, forgetting await causes silent bugs
2. **Version bumps** - Schema changes require new version number
3. **Multi-value indexes** - Use `*field` for array fields (e.g., `*muscleGroups`)
4. **Boolean indexes** - Store as 1/0, not true/false for reliable queries
5. **No JOIN** - Denormalize or query separately and merge in JS
6. **Storage limits** - IndexedDB has browser-specific limits (~50MB-unlimited)

## Testing

1. Test with IndexedDB cleared (DevTools > Application > Clear)
2. Test version migrations (increment version, verify data persists)
3. Test offline (DevTools > Network > Offline)
4. Test large datasets (1000+ records)
5. Test concurrent writes (multiple tabs)
