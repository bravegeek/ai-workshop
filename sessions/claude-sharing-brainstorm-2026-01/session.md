# Sharing .claude Directory Across Repos

**Date:** 2026-01-16

## Goal

Reuse agents and shared data in `.claude` directory across multiple git repos while only maintaining it in one place.

## Constraints

- **Repository Landscape:** Handful of personal projects (2-5 repos)
- **Update Pattern:** Bidirectional sync needed (changes in any repo should propagate)
- **Customization Needs:** Mostly shared with occasional repo-specific agents/configs

## Options Evaluated

### Option 1: Git Submodule

Create a separate repo for shared content, embed as submodule in each project.

**Structure:**
```
project/
├── .claude/
│   ├── .claude-shared/        # submodule
│   │   ├── agents/
│   │   └── shared/
│   ├── agents/                # symlinks to submodule
│   └── settings.local.json    # repo-specific
```

**Pros:**
- Version controlled with full history
- Explicit sync points
- Can pin specific versions

**Cons:**
- Bidirectional sync is clunky (must cd into submodule, commit, push, then update parent)
- Symlinks add indirection
- Submodules are confusing
- Easy to forget to push submodule changes

### Option 2: Rsync Script

Keep one "master" repo and use a script to sync changes.

**Pros:**
- Simple mental model
- Fast, no nested git repos
- Easy to exclude repo-specific files

**Cons:**
- Last-write-wins (could lose changes)
- No conflict resolution
- Requires manual script execution

### Option 3: Bare Git Repo (RECOMMENDED)

The `.claude` directory itself is a git repo that pushes/pulls to a central bare repo.

**Structure:**
```
~/dev/.claude-shared.git/     # bare repo (hub)

project-a/.claude/            # working clone
project-b/.claude/            # working clone
```

**Pros:**
- Simplest bidirectional workflow (standard git commands)
- Full merge/conflict resolution
- Complete history
- No symlinks or nested complexity

**Cons:**
- Nested git repo (parent must .gitignore it)
- .claude changes not tracked with project history
- Merge conflicts possible if editing same file before syncing

## Decision

**Bare Git Repo** - best fit for bidirectional sync with minimal friction.

## Implementation

See `.claude/README.md` for setup instructions.
