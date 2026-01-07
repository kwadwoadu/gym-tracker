# SetFlow Changelog

All notable changes to the SetFlow project.

---

## [2026-01-07] Fix Empty Program Bug for New Users

### Fixed
- **Empty Program on Onboarding**: New users selecting Upper/Lower Split or PPL programs were seeing empty day tabs with no exercises
- **Root Cause**: `buildExerciseIdMapping()` silently failed when exercises couldn't be mapped, preserving invalid string IDs that didn't exist in the database

### Improved
- **Auto-Create Missing Exercises**: Mapping function now creates exercises that don't exist instead of just logging warnings
- **Pre-Install Validation**: Added validation step that verifies all required exercise IDs are mapped before program creation
- **Detailed Mapping Logs**: Clear breakdown of mapping results (by builtInId, by name, created new, failed)

### Technical Details
- Three-phase mapping: builtInId match -> name match -> auto-create
- Validation uses `getRequiredExerciseIds()` to check all preset exercises
- Errors are logged clearly but don't block installation (graceful degradation)

### Patterns Extracted
- `/docs/patterns/id-mapping-with-autocreate.md` - Reusable pattern for data migration flows

### Files Changed
- `src/lib/programs.ts` - Fixed `buildExerciseIdMapping()` and added validation

---

## [2026-01-07] Meal Planner UX Improvements

### Added
- **Expandable Recipes**: Click meal card to see ingredients list
- **Quick-Add Button**: Plus button on each meal template adds to matching slot
- **Toast Notifications**: Success/error feedback for quick-add actions
- **Expandable Slots**: Click filled slots to see recipe ingredients

### Fixed
- **Drag Handle Isolation**: Only grip icon (6 dots) triggers drag, not entire card
- **Date Bug**: Each day now starts fresh (staleTime: 0 + key prop remount)
- **Touch Targets**: Drag handle increased to 32x32px for better mobile UX

### Technical Details
- Used `setActivatorNodeRef` from @dnd-kit to isolate drag to grip icon
- Added local `isExpanded` state with Framer Motion AnimatePresence
- React Query `staleTime: 0` for date-specific queries
- Key prop on MealPlanner forces remount on date change

### Patterns Extracted
- `dnd-kit-drag-handle.md` - Isolate drag to specific element
- `toast-notification.md` - Simple local toast without external library

### Files Modified
- `src/components/nutrition/meal-template-card.tsx`
- `src/components/nutrition/meal-slot.tsx`
- `src/components/nutrition/meal-planner.tsx`
- `src/lib/queries.ts`
- `src/app/nutrition/plan/page.tsx`

---

## [2026-01-05] SetFlow v2.4 - Nutrition Tracking Module

### Added
- **Nutrition Feature (Gated to k@adu.dk)**: Complete meal planning and compliance tracking
- **Daily Checklist**: Toggle buttons for protein goal (180g) and calorie compliance (~2500)
- **Meal Planner**: Drag-and-drop from 17 lactose-free meal templates to 5 daily slots
- **Weekly Compliance Stats**: Dashboard showing protein/calorie compliance percentages
- **17 Meal Templates**: Breakfast (B1-B4), Mid-morning (M1-M3), Lunch (L1-L5), Snack (S1-S4), Dinner (D1-D5)
- **Feature Gating Pattern**: Email whitelist via `/src/lib/feature-flags.ts`
- **Conditional Navigation**: Nutrition icon only visible to authorized users

### Technical Details
- **Prisma Models**: `NutritionLog` (daily compliance), `MealPlan` (slot assignments)
- **API Routes**: `/api/nutrition/log`, `/api/nutrition/plan`, `/api/nutrition/stats`
- **React Query Hooks**: Optimistic updates for instant UI feedback
- **@dnd-kit**: PointerSensor + TouchSensor for desktop/mobile drag support

