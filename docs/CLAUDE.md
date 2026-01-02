# Documentation Rules - SetFlow (Gym-Tracker)

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
- `/docs/architecture.md` - System design
- `/agents/` - AI agent definitions
- `/skills/` - Reusable workflows
- `/data/` - Static data (exercises, programs, achievements)
