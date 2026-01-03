# PWA Offline Sync Pattern

## When to Use

- Multi-device data synchronization
- Offline-first PWA with optional cloud backup
- Export/import user data across devices

## Core Principle

Local-first with cloud as enhancement, not requirement. All data lives in IndexedDB (Dexie.js). Cloud sync is optional - app MUST work fully offline.

## Implementation

### Device ID Tracking

```typescript
// CORRECT: Unique device ID persisted in localStorage
function getDeviceId(): string {
  const key = "setflow-device-id";
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}
```

### Sync Timestamp Tracking

```typescript
// Track when last sync occurred
function getLastSyncedAt(): string | null {
  return localStorage.getItem("setflow-last-synced-at");
}

function setLastSyncedAt(timestamp: string): void {
  localStorage.setItem("setflow-last-synced-at", timestamp);
}
```

### Full Sync Flow (Pull-Then-Push)

```typescript
// CORRECT: Pull first, then push
export async function fullSync(userEmail?: string) {
  // Pull first to get changes from other devices
  const pullResult = await pullFromCloud();

  // Always attempt push, even if pull fails
  const pushResult = await pushToCloud(userEmail);

  return {
    success: pullResult.success && pushResult.success,
    details: { pull: pullResult.success, push: pushResult.success }
  };
}
```

### Export All Data

```typescript
// CORRECT: Export all tables in parallel
async function exportLocalData() {
  const [exercises, programs, workoutLogs, ...rest] = await Promise.all([
    db.exercises.toArray(),
    db.programs.toArray(),
    db.workoutLogs.toArray(),
    // ... other tables
  ]);
  return { exercises, programs, workoutLogs, ...rest };
}

// WRONG: Sequential queries (slow)
async function exportLocalData() {
  const exercises = await db.exercises.toArray();
  const programs = await db.programs.toArray(); // Waits for exercises
  // ...
}
```

### Import with Cloud-Wins Strategy

```typescript
// CORRECT: Cloud data overwrites local on conflict
async function importCloudData(data) {
  for (const exercise of data.exercises) {
    await db.exercises.put(exercise); // put() upserts
  }
}

// WRONG: Checking existence first (slow, race conditions)
async function importCloudData(data) {
  for (const exercise of data.exercises) {
    const exists = await db.exercises.get(exercise.id);
    if (!exists) await db.exercises.add(exercise);
  }
}
```

## Files Using This Pattern

- `/lib/sync.ts` - Main sync implementation
- `/lib/db.ts` - Data export helpers
- `/app/api/sync/route.ts` - Server-side sync endpoint

## Gotchas

1. **Never block render** - Sync in background, show UI immediately
2. **Always handle offline** - Sync failures should be silent, not errors
3. **Device ID is permanent** - Don't regenerate on each session
4. **Pull before push** - Prevents overwriting changes from other devices
5. **Include credentials** - `credentials: "include"` for authenticated endpoints

## Testing

1. Export data on Device A
2. Import on Device B
3. Make changes on Device B
4. Sync back to Device A
5. Verify changes appear on both
6. Test with airplane mode enabled
