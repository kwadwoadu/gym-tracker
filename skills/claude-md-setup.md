# Skill: CLAUDE.md System Setup

## Purpose

Set up or upgrade CLAUDE.md documentation system across a project codebase, ensuring every folder has appropriate documentation with consistent quality.

## When to Use

- New project needs CLAUDE.md system
- Existing project has incomplete/outdated CLAUDE.md files
- Major refactor changed file structure
- Adding new major feature areas

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| project_path | Yes | Root path of the project |
| reference_project | No | Project with good CLAUDE.md patterns to follow |
| scope | No | "full" (all folders) or "partial" (specific areas) |

## Steps

1. **Explore agent** scans codebase structure
   - List all directories
   - Identify existing CLAUDE.md files
   - Find directories missing CLAUDE.md

2. **Plan agent** creates implementation plan
   - Prioritize folders by importance
   - Group related upgrades
   - Estimate scope

3. **For each missing CLAUDE.md**, create with:
   - Purpose section
   - Agent Ownership table
   - Key Files/Structure
   - Rules/Patterns specific to that folder
   - Anti-patterns (what NOT to do)
   - Cross-References table

4. **For each existing CLAUDE.md**, upgrade with:
   - Agent Ownership (if missing)
   - Cross-References (if missing)
   - Verify file references are accurate
   - Add anti-patterns section

5. **Run `/review`** to catch:
   - Broken file references
   - Inconsistent counts/numbers
   - Missing cross-links

6. **Fix review issues** before committing

## Outputs

- CLAUDE.md file in every significant folder
- Consistent format across all files
- Accurate file references
- Agent ownership clarity
- Cross-reference navigation

## Success Criteria

- [ ] Every folder with code/docs has CLAUDE.md
- [ ] All files have Agent Ownership section
- [ ] All files have Cross-References section
- [ ] `/review` passes with no warnings
- [ ] File references point to existing files

## Quality Standards

### Required Sections

| Section | Purpose |
|---------|---------|
| Purpose | What this folder/layer does |
| Agent Ownership | Who owns this area |
| Key Files/Structure | What's in the folder |
| Rules/Patterns | How to work here |
| Anti-Patterns | What NOT to do |
| Cross-References | Related docs |

### CLAUDE.md Template

```markdown
# [Layer/Folder Name] - [Project Name]

> [One-line purpose]

## Purpose

[2-3 sentences explaining what this folder contains and why]

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | [Main responsible agent] |
| **Collaborators** | [Supporting agents] |

---

## Key Files

| File | Purpose |
|------|---------|
| `file.ts` | [What it does] |

---

## Rules

### Do
- [Correct approach 1]
- [Correct approach 2]

### Don't
- [Anti-pattern 1]
- [Anti-pattern 2]

---

## Cross-References

| Resource | Location |
|----------|----------|
| Related doc | `/path/to/doc` |

---

*Created: [Date]*
```

## Examples

### Trigger
"Set up CLAUDE.md system for gym-tracker project"

### Invocation
```
Using claude-md-setup skill:

1. Explore: Found 12 directories, 7 have CLAUDE.md, 5 missing
2. Plan: Create 5 new, upgrade 7 existing
3. Create: /src/components/, /src/data/, /prisma/, /public/, /docs/patterns/
4. Upgrade: Root, agents, docs, skills, roadmap, src/app, src/lib
5. Review: Found 3 warnings (file references)
6. Fix: Updated outdated references
7. Commit: All changes pushed
```

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | SetFlow Lead, PRD Specialist |
| **Collaborators** | Software Engineer (file references), All agents (ownership) |

---

*Created: January 4, 2026*
