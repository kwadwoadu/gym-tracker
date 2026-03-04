# Workout Templates & Community Sharing

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

SetFlow currently operates as a solo experience. Users can create and follow their own training programs, but there is no way to:

1. **Share a program** with a friend or training partner
2. **Browse what others are doing** for workout inspiration
3. **Import a proven program** without manually recreating every exercise, superset, and tempo notation
4. **Show off completed workouts** on social media to stay accountable

The friction of manual program entry (a 4-day PPL program with 24+ exercises, tempo markings, and rest times takes 15-20 minutes to input) means users rarely try new programs. Training partners at the same gym end up maintaining separate, slightly different copies of the same program.

Additionally, after a hard workout there is no native way to generate a shareable visual summary. Users screenshot the app or type stats into Instagram Stories manually, missing an opportunity for organic growth.

---

## 2. Solution

### Workout Templates Library
Users can save any training program as a reusable template and optionally publish it to a community directory.

### Community Programs
A browsable section where published templates are listed with:
- Program name, author, and description
- Training split type (PPL, Upper/Lower, Full Body, Bro Split)
- Difficulty level and estimated session duration
- Upvote count and import count
- One-tap import to local storage

### Shareable Workout Summary Cards
After completing a workout, users can generate a branded image card showing:
- Workout name and date
- Exercise highlights (top sets, PRs hit)
- Total volume, duration, and streak count
- SetFlow watermark and QR code linking to the app
- Optimized for Instagram Stories (1080x1920) and square posts (1080x1080)

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Templates created | 50 templates in first month | Count published templates in DB |
| Template imports | 30% of new users import a community template | Track import events vs new signups |
| Share card generation | 20% of completed workouts generate a card | Track card generation events |
| Organic installs from shares | 5% of share card views convert to app visit | QR code scan tracking via analytics |
| Community return rate | 40% of users browse Community Programs weekly | Track unique weekly visitors to community section |

---

## 4. Requirements

### Must Have
- [ ] Save any active program as a shareable template
- [ ] Community Programs browsable list with search and filter (split type, difficulty)
- [ ] Upvote system for community templates (one vote per user per template)
- [ ] One-tap import: copies full program (days, supersets, exercises, tempo, rest) to local Dexie DB
- [ ] Workout summary card generation with Canvas API (Stories format: 1080x1920)
- [ ] Share card includes: workout name, date, top sets, PRs, total volume, duration, streak
- [ ] SetFlow branding + QR code on share card
- [ ] Clerk auth required for publishing and voting (read-only browse without auth)

### Should Have
- [ ] Square format option (1080x1080) for feed posts
- [ ] Template preview before import (see all days and exercises)
- [ ] "My Templates" section to manage published templates
- [ ] Import counter shown to template author
- [ ] Copy link to specific template for direct sharing
- [ ] Report/flag inappropriate templates

### Won't Have (this version)
- Real-time collaborative program editing
- Paid/premium templates or marketplace
- Video content within templates
- Template versioning (edit after publish creates new template)
- Comments or discussion on templates

---

## 5. User Flow

### Flow 1: Publish a Template
1. User navigates to their active program settings
2. Taps "Share as Template"
3. Fills in: description, difficulty (Beginner/Intermediate/Advanced), split type tag
4. Taps "Publish to Community"
5. Template appears in Community Programs (requires Clerk auth)
6. User receives confirmation with shareable link

### Flow 2: Browse and Import
1. User taps "Community" tab in bottom navigation
2. Sees list of templates sorted by popularity (upvotes)
3. Filters by split type: "PPL"
4. Taps a template card to see full preview (all days, exercises, tempo)
5. Taps "Import Program"
6. Program copies to local Dexie DB as a new program
7. User is redirected to home with new program active

### Flow 3: Generate Share Card
1. User completes a workout session
2. Session summary screen shows "Share Workout" button
3. User taps "Share Workout"
4. Canvas API generates branded image with workout stats
5. User selects format: Stories (1080x1920) or Square (1080x1080)
6. Image saved to device photo library / share sheet opens
7. User posts to Instagram, WhatsApp, etc.

### Flow 4: Upvote a Template
1. User browses Community Programs
2. Taps upvote icon on a template card
3. Count increments (optimistic update)
4. Auth required - if not signed in, Clerk auth modal appears
5. One vote per user per template (toggle on/off)

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `CommunityBrowser` | Main community page with search, filters, template list |
| `TemplateCard` | Card showing template name, author, stats, upvote button |
| `TemplatePreview` | Full program preview modal (all days and exercises) |
| `PublishTemplateForm` | Form for description, difficulty, split type |
| `ShareCardGenerator` | Canvas-based workout summary image creator |
| `ShareCardPreview` | Preview of generated image with format selector |
| `FormatSelector` | Stories vs Square toggle |

