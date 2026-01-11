# Patterns Layer - SetFlow

> Proven implementation patterns for reuse across the codebase

## Purpose

Document non-obvious implementations that should be reused. Patterns prevent reinventing solutions and capture hard-won knowledge from debugging sessions.

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Software Engineer, PRD Specialist |
| **Collaborators** | All technical agents |

---

## Pattern Catalog

| Pattern | File | Key Insight |
|---------|------|-------------|
| PWA Offline Sync | `pwa-offline-sync.md` | IndexedDB + service worker strategy |
| Audio Cue System | `audio-cue-system.md` | iOS-compatible Web Audio API |
| Local-First Data | `local-first-data.md` | Dexie.js schema and queries |
| Workout Session Lifecycle | `workout-session-lifecycle.md` | Session start/save/resume |
| Progressive Overload | `progressive-overload.md` | Weight suggestion algorithm |
| Stable Preset Identifiers | `stable-preset-identifiers.md` | builtInId for reliable ID mapping |
| @dnd-kit Drag Handle | `dnd-kit-drag-handle.md` | Isolate drag to grip icon only |
| Toast Notification | `toast-notification.md` | Simple local toast without library |
| Time-Period Grouping | `time-period-grouping.md` | Group activities by time, not category |

---

## When to Create a New Pattern

Create a pattern when ANY of these apply:

1. **Non-obvious implementation** - Solution required research or experimentation
2. **Repeated approach** - Same technique used in 3+ places
3. **Debugging cost** - Gotchas that cost significant debugging time
4. **Platform quirks** - iOS/Android/browser-specific workarounds
5. **Integration complexity** - Third-party API or library usage

### Examples That Warrant Patterns
- iOS AudioContext restrictions (took hours to debug)
- IndexedDB schema versioning (easy to break)
- Framer Motion exit animations (tricky timing)
- Service worker cache invalidation (subtle bugs)

### Examples That Don't Need Patterns
- Standard React component structure
- Basic Tailwind styling
- Simple CRUD operations
- Well-documented library usage

---

## Pattern File Format

Every pattern file must follow this structure:

```markdown
# Pattern Name

## When to Use
[Describe the problem this pattern solves]

## Core Principle
[One-sentence summary of the approach]

## Implementation

### Correct Approach
```typescript
// Working code example
```

### Wrong Approach
```typescript
// Anti-pattern to avoid
```

## Files Using This Pattern
- `/src/lib/[file].ts` - [How it's used]
- `/src/components/[component].tsx` - [How it's used]

## Gotchas
- [Pitfall 1 and how to avoid]
- [Pitfall 2 and how to avoid]

## Testing
[How to verify the pattern works correctly]
```

---

## Pattern Usage Workflow

### Before Implementing
1. Check this catalog for existing patterns
2. Read the full pattern file
3. Follow the "Correct Approach" exactly
4. Note any "Gotchas" that apply

### During Code Review
1. Verify patterns are followed correctly
2. Flag deviations for discussion
3. Update pattern if improvement found

### After Finding a Bug
1. Fix the bug
2. Check if it reveals a pattern gap
3. Update or create pattern documentation
4. Add rule to relevant CLAUDE.md

---

## Pattern Quality Checklist

A pattern is complete when:
- [ ] Problem it solves is clearly stated
- [ ] Core principle is one sentence
- [ ] Working code example provided
- [ ] Anti-pattern shown (what not to do)
- [ ] Files using the pattern are listed
- [ ] Gotchas are documented
- [ ] Testing approach is described

---

## Pattern Maintenance

### Updating Patterns
- Update when better approach is discovered
- Keep "Wrong Approach" for historical context
- Add new gotchas as they're discovered
- Expand file list when pattern spreads

### Deprecating Patterns
- Never delete patterns (may help debugging old code)
- Add "DEPRECATED" header with replacement
- Link to replacement pattern
- Keep for at least 6 months

---

## Cross-References

| Resource | Location |
|----------|----------|
| Documentation rules | `/docs/CLAUDE.md` |
| PRD process | `/docs/CLAUDE.md` |
| Agent patterns | `/agents/CLAUDE.md` |

---

*Created: January 4, 2026*
