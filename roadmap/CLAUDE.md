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

*SetFlow Roadmap System*
