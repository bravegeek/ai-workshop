# AGENTS.md

## Workspace type

Multi-project workshop. **Not a monorepo** — each project under `projects/` is self-contained with its own tooling, dependencies, and conventions. Never assume shared commands across projects.

## How to work

- Always `cd` into the specific project directory before running build/test/lint.
- Check the project's own config files (`package.json`, `README.md`, `CLAUDE.md`) before guessing commands.
- No CI/CD, no pre-commit hooks, no Docker at root.

## Tooling conventions

- **JS/TypeScript**: Prefer `bun` (`bun install`, `bun test`, `bun run`, `bunx`) over `node`/`npm`/`npx`.
- **Bun auto-loads `.env`** — do not add `dotenv` or manual env-loading code.
- **Python**: Only one script exists (`scripts/dashboard.py`). No `pip install` needed at root.

## Key directories

| Dir | Signal |
|-----|--------|
| `projects/` | 13 independent projects (code + docs) |
| `sessions/` | Ephemeral working sessions — **gitignored** |
| `openspec/` | Spec-driven dev (propose → apply → archive via skills) |
| `.claude/skills/` | Reusable agent skills available to OpenCode |
| `lancedb/`, `models/` | Local RAG vector store + embedding cache — **gitignored** |

## Communication style

No flattery. Concise, direct, critical engagement. No praise, no thank-yous, no validating language.

## Git

- Default branch: `main`
- Conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- `.env` is gitignored (contains provider API keys)

## Search strategy

| Query type | Tool |
|------------|------|
| Semantic / conceptual ("how does X work?", design decisions, docs, cross-project context) | `local-rag` MCP |
| Exact string/pattern in code | Grep |
| Files by name/path glob | Glob |

RAG indexes `/home/greg/dev` (broader than this repo). RAG first for understanding, Grep/Glob for precise code lookup after.