### Visual Design

**Community Browser**:
- Background: `#0A0A0A`
- Search bar: `#2A2A2A` input with `#666666` placeholder
- Filter pills: `#1A1A1A` default, `#CDFF00` text when active
- Template cards: `#1A1A1A` background, rounded-xl

**Template Card**:
- Height: ~100px
- Left: Program name (18px bold), author (14px muted), split tag pill
- Right: Upvote button (arrow + count), import count icon
- Upvote active: `#CDFF00` fill
- Bottom border: subtle `#2A2A2A` separator

**Share Card (Generated Image)**:
- Background: gradient from `#0A0A0A` to `#1A1A1A`
- Accent highlights: `#CDFF00` for PRs, streak flame, key stats
- SetFlow logo bottom-left, QR code bottom-right
- Typography: Bold workout name, medium stats, muted metadata

### Wireframe - Community Browser

```
+------------------------------------------+
| [Logo] SetFlow                    [gear] |
+------------------------------------------+
| [Search templates...]                    |
|                                          |
| [All] [PPL] [Upper/Lower] [Full Body]   |
+------------------------------------------+
| +--------------------------------------+ |
| | Nordic PPL            by @kwadwo     | |
| | 4 days - Advanced - PPL              | |
| |                    [^] 24   [dl] 89  | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Beginner Full Body   by @sarah       | |
| | 3 days - Beginner - Full Body        | |
| |                    [^] 156  [dl] 412 | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Push Pull Legs V2    by @mike        | |
| | 6 days - Intermediate - PPL          | |
| |                    [^] 67   [dl] 203 | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [Home] [Community] [Stats] [Profile]    |
+------------------------------------------+
```

### Wireframe - Share Card (Stories Format)

```
+------------------------+
|                        |
|     [SetFlow Logo]     |
|                        |
|    UPPER BODY - PUSH   |
|    March 4, 2026       |
|                        |
|  +---------+---------+ |
|  | Volume  | Duration| |
|  | 12,400  |  52min  | |
|  | kg      |         | |
|  +---------+---------+ |
|                        |
|  TOP SETS              |
|  Bench Press  80kg x8  |
|  OHP          50kg x6  |
|  Inc DB Press 30kg x10 |
|                        |
|  NEW PR! Bench 80kg    |
|                        |
|  [flame] 12 day streak |
|                        |
|  [logo]         [QR]   |
+------------------------+
```

---

## 7. Technical Spec

### Template Data Model

```typescript
// /src/types/templates.ts
export interface WorkoutTemplate {
  id: string;
  authorId: string;          // Clerk user ID
  authorName: string;
  programName: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  splitType: 'ppl' | 'upper_lower' | 'full_body' | 'bro_split' | 'other';
  dayCount: number;
  estimatedDuration: number; // minutes per session
  programData: SerializedProgram; // Full program JSON
  upvotes: number;
  imports: number;
  createdAt: string;         // ISO date
  updatedAt: string;
}

export interface TemplateVote {
  templateId: string;
  userId: string;
  createdAt: string;
}

export interface SerializedProgram {
  name: string;
  days: SerializedTrainingDay[];
}

export interface SerializedTrainingDay {
  name: string;
  warmup: SerializedExercise[];
  supersets: SerializedSuperset[];
  finisher: SerializedExercise[];
}
```

### Share Card Generator

