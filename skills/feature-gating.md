# Skill: Feature Gating by Email

## Purpose

Gate features to specific users using email whitelist pattern. Useful for beta testing, personal features, or staged rollouts.

## Pattern Files

```
src/lib/feature-flags.ts      # Whitelist check function
src/hooks/use-[feature]-access.ts  # React hook for client-side
src/app/[feature]/layout.tsx  # Route-level gate wrapper
src/app/api/[feature]/route.ts # API-level gate check
```

## Implementation

### 1. Feature Flag Function
```typescript
// src/lib/feature-flags.ts
const FEATURE_ALLOWED_EMAILS = ['user@example.com'];

export function canAccessFeature(email: string | null | undefined): boolean {
  if (!email) return false;
  return FEATURE_ALLOWED_EMAILS.includes(email.toLowerCase());
}
```

### 2. Client Hook
```typescript
// src/hooks/use-feature-access.ts
'use client';
import { useUser } from '@clerk/nextjs';
import { canAccessFeature } from '@/lib/feature-flags';

export function useFeatureAccess() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return {
    hasAccess: canAccessFeature(email),
    isLoading: !isLoaded,
  };
}
```

### 3. Layout Gate (Route Protection)
```typescript
// src/app/[feature]/layout.tsx
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { canAccessFeature } from '@/lib/feature-flags';

export default async function FeatureLayout({ children }) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!canAccessFeature(email)) {
    redirect('/');
  }

  return <>{children}</>;
}
```

### 4. API Route Gate
```typescript
// src/app/api/[feature]/route.ts
import { canAccessFeature } from '@/lib/feature-flags';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessFeature(user.email)) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
  }
  // ... feature logic
}
```

### 5. Conditional UI
```typescript
// In any component
const { hasAccess } = useFeatureAccess();

{hasAccess && (
  <Button onClick={() => router.push('/feature')}>
    Feature Link
  </Button>
)}
```

## Benefits
- Centralized whitelist (single source of truth)
- Works at route, API, and UI levels
- Easy to expand whitelist
- Clean removal when feature goes public

## When to Use
- Beta testing with select users
- Personal/private features
- Staged rollouts
- A/B testing by user
