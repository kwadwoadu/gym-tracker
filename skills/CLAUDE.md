# SetFlow Skills

Reusable workflows for SetFlow - the gym workout tracking PWA. Skills standardize common operations that span multiple agents.

---

## Skills Catalog

| Skill | Purpose | Key Agents |
|-------|---------|------------|
| **agent-creation** | Create new agents for SetFlow | SetFlow Lead, PRD Specialist |
| **exercise-creation** | Add new exercises to the library | Movement, Periodization, Database |
| **program-creation** | Build training programs | Periodization, Movement, Injury |
| **progression-logic** | Define overload rules | Periodization, Progress Analyst |

---

## Skill Format

Each skill file contains:
1. **Purpose** - What the skill accomplishes
2. **When to Use** - Trigger conditions
3. **Inputs** - Required information
4. **Steps** - Ordered workflow
5. **Outputs** - Deliverables
6. **Agents Involved** - Who participates
7. **Examples** - Concrete usage examples

---

## Using Skills

### Automatic Invocation
Skills are invoked automatically when the task matches the skill's purpose:
- "Add a new agent to the team" -> `agent-creation`
- "Add a new exercise" -> `exercise-creation`
- "Create a training program" -> `program-creation`
- "Set up progressive overload" -> `progression-logic`

### Manual Invocation
Reference skill directly:
```
Use the exercise-creation skill to add Romanian Deadlift
```

---

## Skill Governance

### Adding New Skills
1. Identify repetitive multi-agent workflows
2. Document inputs, steps, outputs
3. Create skill file in `/skills/`
4. Update this index

### Skill Quality Standards
- Clear step-by-step instructions
- Defined agent responsibilities
- Concrete examples
- Error handling guidance
- Success criteria

---

## Related AduOS Skills

SetFlow can leverage core AduOS skills for common operations:

| AduOS Skill | When to Use |
|-------------|-------------|
| `task-management` | Tracking feature work in master.csv |
| `systematic-debugging` | 4-phase debug framework |
| `brainstorming` | Refining feature ideas |

---

*SetFlow Skills | 4 Skills | Created: January 1, 2026*