### Patterns Extracted
- `feature-gating.md` - Email whitelist pattern for beta features
- `dnd-kit-mobile.md` - Touch-friendly drag and drop implementation
- `prisma-json-fields.md` - Type-safe JSON field handling

### Files Created
- Prisma schema extended with NutritionLog, MealPlan models
- `src/data/meal-templates.ts` - 17 lactose-free meals
- `src/lib/feature-flags.ts` - Email whitelist check
- `src/hooks/use-nutrition-access.ts` - Client access hook
- `src/app/api/nutrition/` - 3 API routes (log, plan, stats)
- `src/app/nutrition/` - 3 pages (dashboard, log, plan)
- `src/components/nutrition/` - 8 components + CLAUDE.md
- `skills/feature-gating.md`, `skills/dnd-kit-mobile.md`, `skills/prisma-json-fields.md`

### Fixed
- Notes state sync bug in daily-checklist (useEffect for date changes)
- Prisma JSON null handling with `?? {}` fallback
- TypeScript double-cast for JSON fields (`as unknown as Type`)

---

## [2026-01-05] SetFlow v2.3.1 - TypeScript Strict Mode Fixes

### Fixed
- **Backup System Types**: Added proper typed interfaces for all backup entities, replacing `any` casts
- **Date Serialization**: All Date objects now properly serialized to ISO strings in backup creation
- **JSON Field Casting**: Proper type casting for Prisma JSON fields in restore operations
- **Export/Import**: Pass `workoutLogId` through import function for PR restoration
- **Server Component**: Removed unused `"use client"` directive from not-found.tsx

### Technical Details
- Added 8 typed interfaces: BackupExercise, BackupProgram, BackupTrainingDay, BackupWorkoutLog, BackupPersonalRecord, BackupUserSettings, BackupAchievement, BackupData
- Export Prisma namespace from prisma.ts for InputJsonValue type
- All changes enable clean Vercel production builds

### Files Changed
- `src/lib/backup.ts` - Added proper types, date serialization, JSON casting
- `src/lib/prisma.ts` - Added Prisma namespace export
- `src/lib/export.ts` - Pass workoutLogId in import
- `src/app/not-found.tsx` - Removed use client directive

---

## [2026-01-05] SetFlow v2.3 - Data Protection Verification

### Verified Data Protection Features
All data protection mechanisms confirmed working:

- **Backup System**: `Backup` model in Prisma schema + `/src/lib/backup.ts` with create, list, restore, cleanup functions
- **Reset Endpoint**: Creates automatic backup before any destructive operation, returns `backupId` for recovery
- **Seed Endpoint**: Requires explicit `action` parameter (no accidental data loss), creates backups for dangerous actions
- **Export/Import UI**: Fully wired in Settings page with loading states and success/error toasts
- **Reset Confirmation**: Multi-step dialog with "Export First" option before destructive reset

### Fixed
- **TypeScript Type Mismatch**: `workoutLogId` now correctly marked as required (not optional) in `personalRecordsApi.create()`

### Already Implemented (Confirmed)
- Weekly progress shows `X/{programDayCount}` instead of hardcoded `X/7`
- PR creation flow correctly passes `workoutLogId` through the call chain
- Stats API returns `programDayCount` from active program

### Files Changed
- `src/lib/api-client.ts` - Fixed `workoutLogId` type from optional to required

---

## [2026-01-04] SetFlow v2.2.2 - Complete Video URL Curation

### Fixed
- **All 97 Exercises Now Have Direct Video URLs**: Replaced 15 remaining search URLs with direct YouTube video URLs for in-app embedding

### Updated Exercises
- Machine Shoulder Press, Hip Abduction Machine
- Plank, Russian Twist, Ab Wheel Rollout, Cable Woodchop
- Shoulder Circles, Arm Circles, Hip Circles
- Cat-Cow, Bodyweight Squats, Dead Hang
- World's Greatest Stretch, Leg Swings, Thoracic Rotation

