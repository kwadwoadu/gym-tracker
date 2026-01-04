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

## Skill Invocation Examples

### Exercise Creation

**Trigger**: "Add Romanian Deadlift to the exercise library"

**Invocation**:
```
Using exercise-creation skill:

Input:
- Exercise name: Romanian Deadlift
- Equipment: barbell
- Primary muscles: hamstrings, glutes, erector_spinae

Steps:
1. Movement Specialist validates muscle groups and defines form cues
2. Periodization Specialist suggests default tempo (T:40A1), sets (3), reps (8-10)
3. Injury Specialist flags contraindications (l5_s1, hamstring injury)
4. Database Specialist adds to exercises.json
5. Frontend Specialist verifies card renders correctly

Output:
- Exercise added to /src/data/exercises.json
- Exercise card visible in /exercises page
```

### Program Creation

**Trigger**: "Create a 4-week snowboard prep program"

**Invocation**:
```
Using program-creation skill:

Input:
- Program name: Snowboard Prep
- Duration: 4 weeks
- Focus: lower body power, core stability, balance

Steps:
1. Action Sports Coach designs sport-specific requirements
2. Periodization Specialist structures 4-week mesocycle
3. Movement Specialist adds mobility exercises
4. Database Specialist creates /src/data/programs/snowboard-prep.json
5. Frontend Specialist adds to program selector

Output:
- Program file created
- Program appears in selection UI
```

---

## Creating New Skills

### When to Create a Skill

Create a new skill when:
- Same workflow repeats 3+ times
- Involves 3+ agents coordinating
- Has clear input/output structure
- Benefits from standardization

### Skill File Template

```markdown
# [Skill Name]

## Purpose
[What this skill accomplishes]

## When to Use
- [Trigger condition 1]
- [Trigger condition 2]

## Inputs
| Input | Required | Description |
|-------|----------|-------------|
| name | Yes | ... |
| option | No | ... |

## Steps
1. **Agent 1** does X
2. **Agent 2** does Y
3. **Agent 3** does Z

## Outputs
- [Deliverable 1]
- [Deliverable 2]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Examples
[Concrete example of skill in action]
```

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | SetFlow Lead (coordinates skill execution) |
| **Collaborators** | All agents (participate as needed) |

---

*SetFlow Skills | 4 Skills | Updated: January 4, 2026*
