# PRD: SetFlow Agent Architecture

**Status**: Complete
**Created**: 2026-01-01
**Author**: SetFlow Lead + PRD Specialist

---

## 1. Problem Statement

- **What problem does this solve?** SetFlow lacked AI agent governance, meaning development decisions were ad-hoc without specialized domain expertise.
- **Who experiences this problem?** Developers working on SetFlow needed clear guidance on fitness domain logic and technical implementation patterns specific to PWAs.
- **How severe is the problem?** Medium-high - without structured agent support, features could miss fitness best practices or technical patterns specific to PWAs.

---

## 2. Solution

Implement a comprehensive 13-agent architecture for SetFlow organized in 4 tiers:

- **Tier 0 (Orchestration)**: SetFlow Lead - coordinates routing and decisions
- **Tier 1 (Technical)**: 5 agents covering full-stack engineering, frontend, PWA, database, and debugging
- **Tier 2 (Fitness Domain)**: 6 agents covering periodization, injury/rehab, movement, action sports, progress analysis, and audio engineering
- **Tier 3 (Support)**: 1 PRD specialist agent for feature specifications

Additionally, create 3 reusable skills (Exercise Creation, Program Creation, Progression Logic) and technical architecture documentation.

This follows the AduOS hybrid model where SetFlow-specific agents handle project-scoped work, and AduOS core agents (Wellness Director, Fitness Coach, Technical Lead, etc.) provide expertise outside project scope.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Agents created | 13 | Count agent .md files in `/agents/` |
| Skills created | 3 | Count skill .md files in `/skills/` |
| Documentation created | 2 (architecture + PRD) | Verify files exist |
| CLAUDE.md updated | Agent section present | Read CLAUDE.md |
| Routing rules defined | All task types covered | Verify routing table in agents/CLAUDE.md |
| AduOS integration | Hybrid model documented | Verify AduOS section in agents/CLAUDE.md |

---

## 4. Requirements

### Must Have - COMPLETED
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

### Won't Have (v2)
- Agent learning from past decisions
- User preference integration in routing
- Agent collaboration visualization

---

## 5. User Flows

### Flow A: Task Routing via SetFlow Lead
1. Developer describes a task (e.g., "Add a new exercise to the database")
2. SetFlow Lead reads the task description
3. SetFlow Lead consults routing rules in agents/CLAUDE.md
4. Appropriate agent(s) identified (e.g., Movement Specialist then Database Specialist)
5. Agent(s) provide guidance based on their domain expertise
6. Developer implements following the agent's recommendations

### Flow B: Multi-Agent Workflow
1. Developer reports a bug (e.g., "Audio not playing on iOS")
2. SetFlow Lead routes to Audio Engineer (primary) + PWA Specialist (secondary)
3. Audio Engineer checks Web Audio API context and configuration
4. PWA Specialist checks iOS-specific quirks and workarounds
5. Combined recommendation provided to developer

### Flow C: Skill Execution
1. Developer needs to add a new exercise
2. Developer invokes Exercise Creation skill
3. Skill defines step-by-step workflow: validate muscle groups, check form cues, create JSON entry
4. Movement Specialist consulted for form cue accuracy
5. Database Specialist consulted for schema compliance
6. Exercise added to exercises.json following the workflow

---

## 6. Design

### Wireframes

