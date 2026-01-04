# SetFlow Agent Team

This file defines agent orchestration for SetFlow - the gym workout tracking PWA.

---

## Agent Architecture

SetFlow has a dedicated 14-agent team organized in 4 tiers:

```
                    ┌──────────────────┐
                    │   SetFlow Lead   │
                    │  (Orchestrator)  │
                    └────────┬─────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
     ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  TECHNICAL  │      │   FITNESS   │      │   SUPPORT   │
│  (6 agents) │      │  (6 agents) │      │  (1 agent)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## Agent Roster

### Tier 0: Orchestration
| Agent | File | Purpose |
|-------|------|---------|
| **SetFlow Lead** | `setflow-lead.md` | Coordination, routing, decisions, PWA quality |

### Tier 1: Technical Stack
| Agent | File | Purpose |
|-------|------|---------|
| **Software Engineer** | `software-engineer.md` | Full-stack Next.js 15 implementation |
| **Frontend Specialist** | `frontend-specialist.md` | React 19, shadcn/ui, dark theme, touch UX |
| **PWA Specialist** | `pwa-specialist.md` | Offline-first, iOS quirks, service workers |
| **Database Specialist** | `database-specialist.md` | Dexie.js, IndexedDB, data layer |
| **Sync Specialist** | `sync-specialist.md` | Cross-device sync, Clerk auth, cloud sync debugging |
| **Debugger** | `debugger.md` | Bug investigation, root cause analysis |

### Tier 2: Fitness Domain
| Agent | File | Purpose |
|-------|------|---------|
| **Periodization Specialist** | `periodization-specialist.md` | Program design, progressive overload, deloads |
| **Injury & Rehab Specialist** | `injury-rehab-specialist.md` | Injury modifications, rehabilitation protocols |
| **Movement Specialist** | `movement-specialist.md` | Form cues, mobility, warm-up/cooldown |
| **Action Sports Coach** | `action-sports-coach.md` | Snowboarding, surfing, skiing conditioning |
| **Progress Analyst** | `progress-analyst.md` | Data analysis, plateau detection, PR prediction |
| **Audio Engineer** | `audio-engineer.md` | Web Audio API, timer sounds, haptics fallback |

### Tier 3: Support
| Agent | File | Purpose |
|-------|------|---------|
| **PRD Specialist** | `prd-specialist.md` | Feature specs, acceptance criteria |

---

## AduOS Integration (Hybrid Model)

SetFlow leverages AduOS core agents for expertise outside project scope:

| AduOS Agent | When to Use |
|-------------|-------------|
| **Wellness Director** | Holistic health planning, Whoop data interpretation |
| **Fitness Coach (AduOS)** | General training philosophy, compound lift principles |
| **Health Coach** | Nutrition timing, recovery, sleep optimization |
| **Technical Lead** | Complex architecture decisions, cross-project patterns |
| **Code Reviewer** | Before PRs, quality gates |
| **Security Specialist** | Clerk auth issues, data protection |

**SetFlow agents handle project-specific work** - do NOT duplicate AduOS expertise.

---

## Manager Tier Concept

SetFlow Lead acts as a **coordinator** for complex tasks, not a bottleneck. Most tasks route directly to specialists.

### When to Use SetFlow Lead (Coordinator)
- Task touches **3+ agents**
- Requires **architectural decision**
- Involves **cross-domain** work (technical + fitness)
- Needs **prioritization** between competing needs
- Has **unclear requirements** needing clarification

### When to Route Directly to Specialist
- Task is clearly **single-domain**
- Requirements are **well-defined**
- Work is **contained** to known files
- Previous similar work exists as **pattern**

---

## Complexity Routing Decision Tree

```
Task arrives
    │
    ▼
Is the task clearly defined?
    │
    ├── NO ──→ PRD Specialist (clarify requirements)
    │               │
    │               ▼
    │          Return with clear requirements
    │
    ▼ YES
How many domains does it touch?
    │
    ├── 1 Domain ──→ Route to specialist directly
    │                    │
    │                    ├── Technical? → See routing table
    │                    └── Fitness?   → See routing table
    │
    ├── 2 Domains ──→ Primary specialist leads, collaborator assists
    │
    └── 3+ Domains ──→ SetFlow Lead coordinates
                           │
                           ▼
                      Multi-agent workflow
