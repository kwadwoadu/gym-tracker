# SetFlow Changelog

All notable changes to the SetFlow project.

---

## [2026-01-04] SetFlow v2.1 - Smart Memory + Video Player

### Added
- **Smart Memory for Reps & RPE**: Exercises now start with last workout's actual reps and RPE values instead of defaults
- **Video Tutorial Support**: SetLogger now shows "Watch exercise tutorial" button for all 97 exercises

### Improved
- **RPE-Aware ChallengeCard**: Progressive overload suggestions only appear when last RPE < 9 (user has capacity for more weight)
- **Video Player Fallback**: Search URLs open YouTube in new tab; direct video URLs play in-app via iframe

### Technical Details
- Extended `getGlobalWeightSuggestion()` to return `suggestedReps`, `suggestedRpe`, `lastRpe`
- Added RPE < 9 check to `shouldNudgeIncrease` logic
- SetLogger now accepts `suggestedReps` and `suggestedRpe` props with useEffect for async updates
- Added `isYouTubeSearchUrl()` helper to detect search URLs vs direct video links

### Files Changed
- `src/lib/workout-helpers.ts` - Extended return type, added RPE check
- `src/components/workout/set-logger.tsx` - New props, smart memory, video fallback
- `src/app/workout/[dayId]/page.tsx` - Updated type definition, pass new props

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
