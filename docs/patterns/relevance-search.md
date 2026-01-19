# Pattern: Relevance-Based Search

## Problem

Database queries with `contains` return results in arbitrary order. Users expect:
1. Exact matches first
2. Then prefix matches (starts with)
3. Then substring matches (contains)

Prisma/SQL doesn't support relevance scoring natively.

## Solution

Fetch more results than needed, score and sort client-side, then slice.

## Implementation

```typescript
// 1. Fetch extra results (3x limit)
const results = await prisma.table.findMany({
  where: {
    OR: [
      { field1: { contains: query, mode: "insensitive" } },
      { field2: { contains: query, mode: "insensitive" } },
    ],
  },
  take: limit * 3, // Fetch more for sorting
});

// 2. Score function
const q = query.toLowerCase();
const scoreField = (field: string): number => {
  if (field === q) return 0; // Exact match
  if (field.startsWith(q)) return 1; // Prefix match
  return 2; // Contains match
};

// 3. Sort by relevance (immutable)
const sorted = [...results].sort((a, b) => {
  const aScore = Math.min(scoreField(a.field1 || ""), scoreField(a.field2 || ""));
  const bScore = Math.min(scoreField(b.field1 || ""), scoreField(b.field2 || ""));

  if (aScore !== bScore) return aScore - bScore;

  // Tiebreaker: prefer field1 matches, then alphabetical
  return (a.field1 || "").localeCompare(b.field1 || "");
});

// 4. Return requested limit
return sorted.slice(0, limit);
```

## When to Use

- User search (handles, names, usernames)
- Autocomplete dropdowns
- Any search where exact matches should appear first

## Gotchas

- Always use `[...array].sort()` to avoid mutating original
- The 3x multiplier is a tradeoff (memory vs relevance quality)
- For large datasets, consider database-level full-text search instead

## Examples

- SetFlow community user search: `src/app/api/community/users/search/route.ts`
