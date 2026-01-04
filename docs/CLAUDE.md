# Documentation Rules - SetFlow (Gym-Tracker)

> Governance for PRDs, patterns, and documentation standards

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | PRD Specialist |
| **Collaborators** | Software Engineer (patterns), SetFlow Lead (decisions) |

---

## PRD Requirements
Every feature needs a PRD in /docs/prds/ with:
- Problem statement
- Proposed solution
- Technical implementation
- Implementation checklist with [ ] items
- Launch criteria (what must be true before shipping)

## Existing PRDs
- `onboarding-flow.md` - 8-step onboarding (Complete)
- `weight-memory-edit-sets.md` - Progressive overload (In Progress)
- `workout-plan-selection.md` - Program templates
- `cross-browser-sync-domain.md` - Sync architecture
- `exercise-database.md` - Exercise management

## Changelog Updates
- Update CHANGELOG.md for every significant change
- Use conventional commits: feat:, fix:, chore:
- Include date and brief description

## When Adding Features
1. Create or update PRD first
2. Implement the feature
3. Test offline functionality
4. Test on iOS Safari (PWA quirks)
5. Update CHANGELOG.md
6. Verify launch criteria met

## Learning from Mistakes
When a bug is found:
1. Fix the bug
2. Add a rule to relevant CLAUDE.md to prevent recurrence
3. Example: "NEVER use X because it causes Y"

## PWA Testing Checklist
- [ ] Works completely offline
- [ ] Audio plays on iOS
- [ ] Installable on home screen
- [ ] Data persists after app close
- [ ] Session survives power loss

## Design System
- Dark theme (gym visibility)
- Colors: Lime accent on dark background
- Typography: System fonts for performance
- Animations: Framer Motion, 60fps target
- Touch: 44px minimum targets

## Key User Flows
1. **First Time**: Onboarding -> Plan Selection -> Home
2. **Workout**: Home -> Start -> Sets -> Rest -> Complete
3. **Progress**: Stats -> Charts -> PRs -> Achievements

## File Organization
- `/docs/prds/` - Feature specifications
- `/docs/patterns/` - Reusable implementation patterns
- `/docs/architecture.md` - System design
- `/agents/` - AI agent definitions
- `/skills/` - Reusable workflows
- `/data/` - Static data (exercises, programs, achievements)

---

## Pattern System

Patterns in `/docs/patterns/` document proven implementations:

| Pattern | Key File |
|---------|----------|
| PWA Offline Sync | `/lib/api-client.ts`, `/app/api/sync/` |
| Audio Cue System | `/lib/audio.ts` |
| Local-First Data Model | `/lib/queries.ts`, `/prisma/schema.prisma` |
| Workout Session Lifecycle | `/lib/workout-helpers.ts` |
| Progressive Overload | `/lib/programs.ts` |

### When to Create New Patterns
- Implementation was non-obvious
- Same approach used in 3+ places
- Has gotchas that cost debugging time
- Required research or experimentation

### Pattern File Format
```markdown
# Pattern Name
## When to Use
## Core Principle
## Implementation (correct vs wrong)
## Files Using This Pattern
## Gotchas
## Testing
```

---

## Pattern Enforcement

### Before Implementation
1. Check `/docs/patterns/CLAUDE.md` for catalog
2. Read relevant pattern file fully
3. Follow "Correct Approach" exactly
4. Note any "Gotchas" that apply

### During Code Review
1. Verify patterns are followed
2. Flag deviations for discussion
3. Update pattern if improvement found

### After Bug Fix
1. Check if bug reveals pattern gap
2. Update or create pattern
3. Add rule to relevant CLAUDE.md

---

## Learning System

### Codify Knowledge After
- Debugging session > 30 minutes
- iOS-specific workaround discovered
- Third-party API integration
- Performance optimization
- User-reported issue resolved

### Where to Document

| Learning Type | Location |
|---------------|----------|
| Code pattern | `/docs/patterns/[name].md` |
| Anti-pattern | Relevant CLAUDE.md "Mistakes to Avoid" |
| Agent behavior | Agent file + `/agents/CLAUDE.md` |
| PRD insight | Update PRD with "Lessons Learned" |

---

## PRD Quality Standards

Every PRD must have:
- [ ] Clear problem statement
- [ ] Defined success metrics
- [ ] Technical implementation approach
- [ ] Implementation checklist with [ ] items
- [ ] Launch criteria (what must be true)
- [ ] Offline compatibility verified
- [ ] iOS PWA considerations

---

## Cross-References

| Resource | Location |
|----------|----------|
| Pattern catalog | `/docs/patterns/CLAUDE.md` |
| PRD files | `/docs/prds/` |
| Architecture | `/docs/architecture.md` |
| Roadmap | `/roadmap/CLAUDE.md` |

---

*Documentation Rules | Updated: January 4, 2026*