### Technical Details
- Zero search URLs remain (was 15)
- All videos now use `youtube.com/watch?v=ID` format
- Ran backfill script to update database

### Files Changed
- `src/data/exercises.json` - Updated 15 video URLs

---

## [2026-01-04] SetFlow v2.2 - Video Tutorial Embedding

### Fixed (Critical)
- **Videos Not Appearing**: Seeding was hardcoding `videoUrl: null` instead of using exercises.json data
- **Workout Completion Error Handling**: Added try-catch to `finishWorkout()` - completion screen now shows even if PR/achievement checks fail

### Added
- **In-App Video Embedding**: 50+ exercises now have direct YouTube video URLs (from Nordic Performance Training)
- **Backfill API Endpoint**: `POST /api/seed { "action": "backfill-videos" }` updates existing users' exercise data
- **Curated Video Sources**: Priority: Nordic Performance Training > TylerPath > ATHLEAN-X

### Improved
- **Direct Video Links**: Changed from search URLs (opens new tab) to direct video URLs (embeds in-app)
- **Error-Resilient Completion**: Workout saves are confirmed before PR/achievement checks run

### Technical Details
- Fixed `seedExercisesWithMapping()` line 50: `videoUrl: null` -> `videoUrl: ex.videoUrl || null`
- Added `backfillVideoUrls()` function to seed.ts
- SetLogger's `getYouTubeId()` now works with direct video URLs for embedding
- Exercises without direct links fallback to search URLs (open in new tab)

### Files Changed
- `src/lib/seed.ts` - Fixed videoUrl seeding, added backfillVideoUrls()
- `src/app/api/seed/route.ts` - Added "backfill-videos" action
- `src/app/workout/[dayId]/page.tsx` - Error handling in finishWorkout()
- `src/data/exercises.json` - 50+ exercises with direct YouTube video URLs

---

## [2026-01-04] SetFlow v2.1 - Smart Memory + Video Player

### Fixed (Critical)
- **API Bug - Completed Workouts Not Saving**: POST endpoint now properly accepts `isComplete`, `sets`, `endTime`, and `duration` fields. Previously hardcoded to `false` and `[]`, which meant no workout history was ever saved.

### Added
- **Within-Workout Memory (Set-to-Set)**: Set 2 now pre-fills with Set 1's actual weight, reps, and RPE from the current session
- **Cross-Workout Memory**: Exercises remember values from last completed workout when no session memory exists
- **Memory Source Indicator**: UI shows "From previous set" (lime highlight) vs "Last: [date]" (gray) to indicate memory source
- **Video Tutorial Support**: SetLogger shows video tutorial buttons for all 97 exercises

### Improved
- **Smart Memory Priority**: Session memory > Historical memory > Defaults
- **RPE-Aware ChallengeCard**: Progressive overload suggestions only appear when last RPE < 9
- **Video Player Fallback**: Search URLs open YouTube in new tab; direct video URLs play in-app

### Technical Details
- Fixed POST `/api/workout-logs/route.ts` to accept all fields from request body
- Added `getSessionMemoryForExercise()` helper for within-workout memory
- Added `memorySource` prop to SetLogger to show where values came from
- Extended `getGlobalWeightSuggestion()` to return `suggestedReps`, `suggestedRpe`, `lastRpe`

### Files Changed
- `src/app/api/workout-logs/route.ts` - Fixed POST handler to accept all fields
- `src/app/workout/[dayId]/page.tsx` - Added session memory function, updated SetLogger props
- `src/components/workout/set-logger.tsx` - Added memorySource indicator UI
- `src/lib/workout-helpers.ts` - Extended return type for cross-workout memory

---

## [2026-01-04] SetFlow v2 - Critical Fixes

### Fixed
- Issue 1: Reset function 500 error - Replaced sequential loops with batch Prisma transactions
- Issue 6: Manifest.json 401 error - Updated middleware matcher to exclude manifest.json

