---
description: Implement tasks from an OpenSpec change
---

Implement tasks from an OpenSpec change.

**Input**: If no change name is provided, run `openspec list --json` and ask which change to work on.

**Steps**:

1. Run `openspec status --change "<name>" --json` to understand the schema and artifact state.
2. Run `openspec instructions apply --change "<name>" --json` to get context file paths and the task list.
3. Read all context files (proposal, specs, design, tasks).
4. Show current progress and remaining tasks.
5. Implement each pending task, one at a time:
   - Announce which task you're working on
   - Make the minimal code changes needed
   - Mark the task complete: `- [ ]` → `- [x]` in the tasks file
   - Move to the next task
6. Pause if a task is unclear, an error occurs, or a design issue surfaces — ask, don't guess.
7. On completion, show tasks completed and overall progress. If all done, suggest `/opsx-archive`.
