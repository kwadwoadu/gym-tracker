# PRD: SetFlow Agent Architecture

## Summary

Implement a comprehensive 13-agent architecture for SetFlow, the gym workout tracking PWA. This enhancement adds project-specific AI agents covering technical implementation, fitness domain expertise, and project support, following the AduOS hybrid model.

---

## Problem Statement

- **What problem does this solve?** SetFlow lacked AI agent governance, meaning development decisions were ad-hoc without specialized domain expertise.
- **Who experiences this problem?** Developers working on SetFlow needed clear guidance on fitness domain logic and technical implementation patterns.
- **How severe is the problem?** Medium-high - without structured agent support, features could miss fitness best practices or technical patterns specific to PWAs.

---

## User Stories

- As a developer, I want clear agent routing so I know which specialist to consult for different tasks.
- As a fitness feature developer, I want domain expert guidance so exercises and programs follow evidence-based principles.
- As a PWA developer, I want iOS-specific expertise so the app works reliably on iOS devices.
- As a project manager, I want organized agent workflows so multi-agent tasks complete efficiently.

---

## Requirements

### Must Have (MVP) - COMPLETED

- [x] Tier 0: SetFlow Lead orchestrator agent
- [x] Tier 1: 5 technical agents (Engineer, Frontend, PWA, Database, Debugger)
- [x] Tier 2: 6 fitness domain agents (Periodization, Injury, Movement, Action Sports, Progress, Audio)
- [x] Tier 3: 1 support agent (PRD Specialist)
- [x] Orchestration document with routing rules
- [x] AduOS integration (hybrid model)
- [x] 3 reusable skills (Exercise Creation, Program Creation, Progression Logic)
- [x] Technical architecture documentation
- [x] Main CLAUDE.md updated with agent section

### Should Have (v1)

- [ ] Agent invocation examples in each agent file
- [ ] Automated agent selection based on task keywords
- [ ] Cross-agent workflow templates
- [ ] Agent performance tracking

### Nice to Have (v2)

- [ ] Agent learning from past decisions
- [ ] User preference integration in routing
- [ ] Agent collaboration visualization

---

## Acceptance Criteria

### Orchestration Document
- [x] Contains all 13 agents with roles
- [x] Routing rules by task type
- [x] AduOS integration documented
- [x] Multi-agent workflows defined
- [x] Collaboration matrix included

### Technical Agents (Tier 1)
- [x] Each agent has YAML frontmatter
- [x] Contains project-specific context
- [x] Includes relevant code patterns
- [x] Documents key files they work with
- [x] Defines collaboration patterns

### Fitness Domain Agents (Tier 2)
- [x] Contains evidence-based methodologies
- [x] Includes practical examples
- [x] Documents training modalities covered
- [x] Defines when to invoke

### Skills
- [x] Each skill has clear inputs/outputs
- [x] Workflow steps are ordered
- [x] Agent responsibilities defined
- [x] Concrete examples provided
- [x] Error handling documented

---

## Technical Considerations

### Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `agents/CLAUDE.md` | ~340 | Orchestration rules |
| `agents/setflow-lead.md` | ~200 | Tier 0 orchestrator |
| `agents/engineer.md` | ~250 | Full-stack development |
| `agents/frontend.md` | ~320 | React/UI specialist |
| `agents/pwa-specialist.md` | ~280 | Offline-first expert |
| `agents/database.md` | ~300 | Dexie.js specialist |
| `agents/debugger.md` | ~280 | Bug investigation |
| `agents/periodization-specialist.md` | ~380 | Program design |
| `agents/injury-rehab-specialist.md` | ~300 | Injury modifications |
| `agents/movement-specialist.md` | ~330 | Form and mobility |
| `agents/action-sports-coach.md` | ~350 | Sport-specific training |
| `agents/progress-analyst.md` | ~320 | Data analysis |
| `agents/audio-engineer.md` | ~370 | Web Audio API |
| `agents/prd-specialist.md` | ~280 | Feature specs |
| `skills/CLAUDE.md` | ~80 | Skills index |
| `skills/exercise-creation.md` | ~280 | Add exercises workflow |
| `skills/program-creation.md` | ~320 | Build programs workflow |
| `skills/progression-logic.md` | ~340 | Overload rules workflow |
| `docs/architecture.md` | ~350 | Technical architecture |
| `docs/prds/agent-architecture.md` | This file | PRD for enhancement |
| `CLAUDE.md` (updated) | +60 | Agent section added |

### No Database Changes
This is documentation-only - no code changes to the application.

### No PWA Implications
Agent files are not deployed with the app.

---

## Dependencies

- AduOS agent patterns (`/agents/` in root)
- PropFinder reference implementation (`/projects/owned/propfinder/`)
- Project codebase understanding (completed during exploration)

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Agents created | 13 | Complete |
| Skills created | 3 | Complete |
| Docs created | 2 | Complete |
| CLAUDE.md updated | Yes | Complete |
| Routing rules defined | Yes | Complete |
| AduOS integration | Yes | Complete |

---

## Out of Scope

- Implementing agent invocation code
- Automated agent selection (future enhancement)
- Agent analytics/tracking
- Changes to application codebase

---

## Implementation Summary

### Phase 1: Foundation (Complete)
- Created `agents/CLAUDE.md` with full orchestration rules
- Created `agents/setflow-lead.md` as Tier 0 orchestrator
- Updated main `CLAUDE.md` with agent architecture section

### Phase 2: Technical Agents (Complete)
- Created 5 technical specialists:
  - `engineer.md` - Full-stack Next.js 15
  - `frontend.md` - React 19, shadcn/ui, dark theme
  - `pwa-specialist.md` - Offline-first, iOS quirks
  - `database.md` - Dexie.js, IndexedDB
  - `debugger.md` - Systematic bug investigation

### Phase 3: Fitness Domain Agents (Complete)
- Created 6 fitness domain experts:
  - `periodization-specialist.md` - Program design, progressive overload
  - `injury-rehab-specialist.md` - Modifications, rehab protocols
  - `movement-specialist.md` - Form cues, mobility
  - `action-sports-coach.md` - Snowboard/surf/ski conditioning
  - `progress-analyst.md` - Data analysis, plateau detection
  - `audio-engineer.md` - Web Audio API, timer sounds

### Phase 4: Support & Skills (Complete)
- Created `agents/prd-specialist.md` for feature specs
- Created 3 skills:
  - `exercise-creation.md` - Add exercises to library
  - `program-creation.md` - Build training programs
  - `progression-logic.md` - Define overload rules
- Created `skills/CLAUDE.md` as skills index

### Phase 5: Documentation (Complete)
- Created `docs/architecture.md` with technical overview
- Created this PRD as documentation of the enhancement

---

## Open Questions

None - all requirements have been implemented.

---

**Status**: Complete
**Created**: January 1, 2026
**Author**: SetFlow Lead + PRD Specialist
**Implemented By**: Claude Code

---

## Changelog

| Date | Change |
|------|--------|
| Jan 1, 2026 | Initial PRD created |
| Jan 1, 2026 | All 21 files created, PRD marked complete |
