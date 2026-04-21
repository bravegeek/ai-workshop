# Strategic Brainstorm Researcher — OSS v0.1 Release Spec

**Status:** Draft
**Date:** 2026-04-21
**Target:** v0.1 — first public release
**Effort estimate:** 4–6 hours focused work

## Goal

Extract `strategic-brainstorm-researcher` from this private workshop repo into a public, self-contained, portable artifact that any user can adopt with one copy-paste on Claude, ChatGPT, or Gemini.

## Non-goals (v0.1)

- CLI wrapper / OpenRouter integration
- Eval suite
- Multi-language or plain-language modes
- Note-tool plug-ins (Notion, Obsidian)
- Auto-sync between skill and prompt forms — hand-maintain both

## Scope — six blockers

### 1. Decouple from repo

**Problem:** Skill reads `./prompts/crit-strategic-thinking` at runtime (skill line 12). If a user copies only the skill file, it breaks silently.

**Change:** Inline the needed CRIT content directly into the skill file as a reference section. Remove the external-file read.

**Deliverable:** Updated skill with embedded `## CRIT Reference` section containing the framework template. Skill no longer references any file that isn't in the public release.

### 2. Parameterize output path

**Problem:** Skill hard-codes `projects/[name]-YYYY-MM/` (lines 78–79), which only makes sense inside this specific repo.

**Change:** Default output to `./brainstorms/[name]-YYYY-MM/` (created if missing). Allow override via a leading user instruction ("save to X") or explicit directive at session start.

**Deliverable:** Updated Phase 5 documentation. A user running the skill from any cwd gets output in a predictable, non-invasive location.

### 3. Attribution + license

**Problem:** CRIT is explicitly from Geoff Woods' *The AI-Driven Leader*. No attribution or license currently exists.

**Change:**
- Add credit line in skill frontmatter and a standalone `NOTICE` file.
- Pick and add a license for the skill code itself (recommend MIT).
- Confirm CRIT can be described and derived in an OSS tool before release — resolve in open question 1 below.

**Deliverable:**
- Credit line in `SKILL.md` header
- `LICENSE` file (MIT recommended)
- `NOTICE` file crediting the CRIT framework

### 4. Portability across LLMs

**Problem:** Currently only works inside Claude's skill system. Users on ChatGPT or Gemini can't adopt it without manual extraction.

**Change:** Ship two forms of the same content, hand-maintained:
- `SKILL.md` — Claude skill form with frontmatter
- `prompt.md` — plain system prompt, paste-into-any-LLM form

Phase 5 (file writing) may not work outside an agentic context. The prompt form must degrade gracefully — print the session documents inline when it can't write files.

**Deliverable:** Both files in the public repo, plus a README explaining which to use where.

### 5. Resolve CRI vs CRIT naming

**Problem:** The skill advertises "CRI" but CRIT has a 4th T=Task step, which the skill silently drops and replaces with research planning. This is a quiet divergence from the cited framework.

**Change:** Pick one:
- **Option A (recommended):** Rename to "CRI-R" (CRI + Research) and document the intentional divergence.
- **Option B:** Re-add a Task phase between interview and research planning, becoming true CRIT + Research.

Option A matches the existing flow — research planning IS the task for this workflow.

**Deliverable:** Decision noted in skill header, frontmatter `description` updated to match.

### 6. Rebalance Phase 1 categories

**Problem:** Current categories (skill line 15) bias toward tech users — "Technology & Architecture," "Development Tools & Frameworks." Limits reach.

**Change:** Replace with:
- Technology & engineering
- Business strategy & operations
- Product & innovation
- Personal decisions & life planning
- Creative projects
- Nonprofit / civic work
- Academic research
- Career & learning

**Deliverable:** Updated Phase 1 category list. At least 3 non-tech categories present.

## Target repo layout

New standalone public repo (not this workshop):

```
strategic-brainstorm/
├── README.md                 # what, why, quickstart for Claude/ChatGPT/Gemini
├── LICENSE                   # MIT
├── NOTICE                    # CRIT attribution to Geoff Woods
├── SKILL.md                  # Claude skill form
├── prompt.md                 # paste-anywhere system prompt form
├── CHANGELOG.md              # v0.1 entry
└── examples/
    └── sample-session.md     # one redacted walkthrough transcript
```

## Acceptance criteria

1. A new user can copy `SKILL.md` into a fresh `.claude/skills/` directory, activate it, and complete a full session without the skill referencing any file outside the public repo.
2. A new user can paste `prompt.md` into ChatGPT or Gemini as a system prompt and complete Phases 1–4. Phase 5 degrades gracefully to inline output when file-writing isn't available.
3. CRIT is credited in at least two places — skill header and `NOTICE`.
4. Default output path does NOT contain `projects/` and works from any cwd.
5. The skill name clearly reflects its actual behavior — "CRI" is no longer used ambiguously. Either renamed or divergence from CRIT is explicitly documented.
6. Phase 1 category list includes at least 3 non-technology categories.
7. `README.md` shows install/use instructions for all three LLM platforms.
8. `examples/sample-session.md` shows one complete session from opening prompt to saved output.

## Open questions

1. **CRIT licensing.** Is the CRIT framework free to describe and derive in an OSS tool? Geoff Woods' book describes it publicly. If legal risk exists, switch to describing the generic "context / role / interview" pattern without the CRIT brand name. Resolve before release.
2. **Repo owner.** Release from the user's personal GitHub account, or set up a small org?
3. **Example transcript source.** Redact `projects/ai-dev-productivity-pitch-2026-02/session.md`, or fabricate a generic one to avoid leaking internal product context? Redaction is faster; fabrication is safer.
4. **License for prompt vs code.** MIT covers both cleanly. CC-BY-4.0 may be more idiomatic for the prompt form. Pick one and be consistent.

## Out of scope for v0.1

- CLI runner
- Auto-sync between `SKILL.md` and `prompt.md`
- Eval harness
- Localization / plain-language mode
- GitHub Actions / release pipeline
- Integration tests
- Plug-ins for external tools

## Work breakdown

1. Decide open questions 1 and 4 (CRIT licensing, license choice) — **30 min**
2. Rewrite `SKILL.md`: inline CRIT content, parameterize path, fix categories, rename for CRI/CRIT decision — **90 min**
3. Derive `prompt.md` from `SKILL.md` — **30 min**
4. Write `README.md` with quickstart for 3 platforms — **60 min**
5. Produce `LICENSE`, `NOTICE`, `CHANGELOG.md` — **30 min**
6. Redact or fabricate `examples/sample-session.md` — **60 min**
7. Test: run the skill in Claude and the prompt in ChatGPT + Gemini, verify acceptance criteria — **60 min**

Total: ~6 hours, loaded.