```typescript
// /src/lib/share-card.ts
interface ShareCardData {
  workoutName: string;
  date: string;
  totalVolume: number;
  duration: number;
  topSets: { exercise: string; weight: number; reps: number }[];
  prs: { exercise: string; weight: number }[];
  streakDays: number;
}

type CardFormat = 'stories' | 'square';

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  stories: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

export async function generateShareCard(
  data: ShareCardData,
  format: CardFormat = 'stories'
): Promise<Blob> {
  const { width, height } = DIMENSIONS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0A0A0A');
  gradient.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Logo
  ctx.fillStyle = '#CDFF00';
  ctx.font = 'bold 48px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('SetFlow', width / 2, 120);

  // Workout name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px Inter, system-ui';
  ctx.fillText(data.workoutName.toUpperCase(), width / 2, 280);

  // Date
  ctx.fillStyle = '#A0A0A0';
  ctx.font = '32px Inter, system-ui';
  ctx.fillText(data.date, width / 2, 340);

  // Stats boxes
  drawStatBox(ctx, width / 2 - 220, 420, 'Volume', `${data.totalVolume.toLocaleString()} kg`);
  drawStatBox(ctx, width / 2 + 20, 420, 'Duration', `${data.duration}min`);

  // Top sets
  ctx.textAlign = 'left';
  ctx.fillStyle = '#CDFF00';
  ctx.font = 'bold 36px Inter, system-ui';
  ctx.fillText('TOP SETS', 80, 680);

  data.topSets.slice(0, 3).forEach((set, i) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px Inter, system-ui';
    ctx.fillText(set.exercise, 80, 740 + i * 60);
    ctx.fillStyle = '#A0A0A0';
    ctx.textAlign = 'right';
    ctx.fillText(`${set.weight}kg x${set.reps}`, width - 80, 740 + i * 60);
    ctx.textAlign = 'left';
  });

  // PRs
  if (data.prs.length > 0) {
    const prY = 940;
    ctx.fillStyle = '#CDFF00';
    ctx.font = 'bold 36px Inter, system-ui';
    ctx.fillText(`NEW PR! ${data.prs[0].exercise} ${data.prs[0].weight}kg`, 80, prY);
  }

  // Streak
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 36px Inter, system-ui';
  const streakY = format === 'stories' ? height - 200 : height - 140;
  ctx.textAlign = 'center';
  ctx.fillText(`${data.streakDays} day streak`, width / 2, streakY);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string
): void {
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.roundRect(x, y, 200, 120, 16);
  ctx.fill();

  ctx.fillStyle = '#A0A0A0';
  ctx.font = '24px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 100, y + 40);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Inter, system-ui';
  ctx.fillText(value, x + 100, y + 90);
}
```

### Template API Routes

```typescript
// /src/app/api/templates/route.ts
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const splitType = searchParams.get('splitType');
  const sort = searchParams.get('sort') || 'upvotes';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const where = splitType ? { splitType } : {};
  const orderBy = sort === 'upvotes'
    ? { upvotes: 'desc' as const }
    : { createdAt: 'desc' as const };

  const templates = await prisma.workoutTemplate.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const template = await prisma.workoutTemplate.create({
    data: {
      authorId: userId,
      authorName: body.authorName,
      programName: body.programName,
      description: body.description,
      difficulty: body.difficulty,
      splitType: body.splitType,
      dayCount: body.dayCount,
      estimatedDuration: body.estimatedDuration,
      programData: body.programData,
      upvotes: 0,
      imports: 0,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
```

### Import Template to Dexie

```typescript
// /src/lib/template-import.ts
import { db } from '@/lib/db';
import type { SerializedProgram } from '@/types/templates';

export async function importTemplate(program: SerializedProgram): Promise<string> {
  const programId = crypto.randomUUID();

  await db.transaction('rw', db.programs, db.trainingDays, db.supersets, async () => {
    await db.programs.add({
      id: programId,
      name: program.name,
      isActive: false,
      createdAt: new Date().toISOString(),
    });

    for (let i = 0; i < program.days.length; i++) {
      const day = program.days[i];
      const dayId = crypto.randomUUID();

      await db.trainingDays.add({
        id: dayId,
        programId,
        name: day.name,
        order: i,
        warmup: day.warmup,
        finisher: day.finisher,
      });

      for (let j = 0; j < day.supersets.length; j++) {
        await db.supersets.add({
          id: crypto.randomUUID(),
          dayId,
          label: String.fromCharCode(65 + j), // A, B, C...
          exercises: day.supersets[j].exercises,
          order: j,
        });
      }
    }
  });

  return programId;
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/templates.ts` | Template and vote type definitions |
| `src/lib/share-card.ts` | Canvas API share card generator |
| `src/lib/template-import.ts` | Import template into local Dexie DB |
| `src/app/api/templates/route.ts` | CRUD API for community templates |
| `src/app/api/templates/[id]/vote/route.ts` | Upvote/downvote toggle API |
| `src/app/community/page.tsx` | Community browser page |
| `src/app/community/[id]/page.tsx` | Template detail/preview page |
| `src/components/community/CommunityBrowser.tsx` | Main browse UI with search and filters |
| `src/components/community/TemplateCard.tsx` | Template list item card |
| `src/components/community/TemplatePreview.tsx` | Full program preview modal |
| `src/components/community/PublishTemplateForm.tsx` | Publish form modal |
| `src/components/sharing/ShareCardGenerator.tsx` | Share card creation UI |
| `src/components/sharing/ShareCardPreview.tsx` | Preview with format selector |

### Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add WorkoutTemplate and TemplateVote models |
| `src/app/layout.tsx` | Add Community tab to bottom navigation |
| `src/components/workout/SessionSummary.tsx` | Add "Share Workout" button |
| `src/lib/db.ts` | Add programs, trainingDays, supersets tables to Dexie schema if not present |

---

## 8. Implementation Plan

### Dependencies
- [ ] Clerk auth (already integrated)
- [ ] Prisma + PostgreSQL for community data (already configured)
- [ ] Dexie.js for local import (already integrated)
- [ ] No new external dependencies (Canvas API is native)

### Build Order

1. [ ] **Prisma schema update** - Add WorkoutTemplate and TemplateVote models, run migration
2. [ ] **Type definitions** - Create `src/types/templates.ts`
3. [ ] **API routes** - Templates CRUD + vote toggle endpoints
4. [ ] **Template import logic** - `template-import.ts` for Dexie transaction
5. [ ] **Share card generator** - Canvas API image creation
6. [ ] **CommunityBrowser component** - Search, filters, template list
7. [ ] **TemplateCard component** - List item with upvote button
8. [ ] **TemplatePreview component** - Full program detail modal
9. [ ] **PublishTemplateForm** - Publish flow from program settings
10. [ ] **ShareCardGenerator UI** - Post-workout share card creation
11. [ ] **Navigation update** - Add Community tab to bottom nav
12. [ ] **Session summary update** - Add Share Workout button
13. [ ] **QR code generation** - Dynamic QR pointing to gym.adu.dk
14. [ ] **Test** - Full flow: publish, browse, import, share card generation

### Agents to Consult
- **Frontend Specialist** - Component composition, list virtualization for large template lists
- **Database Specialist** - Prisma schema design, pagination queries
- **PWA Specialist** - Offline behavior for community (cache templates for offline browse)
- **Software Engineer** - API route design, auth middleware

---

## 9. Testing

### Functional Tests
- [ ] User can save active program as template
- [ ] Template appears in Community Programs after publishing
- [ ] Search filters by program name
- [ ] Split type filter works (PPL, Full Body, etc.)
- [ ] Upvote increments count, second tap removes vote
- [ ] Import copies full program structure (days, supersets, exercises, tempo, rest)
- [ ] Imported program works identically to manually created one
- [ ] Share card generates correct image with all stats
- [ ] QR code on share card links to gym.adu.dk
- [ ] Stories format is 1080x1920, square is 1080x1080
- [ ] Unauthenticated users can browse but not publish or vote

### UI Verification
- [ ] Community browser renders on iPhone SE without horizontal overflow
- [ ] Template cards have 44px+ tap targets for upvote and import buttons
- [ ] Dark theme colors correct (`#1A1A1A` cards on `#0A0A0A` bg)
- [ ] Share card text is readable when posted to Instagram
- [ ] Loading states for template list and share card generation
- [ ] Empty state when no templates match filter
- [ ] Works offline with cached templates (graceful degradation)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] Share card tested on Instagram Stories
- [ ] Community section populated with 3+ seed templates
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User publishes empty program (0 exercises) | Validate minimum: 1 day with 1 exercise |
| Template author deletes their account | Templates remain with "Deleted User" author |
| Import a program when user already has max programs | Show error, suggest archiving an existing program |
| Very long program name in share card | Truncate at 30 chars with ellipsis |
| No PRs in workout session | Hide PR section on share card |
| User tries to import their own template | Allow it (useful for backup/restore) |
| Duplicate template names | Allow - templates distinguished by author and ID |
| Offensive template names/descriptions | Report/flag button, manual review queue |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Community templates cluttered with low-quality programs | Users can't find good templates | Upvote-based sorting surfaces quality; add minimum exercise count validation |
| Canvas API not supported on older browsers | Share card fails | Feature detection with fallback to text-based share (copy stats to clipboard) |
| Prisma/PostgreSQL adds latency for community features | Slow browse experience | Paginated queries (20 per page), client-side caching, consider edge caching |
| Users confuse imported template with their own program | Accidental edits to shared program | Imported programs are independent copies, add "Imported from [author]" label |
| Share card images are large (1-2MB PNG) | Slow generation and sharing | Compress with canvas.toBlob quality param, consider JPEG for smaller size |
| Spam templates from bots | Community pollution | Clerk auth required for publishing, rate limit to 5 templates per day |

---

## Dependencies

- Clerk auth (existing) - required for community identity and voting
- Prisma + PostgreSQL (existing) - stores community templates server-side
- Dexie.js (existing) - local storage for imported programs
- Canvas API (browser native) - share card image generation
- Should be implemented after `hero-workout-action.md` (P0) and core stability fixes

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