### Added
- Issue 3: Cross-device workout resume - ActiveSession Prisma model + /api/session CRUD
- Issue 4: Skip buttons for sets, warmup, and finisher exercises
- Issue 2: YouTube search URLs for all 97 exercises

### Improved
- Issue 5: Weight memory visibility - Already functional via ChallengeCard progressive overload prompts

### Technical Details
- New Prisma model: `ActiveSession` for cloud session persistence
- New API routes: `/api/reset` (batch reset), `/api/session` (session CRUD)
- Middleware updated to exclude `manifest.json` from auth
- All 97 exercises now have `videoUrl` field with YouTube search links

### Files Changed
- `prisma/schema.prisma` - Added ActiveSession model
- `src/app/api/reset/route.ts` (new) - Batch reset endpoint
- `src/app/api/session/route.ts` (new) - Session CRUD
- `src/middleware.ts` - Exclude manifest.json
- `src/components/workout/set-logger.tsx` - Skip button
- `src/app/workout/[dayId]/page.tsx` - Skip logic, session sync
- `src/data/exercises.json` - Added videoUrl to all 97 exercises

---

## [2026-01-04] CLAUDE.md System Upgrade

### Added
- **5 new CLAUDE.md files** for previously undocumented folders:
  - `/src/components/CLAUDE.md` - Component architecture, shadcn/ui rules
  - `/src/data/CLAUDE.md` - Static data governance (exercises, programs)
  - `/prisma/CLAUDE.md` - Schema safety, migration workflow
  - `/public/CLAUDE.md` - PWA assets, sounds, manifest
  - `/docs/patterns/CLAUDE.md` - Pattern catalog and creation workflow
- **claude-md-setup skill** - Reusable workflow for setting up CLAUDE.md systems

### Upgraded
- **7 existing CLAUDE.md files** with Signkit-inspired patterns:
  - Agent Ownership sections
  - Cross-References tables
  - Anti-patterns documentation
  - Environment Safety Rules
  - Proactive Behavior Triggers

### Fixed
- Agent count discrepancy: 13 -> 14 (added Sync Specialist)
- Outdated file references (db.ts -> prisma.ts/queries.ts)
- Pattern System table with actual file paths

### Patterns Extracted
- `claude-md-setup` skill for future CLAUDE.md system work

### Files Changed
- 12 CLAUDE.md files created/upgraded
- 1 new skill: `/skills/claude-md-setup.md`

---

## [2026-01-04] Post-Migration Fix: builtInId for Exercise Mapping

### Added
- **builtInId field** on Exercise model for reliable preset-to-database ID mapping
- **Stable Preset Identifiers pattern** in `/docs/patterns/stable-preset-identifiers.md`
- **Backfill API endpoint** (`POST /api/seed` with `action: "backfill"`)
- **Reset to Default** (`POST /api/seed` with `action: "reset"`)
- **PRD**: `/docs/prds/post-migration-fixes.md`

### Fixed
- Exercise names displaying as IDs (e.g., "ex-barbell-bench" instead of "Barbell Bench Press")
- PPL and Upper/Lower programs appearing empty when selected
- Settings Reset was stubbed ("coming soon") - now functional

### Technical Details
- `builtInId` stores original preset ID (e.g., "ex-barbell-bench")
- ID mapping uses builtInId first, falls back to name matching for legacy data
- Backfill script updates existing exercises missing builtInId
- Reset clears workouts/PRs and reinstalls default Full Body program

### Files Changed
- `prisma/schema.prisma` - Added builtInId field
- `src/lib/api-client.ts` - Updated Exercise interface
- `src/app/api/exercises/route.ts` - Handle builtInId in POST
- `src/app/api/exercises/[id]/route.ts` - Handle builtInId in PUT
- `src/app/api/seed/route.ts` - Added reset/backfill actions
- `src/lib/seed.ts` - builtInId storage, backfill, reset functions
- `src/lib/programs.ts` - Updated ID mapping logic
- `src/app/settings/page.tsx` - Implemented reset function