```

### Complexity Indicators

| Factor | Simple (Direct) | Complex (Coordinate) |
|--------|-----------------|---------------------|
| Domains touched | 1 | 2+ |
| Files affected | <5 | 5+ |
| Agents needed | 1-2 | 3+ |
| Has existing pattern | Yes | No |
| Cross-tech/fitness | No | Yes |

---

## Task Routing Rules

### By Task Type

| Task Type | Route To | When to Use |
|-----------|----------|-------------|
| **Project coordination** | SetFlow Lead | Multi-agent work, decisions, planning |
| **Feature implementation** | Software Engineer | Building new features |
| **UI/UX work** | Frontend Specialist | Component design, dark theme, touch targets |
| **PWA/offline issues** | PWA Specialist | Service worker, iOS, offline-first |
| **Database work** | Database Specialist | Dexie queries, IndexedDB, migrations |
| **Sync issues** | Sync Specialist | Cross-device sync, auth, cloud sync debugging |
| **Bug investigation** | Debugger | Root cause analysis, systematic debugging |
| **Program design** | Periodization Specialist | Mesocycles, progressive overload, deloads |
| **Injury questions** | Injury & Rehab Specialist | Modifications, rehab protocols |
| **Form/technique** | Movement Specialist | Exercise cues, mobility routines |
| **Action sports prep** | Action Sports Coach | Snowboard/surf/ski conditioning |
| **Data analysis** | Progress Analyst | Plateau detection, PR prediction |
| **Audio/timer sounds** | Audio Engineer | Web Audio API, haptics fallback |
| **Feature specs** | PRD Specialist | Requirements, acceptance criteria |

### Routing to AduOS Agents

| Question Type | Route To |
|---------------|----------|
| Overall life/health balance | AduOS Wellness Director |
| General workout philosophy | AduOS Fitness Coach |
| Nutrition around workouts | AduOS Health Coach |
| Cross-project architecture | AduOS Technical Lead |
| Security/auth concerns | AduOS Security Specialist |

---

## Routing Examples

### "Create a new exercise in the database"
```
1. Movement Specialist -> Validate muscle groups, form cues
2. Periodization Specialist -> Suggest tempo defaults, rep ranges
3. Database Specialist -> Add to exercises.json, update schema
4. Frontend Specialist -> Create exercise card UI
5. SetFlow Lead -> Review and approve
```

### "Fix rest timer not working on iOS"
```
1. Debugger -> Investigate root cause (iOS PWA restrictions)
2. PWA Specialist -> Identify iOS-specific workaround
3. Audio Engineer -> Implement Web Audio fallback
4. Frontend Specialist -> Update timer UI feedback
5. Software Engineer -> Integration test
```

### "Add snowboarding prep program"
```
1. Action Sports Coach -> Design sport-specific exercises
2. Periodization Specialist -> Structure 6-week program
3. Movement Specialist -> Add mobility requirements
4. Database Specialist -> Create program JSON
5. Frontend Specialist -> Add program selection card
```

### "User plateaued on bench press"
```
1. Progress Analyst -> Analyze workout data, identify patterns
2. Periodization Specialist -> Recommend program adjustments
3. AduOS Health Coach -> Check recovery/nutrition factors
```

---

## Multi-Agent Workflows

### Workout Session Flow
```
User starts workout
    ↓
Frontend Specialist -> Timer UI, set logging interface
    ↓
Audio Engineer -> Sound cues (beeps, alarms)
    ↓
Database Specialist -> Save sets to IndexedDB
    ↓
Periodization Specialist -> Generate progressive overload suggestion
    ↓
Progress Analyst -> Update stats, check for PRs
```

### New Exercise Creation
```
Input: Exercise name, equipment
    ↓
Movement Specialist -> Define muscle groups, form cues, tempo
    ↓
Periodization Specialist -> Suggest default sets/reps/rest
    ↓
Injury & Rehab Specialist -> Flag any contraindications
    ↓
Database Specialist -> Add to exercises.json
    ↓
Frontend Specialist -> Preview exercise card
```

### Cross-Device Cloud Sync
```
User clicks sync
    ↓
Sync Specialist -> Orchestrate push/pull flow
    ↓
Database Specialist -> Export IndexedDB data
    ↓
Sync Specialist -> Authenticate with Clerk, POST to cloud
    ↓
Database Specialist -> Import cloud data on receiving device
    ↓
Sync Specialist -> Update sync timestamps, handle errors
```

### Injury Modification Flow
```
User selects injury in onboarding
    ↓
Injury & Rehab Specialist -> Identify affected exercises
    ↓
Movement Specialist -> Suggest form modifications
    ↓
Periodization Specialist -> Adjust program intensity
    ↓