```
Agent Architecture (Documentation-only, no UI):

                    ┌──────────────────┐
                    |   SetFlow Lead   |
                    |  (Orchestrator)  |
                    └────────┬─────────┘
                             |
     ┌───────────────────────┼───────────────────────┐
     |                       |                       |
     v                       v                       v
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
|  TECHNICAL  |      |   FITNESS   |      |   SUPPORT   |
|  (5 agents) |      |  (6 agents) |      |  (1 agent)  |
└─────────────┘      └─────────────┘      └─────────────┘
| Engineer    |      | Periodization|     | PRD Spec    |
| Frontend    |      | Injury/Rehab |     └─────────────┘
| PWA         |      | Movement     |
| Database    |      | Action Sports|
| Debugger    |      | Progress     |
└─────────────┘      | Audio        |
                     └─────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| (No UI components) | - | Documentation-only enhancement |

### Visual Spec

No visual changes to the app. All deliverables are Markdown documentation files in the project repository.

---

## 7. Technical Spec

### Agent File Schema

```typescript
// Each agent .md file follows this structure:
interface AgentDefinition {
  name: string;           // Agent display name
  tier: 0 | 1 | 2 | 3;  // Organizational tier
  role: string;           // One-line purpose description
  expertise: string[];    // Domain areas
  keyFiles: string[];     // Files this agent works with
  invocationTriggers: string[]; // When to invoke this agent
  collaborators: string[];     // Other agents it works with
  aduosIntegration?: string;   // Link to AduOS parent agent
}
```

### Routing Rules Schema

```typescript
interface RoutingRule {
  taskType: string;       // e.g., "new-exercise", "pwa-bug", "program-design"
  primaryAgent: string;   // First agent to consult
  secondaryAgents: string[]; // Supporting agents
  skill?: string;         // Associated skill if applicable
}
```

### Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `agents/CLAUDE.md` | ~340 | Orchestration rules |
| `agents/setflow-lead.md` | ~200 | Tier 0 orchestrator |
| `agents/software-engineer.md` | ~250 | Full-stack development |
| `agents/frontend-specialist.md` | ~320 | React/UI specialist |
| `agents/pwa-specialist.md` | ~280 | Offline-first expert |
| `agents/database-specialist.md` | ~300 | Dexie.js specialist |
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

### Files Modified

| File | Change |
|------|--------|
| `CLAUDE.md` | Added agent architecture section with tier overview |

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] AduOS agent patterns (`/agents/` in root) available for reference
- [x] Project codebase understanding (completed during exploration)
- [x] CLAUDE.md structure established
- [ ] None blocking

### Build Order

**Phase 1: Foundation (Complete)**
1. [x] Create `agents/CLAUDE.md` with full orchestration rules
2. [x] Create `agents/setflow-lead.md` as Tier 0 orchestrator
3. [x] Update main `CLAUDE.md` with agent architecture section

**Phase 2: Technical Agents (Complete)**
4. [x] Create `software-engineer.md`
5. [x] Create `frontend-specialist.md`
6. [x] Create `pwa-specialist.md`
7. [x] Create `database-specialist.md`
8. [x] Create `debugger.md`

**Phase 3: Fitness Domain Agents (Complete)**
9. [x] Create `periodization-specialist.md`
10. [x] Create `injury-rehab-specialist.md`
11. [x] Create `movement-specialist.md`
12. [x] Create `action-sports-coach.md`
13. [x] Create `progress-analyst.md`
14. [x] Create `audio-engineer.md`

**Phase 4: Support + Skills (Complete)**
15. [x] Create `prd-specialist.md`
16. [x] Create `skills/exercise-creation.md`
17. [x] Create `skills/program-creation.md`
18. [x] Create `skills/progression-logic.md`
19. [x] Create `skills/CLAUDE.md`

**Phase 5: Documentation (Complete)**
20. [x] Create `docs/architecture.md`
21. [x] Create this PRD

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Task doesn't match any routing rule | SetFlow Lead handles directly, escalates to AduOS Technical Lead if needed |
| Multiple agents disagree on approach | SetFlow Lead arbitrates, documents decision |
| Agent file becomes outdated | Regular review during CLAUDE.md maintenance cycles |
| New technology added to stack | Create new agent or update existing agent's expertise |
| AduOS agent unavailable | SetFlow agents can handle most tasks independently |
| Task spans multiple tiers | SetFlow Lead coordinates multi-agent workflow |

---

## 10. Testing

### Functional Tests
- [x] All 13 agent files exist and have valid YAML frontmatter
- [x] Routing table covers all common task types
- [x] Each agent has defined expertise, key files, and collaboration patterns
- [x] Skills have clear inputs, outputs, and workflow steps
- [x] AduOS integration section documents all cross-project agents

### UI Verification
- No UI changes - this is documentation only
- [x] agents/CLAUDE.md is readable and well-structured
- [x] Main CLAUDE.md agent section is accurate
- [x] All agent file cross-references are valid

---

## 11. Launch Checklist

- [x] All 13 agent .md files created
- [x] 3 skill .md files created
- [x] agents/CLAUDE.md orchestration document complete
- [x] docs/architecture.md created
- [x] Main CLAUDE.md updated with agent section
- [x] Routing rules cover all task types
- [x] AduOS hybrid model documented
- [x] No application code changes (documentation only)

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent files become stale | Incorrect guidance given | Review agents during project milestone reviews |
| Over-engineering for a single-developer project | Wasted effort maintaining docs | Keep agent files lean, update only when needed |
| Routing ambiguity for complex tasks | Wrong agent consulted | SetFlow Lead arbitrates, refine routing rules over time |
| AduOS agent changes break integration | Hybrid model breaks | Version-pin AduOS agent references, update on major changes |
| Too many agents slow down decision-making | Analysis paralysis | Default to SetFlow Lead for quick decisions |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| AduOS agent patterns | Available | Referenced for structure and conventions |
| Project codebase | Explored | Agent expertise mapped to actual files |
| CLAUDE.md hierarchy | Established | Agents fit into existing documentation structure |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Initial PRD created |
| 2026-01-01 | All 21 files created, PRD marked complete |
| 2026-03-26 | PRD quality audit: added missing sections (solution, user flows, design diagram, technical spec with schemas, implementation plan with build order, edge cases table, testing checklists, launch checklist, risks & mitigations, dependencies), reformatted to 14-section standard |
