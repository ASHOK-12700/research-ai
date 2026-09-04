---
name: create-skill
description: 'Create a reusable SKILL.md from a conversation or workflow. Use for extracting repeatable steps, clarifying scope, drafting the skill, and iterating it into a final reusable workflow.'
argument-hint: 'What workflow should this skill capture?'
user-invocable: true
disable-model-invocation: false
---

# Create Skill

## When to Use
- A conversation reveals a repeatable workflow that should become a reusable skill.
- The task needs a `SKILL.md` with clear triggers, steps, decision points, and completion checks.
- The user wants a skill that can be invoked again for the same kind of work.

## Procedure
1. Review the conversation for the repeated process being followed.
2. Generalize that process into reusable steps.
3. Extract decision points, branching logic, and quality criteria.
4. If the workflow is ambiguous, ask only the minimum questions needed:
   - What outcome should the skill produce?
   - Is it workspace-scoped or personal?
   - Should it be a quick checklist or a full multi-step workflow?
5. Draft the `SKILL.md` with strong discovery language in `description` and a clear `argument-hint`.
6. Save the skill in the correct location and keep the body focused on procedure, not background.
7. Validate the frontmatter and ensure the `name` matches the folder name.
8. Identify the weakest or most ambiguous parts and ask about those next.
9. Once finalized, summarize what the skill does, suggest a few example prompts, and propose related customizations to create next.

## Quality Checks
- The skill should be reusable without the original conversation.
- The description should include the trigger phrases a future agent would search for.
- The procedure should be concrete enough to execute without extra context.
- The skill should stop at the right time and not absorb unrelated tasks.

## Good Output Shape
A strong skill usually includes:
- A short description of the outcome.
- Clear triggers for when to use it.
- A step-by-step workflow.
- Decision points for ambiguity.
- Completion checks.
