---
description: Create a new change with proposal, design, and tasks in one step
---

Propose a new OpenSpec change and generate all artifacts.

**Input**: If no change name is provided after the command, ask: "What change do you want to work on? Describe what you want to build or fix." From their description, derive a kebab-case name.

**Steps**:

1. Run `openspec new change "<name>"` to scaffold the change directory.
2. Run `openspec status --change "<name>" --json` to get the artifact build order. Parse `applyRequires` to know which artifacts are needed.
3. Loop through artifacts in dependency order. For each:
   - Run `openspec instructions <artifact-id> --change "<name>" --json`
   - Read any completed dependency files for context
   - Create the artifact file using the `template` structure
   - **Do NOT copy** `context` or `rules` blocks into the output — those are constraints for you, not content
4. Continue until all `applyRequires` artifacts have `status: "done"`.
5. Show final status with `openspec status --change "<name>"`.

When done, summarize artifacts created and tell the user: "Ready for implementation — run /opsx-apply to start."
