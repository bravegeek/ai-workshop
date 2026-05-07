---
description: Archive a completed OpenSpec change
---

Archive a completed OpenSpec change.

**Input**: If no change name is provided, run `openspec list --json` and ask which change to archive.

**Steps**:

1. Run `openspec status --change "<name>" --json` to check artifact completion.
2. Read the tasks file and count incomplete tasks (`- [ ]`).
3. Check for delta specs at `openspec/changes/<name>/specs/`. If they exist, compare with main specs and ask whether to sync before archiving.
4. Warn about any incomplete artifacts or tasks, get user confirmation, then proceed.
5. Move the change to the archive:
   ```
   mkdir -p openspec/changes/archive
   mv openspec/changes/<name> openspec/changes/archive/$(date +%Y-%m-%d)-<name>
   ```
6. Display summary: change name, schema, archive location, spec sync status, any warnings.
