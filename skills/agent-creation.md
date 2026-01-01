---
name: agent-creation
type: skill
description: Create new agents for SetFlow with consistent structure and proper integration.
agents: [setflow-lead, prd-specialist]
---

# Skill: Agent Creation

Create new agents for SetFlow with consistent structure, proper frontmatter, and integration into the orchestration system.

---

## Purpose

Standardize the process of adding agents to ensure:
- Consistent YAML frontmatter format
- Unique color assignment
- Proper tool selection
- Integration with routing rules
- Cross-reference updates

---

## When to Use

- Adding a new specialist agent
- Splitting an existing agent into multiple
- Creating domain-specific expertise

---

## Agent Frontmatter Template

```yaml
---
name: [kebab-case-name]
description: |
  [One-line description for SetFlow.]
  <example>
  Context: [When to use]
  user: "[Example user request]"
  assistant: "[How assistant invokes this agent]"
  </example>
color: "#[unique-hex-color]"
model: claude-haiku
tools: [Tool1, Tool2, Tool3]
---
```

---

## Workflow Steps

### Step 1: Define Agent Scope
```
Answer:
- What specific expertise does this agent provide?
- What tier does it belong to? (Technical, Domain, Support)
- What existing agents does it collaborate with?
- What AduOS agents might it escalate to?
```

### Step 2: Assign Unique Color
```
Check existing colors in agents/*.md:
  grep "^color:" *.md | sort | uniq

Pick from unused palette:
  #2ecc71 (emerald)
  #3498db (blue) - if available
  #9b59b6 (purple)
  #e74c3c (red)
  #f39c12 (orange)
  #1abc9c (teal)
  #34495e (gray-blue)
  #d35400 (pumpkin)
  #c0392b (dark red)
  #7f8c8d (gray)
```

### Step 3: Select Tools
```
Common tool sets by tier:

Technical: Read, Write, Edit, Bash, Glob, Grep
Domain (read-heavy): Read, Glob, Grep, WebSearch, WebFetch
Support: Read, Write, Edit, Glob, Grep
Orchestrator: All tools + model: claude-sonnet
```

### Step 4: Write Agent File
```
Create /agents/[agent-name].md with:
- YAML frontmatter (from template)
- Role section
- Core Responsibilities
- Collaboration Patterns table
- When to Invoke section
- Key Files section
- Quality Standards
- Behavioral Rules
```

### Step 5: Update Orchestration
```
Edit /agents/CLAUDE.md:
1. Add to Agent Roster table
2. Add to Task Routing Rules
3. Add to Collaboration Matrix
4. Add to Key Files Reference
```

### Step 6: Update Main CLAUDE.md
```
If agent is significant, add to:
- Agent Team section
- Appropriate tier table
```

---

## Quality Checklist

- [ ] Frontmatter has all required fields (name, description, color, model, tools)
- [ ] Color is unique across all agents
- [ ] Description includes example invocation
- [ ] Collaboration patterns reference real agents
- [ ] Key files point to existing paths
- [ ] Agent is added to CLAUDE.md roster
- [ ] Routing rules updated

---

## Example: Adding "Nutrition Coach" Agent

### Frontmatter
```yaml
---
name: nutrition-coach
description: |
  Nutrition timing and workout fuel expert for SetFlow.
  <example>
  Context: Pre-workout nutrition
  user: "What should I eat before a heavy leg day?"
  assistant: "I'll invoke the Nutrition Coach for pre-workout fueling recommendations."
  </example>
color: "#27ae60"
model: claude-haiku
tools: Read, Glob, WebSearch
---
```

### Orchestration Update
```markdown
| **Nutrition Coach** | `nutrition-coach.md` | Pre/post workout nutrition, hydration |
```

---

*Agent Creation Skill | SetFlow | Created: January 1, 2026*