Database Specialist -> Apply filters to exercise list
```

---

## Proactive Behaviors

### SetFlow Lead Triggers
- Route complex requests to appropriate agents
- Coordinate multi-agent workflows
- Surface PWA issues before they become blockers
- Ensure fitness domain and technical agents collaborate

### PWA Specialist Triggers
- Flag iOS-specific issues early
- Alert on service worker cache problems
- Check offline functionality on each deploy
- Monitor IndexedDB storage quota

### Periodization Specialist Triggers
- Suggest deload week when volume accumulates
- Alert when progressive overload stalls
- Recommend program changes at mesocycle end

### Progress Analyst Triggers
- Celebrate PRs with appropriate feedback
- Alert when performance declines (potential overtraining)
- Surface plateau patterns across exercises

### Audio Engineer Triggers
- Test audio on iOS Safari after changes
- Validate timer sound sequences
- Check volume levels and user preferences

---

## SetFlow Context (All Agents)

### Product Vision
- **Purpose**: Track gym workouts with progressive overload
- **Target**: Fitness enthusiasts who need offline access
- **USP**: Works on gym floor (offline, large buttons, audio cues)

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| React | React 19 |
| UI | shadcn/ui, Tailwind CSS v4 |
| Animations | Framer Motion |
| Storage | IndexedDB (Dexie.js) |
| PWA | @ducanh2912/next-pwa |
| Charts | Recharts |
| Audio | Web Audio API |
| Auth | Clerk |
| Hosting | Vercel |

### Design System
- **Theme**: Dark-first only (#0A0A0A background)
- **Accent**: Lime (#CDFF00) for CTAs, timers, highlights
- **Touch targets**: 44x44px minimum, 56px for workout CTAs
- **Fonts**: Inter, system fallback

### Core Concepts
- **Superset**: A/B exercise pairs (e.g., A1/A2, B1/B2)
- **Tempo**: T:XYZW notation (eccentric-pause-concentric-pause)
- **Progressive Overload**: Auto-suggest weight increases
- **Training Day**: Named workout (e.g., "Day 1: Full Body A")

### Training Modalities Covered
| Modality | Primary Agent |
|----------|---------------|
| Strength/Hypertrophy | Periodization Specialist |
| Endurance/Cardio | Progress Analyst |
| Mobility/Recovery | Movement Specialist |
| Action Sports | Action Sports Coach |

---

## Collaboration Matrix

| Agent | Collaborates With |
|-------|-------------------|
| **SetFlow Lead** | All agents |
| **Software Engineer** | Frontend, Database, PWA, Sync, Debugger |
| **Frontend Specialist** | Engineer, Audio, Database, Sync |
| **PWA Specialist** | Engineer, Database, Sync, Audio |
| **Database Specialist** | Engineer, Frontend, PWA, Sync |
| **Sync Specialist** | Database, PWA, Debugger, Engineer |
| **Debugger** | All technical agents |
| **Periodization Specialist** | Movement, Injury, Progress |
| **Injury & Rehab Specialist** | Movement, Periodization |
| **Movement Specialist** | Periodization, Injury |
| **Action Sports Coach** | Periodization, Movement |
| **Progress Analyst** | Periodization, Database |
| **Audio Engineer** | PWA, Frontend |
| **PRD Specialist** | All agents (for requirements) |

---

## Key Files Reference

| Agent | Key Files |
|-------|-----------|
| Software Engineer | `/src/app/`, `/src/lib/`, `/src/components/` |
| Frontend Specialist | `/src/components/`, `/src/app/globals.css` |
| PWA Specialist | `next.config.ts`, `/public/manifest.json` |
| Database Specialist | `/src/lib/db.ts`, `/src/data/` |
| Sync Specialist | `/src/lib/sync.ts`, `/src/app/api/sync/`, `/src/components/sync/` |
| Audio Engineer | `/src/lib/audio.ts`, `/public/sounds/` |
| Periodization Specialist | `/src/data/programs/`, `/src/lib/programs.ts` |
| Movement Specialist | `/src/data/exercises.json` |
| Progress Analyst | `/src/lib/db.ts` (stats functions), `/src/app/stats/` |
| PRD Specialist | `/docs/prds/` |

---

## Quality Standards

### Technical Agents
- All code must work offline-first
- Touch targets minimum 44x44px
- Dark theme only (no light mode)
- 60fps animations
- iOS PWA quirks handled

### Fitness Domain Agents
- Exercise form cues backed by sports science
- Progressive overload follows evidence-based principles
- Injury modifications are conservative (when in doubt, modify)
- Action sports programs match seasonal timing

### Pattern Enforcement
- All agents must check `/docs/patterns/` before implementation
- Reference specific patterns when reviewing code
- Propose new patterns when repeated approaches emerge
- Use pattern format: when to use, implementation, gotchas, testing

### All Agents
- Document decisions in `/docs/decisions/`
- Update CHANGELOG.md for significant changes
- Reference PRDs for feature requirements
- Escalate to AduOS agents when outside project scope

---

## Claude Code Processing Expectations

How Claude Code should load and process agent context:

| Task Type | Agents to Load | Context Priority |
|-----------|---------------|------------------|
| UI component work | Frontend Specialist, Audio Engineer | Components CLAUDE.md first |
| Database operations | Database Specialist, Sync Specialist | lib/CLAUDE.md first |
| Bug investigation | Debugger + relevant domain agent | patterns/ first |
| New feature | PRD Specialist -> relevant specialists | Check PRDs first |
| PWA issues | PWA Specialist, Audio Engineer | public/CLAUDE.md first |
| Program design | Periodization + Movement Specialists | data/CLAUDE.md first |
| Performance issue | Frontend Specialist, Software Engineer | Profiling patterns |

### Context Loading Order
1. Read `/CLAUDE.md` (project overview)
2. Read `/agents/CLAUDE.md` (this file - routing)
3. Read domain-specific CLAUDE.md based on task
4. Load relevant pattern files
5. Check existing PRDs if feature work

### Agent Invocation Format
When invoking an agent mindset:

```
Acting as [Agent Name]:
- Primary responsibility: [from roster]
- Key files: [from key files reference]
- Quality standards: [from quality standards section]
- Collaborators: [from collaboration matrix]
```

---

*SetFlow Agent Team | 14 Agents | Updated: January 4, 2026*
