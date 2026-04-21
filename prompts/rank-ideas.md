# Rank Ideas, Projects, and Skills

You are evaluating a multi-project AI workshop repository. Your job is to find every distinct **idea, concept, project, or skill** described in `.md` files and produce a ranked analysis.

## Scope — include

- `ideas/**/*.md`
- `projects/*/` — treat each top-level project directory as one item; read its `README.md`, `session.md`, and any design/research `.md` files to understand the concept
- `.claude/skills/*.md` and `.claude/skills/*/SKILL.md` — treat each skill as one item; read the full skill definition and any referenced files under the skill's directory
- `sessions/**/*.md` — only if they describe a distinct idea not already covered by a project or skill
- Root-level `.md` files that describe ideas (not tooling)

## Scope — exclude

- `.gemini/`, `.specify/`, `.entire/` (mirrors/tooling/config)
- `.claude/` *except* the `skills/` subtree
- `personas/` (explicitly excluded per user request)
- `prompts/` (reusable assets, not ideas to rank)
- Command templates, spec-kit templates, agent configs
- `CLAUDE.md`, `GEMINI.md`, `readme.md` at root (meta-docs)
- Duplicates: if a skill and a project describe the same thing (e.g. `fate-character-generator` exists in both), merge them into one item and note both paths

## Process

Before ranking, list every item you found with a one-line description and the path(s) you read. If you're unsure whether something is an "idea" vs. tooling, include it and flag the ambiguity. Do not invent items.

## Rubric — rate each item 1–5 on five axes, with one sentence of justification per axis

1. **Usefulness** — does it solve a real problem for a real user? How often would it get used?
2. **Societal benefit** — does it help people beyond the creator? Health, education, access, safety, time saved at scale. Measures *quality* of help. Penalize items that are purely entertainment or zero-sum.
3. **Reach / accessibility** — who could use this and how many? 1 = just the author; 3 = a niche community; 5 = a broad, global population. Measures *breadth* of impact, independent of depth.
4. **Differentiation** — does this fill a real gap, or duplicate something already free and well-maintained? 1 = many better free alternatives exist; 3 = some overlap but a unique angle; 5 = clear unmet need, no comparable OSS alternative.
5. **Maturity / feasibility** — how far along is it and how buildable is the next step? 1 = vague brainstorm, no plan; 3 = clear concept with design notes or partial spec; 5 = working prototype, spec, or code already in the repo. A tuned, working skill file in `.claude/skills/` generally scores 4–5. Factor in technical difficulty and whether the author has what they need to ship.

Compute a **total** (sum of five scores, max 25) and rank all items by total. Break ties by societal benefit, then by reach, then by maturity.

Orientation: this repo's owner cares about shipping open-source work that helps the world. Weigh societal benefit and reach heavily when providing narrative assessment.

## Output format

1. Inventory table: item name, type (idea / project / skill / combined), path(s), one-line description
2. Per-item scorecard: five axes with justifications
3. Final ranked table sorted by total score, with all five axis scores visible as columns and a `type` column
4. A short "thoughts" section (max 200 words) calling out: the strongest item and why (with emphasis on OSS/societal fit), the weakest and why, any patterns across the portfolio, one or two items that could be combined or sharpened, which items are closest to shippable vs. stuck in ideation, and which items best match an "open-source, help the world" goal

## Rules

- Be critical. Don't inflate scores to be nice. A score of 3 is "average" — use the full range.
- If an idea is half-formed or unclear, say so and score based on what's actually written, not your charitable reconstruction.
- Cite file paths as `path:line` when quoting specifics.
- Do not rank personas or prompt templates.
- Maturity scores what exists on disk today — not what *could* be built quickly. A one-paragraph idea with an obvious implementation path still scores low on maturity.
