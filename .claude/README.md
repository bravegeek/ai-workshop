# Shared .claude Configuration

This directory contains Claude Code agents and shared configurations that can be synced across multiple repositories using a bare git repo approach.

## Overview

Each project's `.claude` directory is an independent git repo that pushes/pulls to a central bare repo, enabling bidirectional sync with standard git commands.

```
~/dev/.claude-shared.git/     # bare repo (central hub)

project-a/.claude/            # working clone
project-b/.claude/            # working clone
project-c/.claude/            # working clone
```

## Initial Setup

### 1. Create the Bare Repo (One Time)

```bash
git init --bare ~/dev/.claude-shared.git
```

### 2. Initialize Your First .claude Directory

```bash
cd /path/to/your/project/.claude
git init
git remote add origin ~/dev/.claude-shared.git

# Ignore repo-specific files
echo "settings.local.json" > .gitignore

# Initial commit and push
git add agents/ shared/ .gitignore
git commit -m "Initial shared .claude config"
git push -u origin main
```

### 3. Tell Parent Repo to Ignore .claude

Since `.claude` is now its own git repo, the parent project should ignore it:

```bash
cd /path/to/your/project
echo ".claude/" >> .gitignore
git add .gitignore
git commit -m "Ignore .claude directory (managed separately)"
```

## Adding to New Projects

```bash
cd /path/to/new/project
git clone ~/dev/.claude-shared.git .claude

# Add repo-specific settings (not synced)
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": []
  }
}
EOF

# Tell parent repo to ignore .claude
echo ".claude/" >> .gitignore
```

## Daily Workflow

### Save Changes (from any project)

```bash
cd .claude
git add .
git commit -m "Add/update agent X"
git push
```

### Get Latest Changes

```bash
cd .claude
git pull
```

### Check Status

```bash
cd .claude
git status
git log --oneline -5
```

## Repo-Specific Agents

To create agents that stay local to one repo (not synced):

```bash
cd .claude

# Add pattern to .gitignore
echo "agents/local-*.md" >> .gitignore
git add .gitignore
git commit -m "Allow local-only agents"
git push

# Now create local agents with the prefix
touch agents/local-my-project-agent.md
```

## Directory Structure

```
.claude/
├── agents/                    # Shared agents (synced)
│   ├── strategic-brainstorm-researcher.md
│   ├── git-commit-writer.md
│   └── ...
├── shared/                    # Shared resources (synced)
│   └── no-flatter-mode.md
├── settings.local.json        # Repo-specific (not synced)
├── .gitignore
└── README.md
```

## Handling Conflicts

If you edit the same file in multiple repos before syncing:

```bash
cd .claude
git pull
# If conflicts, resolve them in your editor
git add .
git commit -m "Resolve merge conflict"
git push
```

## Quick Reference

| Action | Command |
|--------|---------|
| Save changes | `cd .claude && git add . && git commit -m "msg" && git push` |
| Get changes | `cd .claude && git pull` |
| New project | `git clone ~/dev/.claude-shared.git .claude` |
| View history | `cd .claude && git log --oneline` |
| Check status | `cd .claude && git status` |
