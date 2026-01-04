# Roadmap Governance - SetFlow

## Purpose

This folder tracks feature development priorities and build order.

## How to Use

1. **Before building** - Check if feature is on the roadmap
2. **Planning features** - Add to roadmap with priority and dependencies
3. **During development** - Mark features in progress
4. **After completion** - Move to completed section

## Roadmap Structure

```markdown
## Current Sprint
- [ ] Feature A - In progress
- [ ] Feature B - Blocked by A

## Backlog
- [ ] Feature C - Low priority
- [ ] Feature D - Nice to have

## Completed
- [x] Feature E - v0.9.0
```

## Priority Levels

| Priority | Meaning |
|----------|---------|
| P0 | Must ship - critical path |
| P1 | Should ship - core value |
| P2 | Could ship - nice to have |
| P3 | Someday - future consideration |

## Feature Dependencies

Track what blocks what:
- Sync requires auth (Clerk)
- PR celebration requires gamification system
- Weight suggestions require workout history

## PRD Linkage

Each major feature should have a PRD:
- Location: `/docs/prds/[feature-name].md`
- Create via `/create-prd` command

## Related Files

- `/docs/prds/` - Feature specifications
- `/CHANGELOG.md` - Completed feature history
- `/docs/patterns/` - Implementation patterns

---

## Sprint Planning

### Current Sprint Format
```markdown
## Sprint: [Name] (YYYY-MM-DD to YYYY-MM-DD)

### Goals
1. [Primary goal]
2. [Secondary goal]

### In Progress
- [ ] [P0] Feature A - @agent - 50%
- [ ] [P1] Feature B - @agent - blocked

### Completed This Sprint
- [x] Feature C - shipped YYYY-MM-DD

### Blocked
- Feature B: Waiting on [dependency]

### Notes
- [Observations, learnings]
```

### Sprint Length
- Default: 2 weeks
- Shorter sprints for urgent fixes
- Longer sprints for major features

---

## Version Milestone Format

```markdown
## v1.0.0 - [Codename] (Target: YYYY-MM-DD)

### Must Have (P0)
- [ ] Core feature 1
- [ ] Core feature 2

### Should Have (P1)
- [ ] Enhancement 1
- [ ] Enhancement 2

### Nice to Have (P2)
- [ ] Polish item 1

### Release Criteria
- [ ] All P0 features complete
- [ ] Offline mode tested
- [ ] iOS PWA verified
```

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | SetFlow Lead (prioritization) |
| **Collaborators** | PRD Specialist (requirements), Software Engineer (estimates) |

---

*SetFlow Roadmap System | Updated: January 4, 2026*
