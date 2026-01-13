# PRD: Program Archiving

> **Status:** Complete
> **Owner:** Kwadwo
> **Created:** 2026-01-13
> **Roadmap Phase:** Phase 2 - Program Management

---

## 1. Problem

**What problem are we solving?**

Currently, deleting a program in SetFlow triggers a cascade delete that permanently removes:
- The program itself
- All training days
- All workout logs linked to that program
- All personal records from those workout logs

This is destructive and unrecoverable. Users who want to switch programs lose their entire workout history.

**Who has this problem?**

Any user who wants to:
- Try a new training program without losing progress
- Keep historical programs for reference
- Return to a previous program after trying something new

**What happens if we don't solve it?**

Users lose irreplaceable workout data when switching programs, which undermines the core value proposition of a workout tracking app.

---

## 2. Solution

Implement soft-delete (archiving) for programs instead of hard delete. Archived programs:
- Are hidden from the active program list
- Preserve all linked workout history
- Can be restored to active status
- Can be cloned to create a fresh copy

The cascade delete on WorkoutLog should be changed to SET NULL so workout history survives program deletion.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Zero data loss on program switch | 100% | Workout logs preserved after archive |
| Archive/restore works correctly | 100% | E2E test passes |
| User can view archived programs | Yes | UI shows archived section |

---

## 4. Requirements

### Must Have
- [ ] Soft-delete via `archivedAt` timestamp field
- [ ] API endpoint changes DELETE to archive (not hard delete)
- [ ] Archived programs excluded from default queries
- [ ] Workout history preserved when program archived
- [ ] Ability to restore archived program to active
- [ ] Confirmation modal before archiving

### Should Have
- [ ] Clone archived program (create fresh copy)
- [ ] View-only mode for archived programs
- [ ] Show workout count on archived program card

### Won't Have (this version)
- Full program versioning/history
- Automatic archiving of old programs
- Archived program comparison

---

## 5. User Flow

### Archive Flow
1. User navigates to program settings or program list
2. User clicks "Archive" button on a program
3. Confirmation modal: "Archive this program? Your workout history will be preserved."
4. User confirms
5. Program moves to archived section
6. If it was the active program, user prompted to select/create new one

### Restore Flow
1. User views archived programs section
2. User clicks "Restore" on an archived program
3. Program becomes available (not active)
4. User can then activate it if desired

### Clone Flow
1. User views an archived program
2. User clicks "Clone as New"
3. New program created with same structure
4. User can edit and activate the clone

---

## 6. Design

### UI Components

**Archive Button**
- Location: Program settings menu, program card actions
- Icon: Archive box icon
- Color: Warning (amber) to indicate caution

**Archived Programs Section**
- Collapsed by default in program list
- Header: "Archived Programs (X)" with expand toggle
- Cards show: name, days/week, workout count, archived date
- Actions: Restore, Clone, View, Delete Permanently

**Confirmation Modal**
- Title: "Archive Program?"
- Body: "This program will be moved to your archive. All workout history will be preserved. You can restore it anytime."
- Actions: "Cancel" (secondary), "Archive" (primary)

### Visual States
- Active program: Full color, prominent
- Inactive programs: Normal color
- Archived programs: Muted/faded, archive icon overlay

---

## 7. Technical Spec

### Schema Changes

```prisma
model Program {
  id          String    @id @default(cuid())
  name        String
  description String?
  isActive    Boolean   @default(false)
  archivedAt  DateTime?                    // NEW: Null = not archived
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  trainingDays TrainingDay[]
  workoutLogs  WorkoutLog[]

  @@index([userId])
  @@index([isActive])
  @@index([archivedAt])                    // NEW: For filtering
}

model WorkoutLog {
  // ... existing fields ...

  programId String?                        // CHANGE: Now nullable
  program   Program? @relation(...)        // CHANGE: Optional relation

  // Add denormalized program name for orphaned logs
  programName String?                      // NEW: Preserved when program deleted
}
```

### API Changes

**Archive Program** `PUT /api/programs/[id]/archive`
```typescript
// Request
{ action: "archive" | "restore" }

// Response
{ success: true, program: Program }
```

**List Programs** `GET /api/programs`
```typescript
// Query params
?includeArchived=true  // Include archived in response
?archivedOnly=true     // Only return archived

// Response includes archivedAt field
```

**Clone Program** `POST /api/programs/[id]/clone`
```typescript
// Request
{ name?: string }  // Optional new name, defaults to "[Original] (Copy)"

// Response
{ success: true, program: Program }  // New program with new ID
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `/prisma/schema.prisma` | Add `archivedAt` to Program, make `programId` nullable on WorkoutLog |
| `/src/app/api/programs/[id]/route.ts` | Change DELETE to archive (soft delete) |
| `/src/app/api/programs/[id]/archive/route.ts` | NEW: Archive/restore endpoint |
| `/src/app/api/programs/[id]/clone/route.ts` | NEW: Clone endpoint |
| `/src/app/api/programs/route.ts` | Add filtering for archived programs |
| `/src/lib/programs.ts` | Update program queries to exclude archived by default |
| `/src/components/program/archive-modal.tsx` | NEW: Confirmation modal |

---

## 8. Implementation Plan

### Dependencies
- [ ] No blocking dependencies

### Build Order

1. [x] **Schema Migration**
   - Add `archivedAt` field to Program
   - Make `programId` nullable on WorkoutLog
   - Add `programName` to WorkoutLog for denormalization
   - Run migration: `npx prisma migrate dev --name add-program-archiving`

2. [x] **API: Archive/Restore**
   - Create `/api/programs/[id]/archive/route.ts`
   - Implement PUT handler for archive/restore

3. [x] **API: List Programs Filter**
   - Update GET `/api/programs` to filter by `archivedAt`
   - Add query param support

4. [x] **API: Clone Program**
   - Create `/api/programs/[id]/clone/route.ts`
   - Copy program structure with new IDs

5. [x] **API: Soft Delete**
   - Change DELETE to set `archivedAt` instead of `prisma.program.delete()`

6. [x] **UI: Archive Modal**
   - Create confirmation modal component
   - Wire up to program actions

### Agents to Consult
- **Database Specialist** - Schema migration, cascade behavior
- **Frontend Specialist** - Modal component, archived section UI

### Risks

| Risk | Mitigation |
|------|------------|
| Existing workout logs have non-null programId constraint | Migration must update constraint before data |
| Users expect DELETE to actually delete | Clear UI messaging, "Delete Permanently" option in archived section |
| Orphaned workout logs confusing | Show program name in log even if program archived |

---

## 9. Testing

- [ ] Archive program: `archivedAt` set, program hidden from default list
- [ ] Restore program: `archivedAt` cleared, program visible again
- [ ] Workout logs preserved: Logs still exist after program archived
- [ ] Clone creates independent copy: Edit clone doesn't affect original
- [ ] Active program archived: Prompt to select new active program
- [ ] Archived programs queryable: `?archivedOnly=true` works

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] Migration tested locally
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Migration deployed (Vercel auto-runs)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-13 | Initial draft - PRD created for health optimization plan |
