# Skill: Prisma JSON Fields with TypeScript

## Purpose

Safely work with Prisma's `Json` type while maintaining TypeScript type safety. Prisma's JSON fields return `JsonValue` which needs proper casting.

## The Problem

Prisma JSON fields have type `Prisma.JsonValue` which is:
```typescript
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
```

But your application has specific types:
```typescript
interface MealSlots {
  breakfast: string | null;
  lunch: string | null;
  // ...
}
```

Direct casting fails: `plan.slots as MealSlots` - TypeScript error!

## Solution: Double Cast Through Unknown

```typescript
// CORRECT: Cast through unknown first
const typedSlots = plan.slots as unknown as MealSlots;

// WRONG: Direct cast fails
const typedSlots = plan.slots as MealSlots; // Type error!
```

## Pattern in API Routes

```typescript
// GET - Reading JSON fields
export async function GET() {
  const plan = await prisma.mealPlan.findUnique({ where: { ... } });

  return NextResponse.json({
    id: plan.id,
    date: plan.date,
    slots: plan.slots as unknown as MealSlots, // Safe cast
  });
}

// PUT - Writing JSON fields
export async function PUT(request: Request) {
  const { slots } = await request.json();

  const plan = await prisma.mealPlan.upsert({
    update: {
      slots: slots ?? {}, // Prisma accepts plain objects
    },
    create: {
      slots: slots ?? {
        breakfast: null,
        lunch: null,
      },
    },
  });

  return NextResponse.json({
    slots: plan.slots as unknown as MealSlots,
  });
}
```

## Null Handling

JSON fields can be `Prisma.DbNull` or `Prisma.JsonNull`. Handle with nullish coalescing:

```typescript
// When copying JSON from one record to another
const copy = await prisma.record.create({
  data: {
    jsonField: sourceRecord.jsonField ?? {}, // Fallback if null
  },
});
```

## Type Definition Pattern

Define your types in a shared location:

```typescript
// src/data/types.ts or with your templates
export interface MealSlots {
  breakfast: string | null;
  midMorning: string | null;
  lunch: string | null;
  snack: string | null;
  dinner: string | null;
}

export type SlotKey = keyof MealSlots;
```

## API Client Types

```typescript
// src/lib/api-client.ts
export interface MealPlan {
  id: string;
  date: string;
  slots: MealSlots;
}

// When fetching, the cast happens in the API route
// so client receives properly typed data
```

## When to Use
- Any Prisma model with `Json` type fields
- Flexible schema data (settings, preferences, nested objects)
- Storing arrays or objects that don't warrant separate tables

## Anti-Patterns
- Don't store relational data in JSON (use proper relations)
- Don't skip the `unknown` intermediate cast
- Don't forget null handling with `?? {}`
