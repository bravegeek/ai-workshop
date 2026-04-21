# Strategic Brainstorm Researcher — OSS v0.1 Release Spec

**Status:** Draft
**Date:** 2026-04-21
**Target:** v0.1 — first public release
**Effort estimate:** 4–6 hours focused work

## Goal

Extract `strategic-brainstorm-researcher` from this private workshop repo and rebrand it as **Guided Brainstorm**: a public, self-contained, portable artifact that any user can adopt with one copy-paste on Claude, ChatGPT, or Gemini.

The rebrand is forced by the fact that CRIT is a trademarked term (from Geoff Woods' *The AI-Driven Leader*). We take that as an opportunity to drop the acronym entirely and use plain-English step names that work for non-technical users.

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

**Problem:** The original skill derives from Geoff Woods' CRIT framework (*The AI-Driven Leader*, 2024). CRIT is trademarked. The method itself isn't patent-protected, but the brand is. We need to credit the inspiration cleanly without implying endorsement or affiliation.

**Approach:** Nominative fair use. Credit by name in attribution contexts only (NOTICE, README), never as branding. Include a non-affiliation disclaimer.

**Change:**
- Pick a license for the code and prompt (recommend MIT; CC-BY-4.0 is a reasonable alternative for the prompt form).
- Add `LICENSE` and `NOTICE` files.
- Add one-line credit under a "Credits" heading in `README.md`.

**Credit line to use (verbatim in NOTICE):**

> This tool was inspired by the CRIT framework from *The AI-Driven Leader* by Geoff Woods (2024). Guided Brainstorm uses its own terminology (Situation / Advisor / Conversation / Plan) and is not affiliated with or endorsed by the author or publisher.

**Do not:**
- Put "CRIT" in the tool name, filenames, frontmatter, skill header, or UI strings
- Say "CRIT-based," "CRIT-compatible," or "our CRIT implementation"
- Use any CRIT visual identity

**Deliverable:**
- `LICENSE` (MIT)
- `NOTICE` with the credit line above
- One-sentence "Credits" section in `README.md`

**Non-legal note:** Author of this spec is not a lawyer. Nominative fair use is well-established OSS practice but if the project gets commercial traction, a brief IP consult is cheap insurance.

### 4. Portability across LLMs

**Problem:** Currently only works inside Claude's skill system. Users on ChatGPT or Gemini can't adopt it without manual extraction.

**Change:** Ship two forms of the same content, hand-maintained:
- `SKILL.md` — Claude skill form with frontmatter
- `prompt.md` — plain system prompt, paste-into-any-LLM form

Phase 5 (file writing) may not work outside an agentic context. The prompt form must degrade gracefully — print the session documents inline when it can't write files.

**Deliverable:** Both files in the public repo, plus a README explaining which to use where.

### 5. Rebrand: drop CRIT terminology, rename steps and tool

**Problem:** CRIT is trademarked. Even if it weren't, the acronym forces users to memorize an abstraction before they get value. For a general-audience OSS tool, plain-English step names work better.

**Tool name:** **Guided Brainstorm**. Descriptive, non-trademarked, two words, works across domains.

**Step renames:** Keep the order, replace the names.

| Old | New |
|-----|-----|
| Phase 1: Context | **Situation** |
| Phase 2: Role | **Advisor** |
| Phase 3: Interview | **Conversation** |
| Phase 4: Task / Research Planning | **Plan** |
| Phase 5: Documentation | **Save** (unchanged in function, renamed for clarity) |

**Rationale for each:**
- *Situation* — universal across decisions, projects, problems, creative work. "Context" sounds academic.
- *Advisor* — warm and concrete. "Role" implies the user is role-playing; "Advisor" implies someone's helping them.
- *Conversation* — matches what actually happens. "Interview" feels adversarial or clinical.
- *Plan* — covers both task definition and research planning without the slash. Works regardless of whether the user wants a deliverable or a research roadmap.
- *Save* — just describes the action.

**Order is unchanged.** Considered alternatives (task-first, advisor-after-conversation, adding a reflect step) and rejected all three: they either undermine the design or scope-creep.

**Change:**
- Rename all phase headers in `SKILL.md` and `prompt.md`.
- Update the skill frontmatter `name` (if the skill format supports human-readable names) and `description`.
- Update all references to "CRIT" / "CRI" / "CRI-R" in user-facing strings. Remove entirely — no legacy mentions in the skill body, phase headers, or inline examples.
- File/skill identifier: `guided-brainstorm` (kebab-case). Repo: `guided-brainstorm/`.

**Deliverable:** Skill and prompt files with new tool name, new phase names, zero references to CRIT/CRI in user-facing content.

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
guided-brainstorm/
├── README.md                 # what, why, quickstart for Claude/ChatGPT/Gemini
├── LICENSE                   # MIT
├── NOTICE                    # nominative-fair-use credit to CRIT / Geoff Woods
├── SKILL.md                  # Claude skill form
├── prompt.md                 # paste-anywhere system prompt form
├── CHANGELOG.md              # v0.1 entry
└── examples/
    └── sample-session.md     # one redacted walkthrough transcript
```

## Acceptance criteria

1. A new user can copy `SKILL.md` into a fresh `.claude/skills/` directory, activate it, and complete a full session without the skill referencing any file outside the public repo.
2. A new user can paste `prompt.md` into ChatGPT or Gemini as a system prompt and complete Phases 1–4. Phase 5 degrades gracefully to inline output when file-writing isn't available.
3. CRIT is credited in `NOTICE` and under a "Credits" heading in `README.md`, using the verbatim credit line from blocker 3. No CRIT branding appears in user-facing tool content.
4. Default output path does NOT contain `projects/` and works from any cwd.
5. No occurrences of "CRIT," "CRI," or "CRI-R" anywhere in `SKILL.md`, `prompt.md`, or phase headers. Phase names are Situation / Advisor / Conversation / Plan / Save. Tool is named "Guided Brainstorm."
6. Phase 1 category list includes at least 3 non-technology categories.
7. `README.md` shows install/use instructions for all three LLM platforms.
8. `examples/sample-session.md` shows one complete session from opening prompt to saved output.

## Open questions

1. **Repo owner.** Release from the user's personal GitHub account, or set up a small org?
2. **Example transcript source.** Redact `projects/ai-dev-productivity-pitch-2026-02/session.md`, or fabricate a generic one to avoid leaking internal product context? Redaction is faster; fabrication is safer.
3. **License.** MIT for everything (simplest), or MIT for code + CC-BY-4.0 for the prompt form (more idiomatic)? Pick one and be consistent.
4. **Step-name signoff.** Are Situation / Advisor / Conversation / Plan final, or should any be workshopped further? (Recommendation: ship with these, iterate based on early user feedback.)

## Out of scope for v0.1

- CLI runner
- Auto-sync between `SKILL.md` and `prompt.md`
- Eval harness
- Localization / plain-language mode
- GitHub Actions / release pipeline
- Integration tests
- Plug-ins for external tools

## Work breakdown

1. Decide open questions (repo owner, example source, license) — **15 min**
2. Rewrite `SKILL.md` as Guided Brainstorm: inline framework content, parameterize output path, rebalance categories, rename phases, scrub all CRIT/CRI references — **90 min**
3. Derive `prompt.md` from `SKILL.md` (plain-LLM form, degrades gracefully without file writes) — **30 min**
4. Write `README.md` with quickstart for Claude / ChatGPT / Gemini and a Credits section — **60 min**
5. Produce `LICENSE`, `NOTICE` (with verbatim credit line), `CHANGELOG.md` — **30 min**
6. Redact or fabricate `examples/sample-session.md` — **60 min**
7. Test: run the skill in Claude and the prompt in ChatGPT + Gemini, verify all acceptance criteria — **60 min**

Total: ~5.5 hours, loaded.
