# Pattern: Stable Preset Identifiers

> Reliable mapping between preset/seed data IDs and database-generated IDs

## Problem

When seeding preset data (exercises, templates, etc.) into a database that generates its own IDs (CUIDs, UUIDs), you lose the connection between:
- JSON preset ID: `"ex-barbell-bench"`
- Database ID: `"cm4xyz123abc..."`

This breaks references in other preset data (e.g., programs referencing exercises by preset ID).

## Solution

Add a `builtInId` field that stores the original preset identifier:

```prisma
model Exercise {
  id        String  @id @default(cuid())  // Database-generated
  builtInId String? @unique               // Original preset ID
  name      String
  // ... other fields

  @@index([builtInId])
}
```

## Implementation

### 1. Store builtInId During Seeding
```typescript
const created = await prisma.exercise.create({
  data: {
    name: preset.name,
    builtInId: preset.id,  // Store original ID
    // ... other fields
  },
});
```

### 2. Map Using builtInId First, Name as Fallback
```typescript
function buildIdMapping(presets, dbRecords) {
  const mapping = new Map<string, string>();

  for (const preset of presets) {
    // Primary: Match by builtInId (reliable)
    let match = dbRecords.find(r => r.builtInId === preset.id);

    // Fallback: Match by name (for legacy data)
    if (!match) {
      match = dbRecords.find(r => r.name === preset.name);
    }

    if (match) {
      mapping.set(preset.id, match.id);
    }
  }

  return mapping;
}
```

### 3. Backfill Existing Data
For data created before builtInId existed:

```typescript
async function backfillBuiltInIds() {
  const existing = await prisma.exercise.findMany();

  for (const preset of presetData) {
    const match = existing.find(
      e => e.name === preset.name && !e.builtInId
    );

    if (match) {
      await prisma.exercise.update({
        where: { id: match.id },
        data: { builtInId: preset.id },
      });
    }
  }
}
```

## When to Use

- Seeding preset/built-in data that other data references
- Migrating from embedded IDs to database-generated IDs
- Supporting multiple data sources with different ID formats
- Enabling reliable data sync between environments

## Anti-Patterns

❌ **Name-only matching** - Names can change, have typos, or collide
❌ **Storing mapping in memory** - Lost on restart, doesn't scale
❌ **Regenerating IDs on every seed** - Breaks existing references

## Related Patterns

- [Backfill Migration](#backfill-migration-pattern) - Adding fields to existing data
- [Graceful Fallback](#graceful-fallback) - Primary + fallback matching

---

*Pattern extracted from: SetFlow post-migration fix (2026-01-04)*
