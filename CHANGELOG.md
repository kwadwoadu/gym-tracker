# SetFlow Changelog

All notable changes to the SetFlow project.

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
