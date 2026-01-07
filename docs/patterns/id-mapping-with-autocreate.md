# Pattern: ID Mapping with Auto-Create

## Purpose

When migrating data between systems with different ID schemes, ensure all required entities exist by creating missing ones automatically rather than silently failing.

## Problem

Static data (JSON presets) references entities by human-readable IDs (e.g., `"ex-barbell-bench"`). The database uses auto-generated CUIDs. If the mapping fails, the original string ID persists and lookups fail silently in the UI.

## Solution

Three-phase mapping approach:

```typescript
async function buildIdMapping(): Promise<Map<string, string>> {
  const idMapping = new Map<string, string>();
  const existingEntities = await api.list();

  // Phase 1: Try to map by canonical ID (most reliable)
  for (const preset of presetData) {
    let existing = existingEntities.find(e => e.builtInId === preset.id);
    if (existing) {
      idMapping.set(preset.id, existing.id);
      continue;
    }

    // Phase 2: Fallback to name matching (legacy support)
    existing = existingEntities.find(e => e.name === preset.name);
    if (existing) {
      idMapping.set(preset.id, existing.id);
      continue;
    }

    // Phase 3: Create missing entity (auto-create)
    try {
      const created = await api.create({
        ...preset,
        builtInId: preset.id, // Store original ID for future mapping
      });
      idMapping.set(preset.id, created.id);
    } catch (error) {
      console.error(`Failed to create: ${preset.name}`, error);
      // Entity will remain unmapped - log for debugging
    }
  }

  return idMapping;
}
```

## Key Principles

1. **Store canonical ID**: Always persist the original preset ID (e.g., `builtInId`) for reliable future mapping
2. **Multiple fallbacks**: Try canonical ID first, then name matching, then auto-create
3. **Never silently fail**: Log unmapped entities clearly so issues are visible
4. **Validate before use**: After mapping, verify all required IDs are mapped before proceeding

## Validation Pattern

```typescript
const requiredIds = getRequiredIds(preset);
const unmapped = requiredIds.filter(id => !idMapping.has(id));
if (unmapped.length > 0) {
  console.error(`CRITICAL: ${unmapped.length} IDs could not be mapped`);
  unmapped.forEach(id => console.error(`  - ${id}`));
}
```

## Anti-Pattern: Silent Fallback

```typescript
// BAD: Silent fallback preserves invalid IDs
exerciseId: idMapping.get(preset.exerciseId) || preset.exerciseId
```

This causes the original string ID to persist if mapping fails, leading to silent UI failures where lookups return undefined.

## When to Use

- Data migration between systems
- Preset/template installation flows
- Import/export functionality
- Any code that maps between ID schemes

## SetFlow Implementation

See `/src/lib/programs.ts` - `buildExerciseIdMapping()` function.

---

*Pattern documented: January 7, 2026*
