# Satirical Article Agent - Design & Development

This directory serves as the **design and development workspace** for the satirical-article-agent used in Claude Code.

## Purpose

This is where enhancements, new features, and design iterations for the agent are developed and tested before being merged into the official agent location at `.claude/agents/satirical-article-agent.md`.

## Official Agent Location

The production agent lives at:
```
.claude/agents/satirical-article-agent.md
```

Changes made here should be tested and validated before being copied to the official location.

## Directory Contents

- `satirical-article-agent.md` - Development version of the agent prompt
- `article-template.md` - Design docs for article structure and style
- `ideas.md` - Test ideas file for development
- `session.md` / `session.meta.md` - Session format design and examples
- `test-article-*.md` - Test articles and output examples

## Development Workflow

1. Make changes to agent prompt or supporting files in this directory
2. Test the changes thoroughly
3. When ready, merge enhancements back to `.claude/agents/satirical-article-agent.md`
4. Document changes in commit messages

## Recent Enhancements

**November 2025:**
- Added Phase 0: Session Selection
- Implemented session persistence with YAML frontmatter
- Added sessions directory at `/home/greg/dev/ai-workshop/sessions/satirical-articles/`
- Enhanced Phase 5 with detailed save/resume workflow
- Merged to official agent location

## Notes

This directory preserves design artifacts, test files, and development history that shouldn't clutter the main `.claude/agents/` directory.