---

## [2026-01-03] Sync Date Serialization Fix

### Fixed
- **Critical sync bug**: `toISOString is not a function` error when pushing to cloud
- Root cause: IndexedDB stores dates as ISO strings, but PostgreSQL via Drizzle expects Date objects
- Created `/src/lib/db/utils.ts` with `toDate()` and `toDateRequired()` helpers
- Transformed all timestamp fields in `/src/app/api/sync/route.ts` before database insert
- Achievements with invalid dates are now skipped with warning log
- PRD: `/docs/prds/sync-date-serialization.md`

### Technical Details
- Affected tables: exercises, programs, trainingDays, workoutLogs, personalRecords, userSettings, achievements, onboardingProfiles
- `toDateRequired()` used for required fields (createdAt) with fallback to `new Date()`
- `toDate()` used for nullable fields (completedAt, deletedAt)
- workoutLogs.date, startTime, endTime remain TEXT columns (no conversion needed)

---

## [2026-01-03] Pattern Documentation

### Added
- `/docs/patterns/` folder with 5 documented patterns:
  - PWA Offline Sync - Device sync with IndexedDB
  - Audio Cue System - iOS-compatible Web Audio
  - Local-First Data Model - Dexie.js schema design
  - Workout Session Lifecycle - Session start/end/save
  - Progressive Overload - Weight suggestion logic
- Pattern-driven development references in CLAUDE.md files

---

## [2026-01-02] Cloud Sync & Sync Specialist

### Added
- Sync Specialist agent for debugging sync issues
- Comprehensive sync logging (`[Sync] pushToCloud`, `[Sync] pullFromCloud`)
- Layer-specific CLAUDE.md governance files (`/app/`, `/lib/`)

### Fixed
- Sync fetch calls now include `credentials: "include"`
- Push continues even if pull fails
- Clear sync timestamp on sign-out

---

## [2026-01-01] Agent Architecture v1.0

### Added
- **13-agent team** organized in 4 tiers (Orchestrator, Technical, Domain, Support)
- **Tier 0**: SetFlow Lead (orchestrator with claude-sonnet model)
- **Tier 1 Technical** (5 agents): Software Engineer, Frontend Specialist, PWA Specialist, Database Specialist, Debugger
- **Tier 2 Domain** (6 agents): Periodization Specialist, Injury & Rehab Specialist, Movement Specialist, Action Sports Coach, Progress Analyst, Audio Engineer
- **Tier 3 Support** (1 agent): PRD Specialist
- **4 skills**: agent-creation, exercise-creation, program-creation, progression-logic
- **Agent governance**: `/agents/CLAUDE.md` with routing rules, workflows, and collaboration matrix
- **AduOS hybrid model**: Integration with AduOS core agents (Wellness Director, Health Coach, Technical Lead, etc.)
- **PRD for agent architecture**: `/docs/prds/agent-architecture.md`

### Technical Details
- All 12 specialist agents use `model: claude-haiku`
- SetFlow Lead uses `model: claude-sonnet` for coordination
- Each agent has unique color for UI/CLI differentiation
- Skills include YAML frontmatter with `agents:` field for routing
- Consistent naming: filenames match frontmatter `name:` field

### Files Created
```
agents/
  CLAUDE.md
  setflow-lead.md
  software-engineer.md
  frontend-specialist.md
  pwa-specialist.md
  database-specialist.md
  debugger.md
  periodization-specialist.md
  injury-rehab-specialist.md
  movement-specialist.md
  action-sports-coach.md
  progress-analyst.md
  audio-engineer.md
  prd-specialist.md

skills/
  CLAUDE.md
  agent-creation.md
  exercise-creation.md
  program-creation.md
  progression-logic.md

docs/
  CLAUDE.md
  prds/agent-architecture.md
```

---

*SetFlow | PWA for tracking gym workouts*
