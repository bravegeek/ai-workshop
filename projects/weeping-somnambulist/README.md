# Weeping Somnambulist

Tragic sci-fi / techno-noir. The collective unconscious (the Psychosphere) is a physical dimension that can be entered, mapped, and mined. A crew of specialists operates out of a 19th-century institute in Budapest, built around a god chained in the basement.

---

## Structure

### `canon/` — World Bible
Locked or near-locked decisions about how the world works.

**`characters/`** — One file per character: io, ama, lorcan, ren, nia, barnaby, presences

**`world/`** — How the universe works
| File | Contents |
|------|----------|
| `psychosphere.md` | The Psychosphere — what it is, zones, the Deep as ecosystem |
| `cosmology.md` | Sleeping Gods — chemotaxis model of unity, other Sleepers, legend survival bias, reintegration problem |
| `world_context.md` | Dreamwalking ecosystem, Caerulite in the world, operational context |

**`phenomena/`** — Specific notable things that exist in the world
| File | Contents |
|------|----------|
| `the_eye.md` | The Eye — TSG fragment, archive mechanic, Ren's connection |
| `the_blooming.md` | TSG waking — what it is, what it does, what it means |
| `storm_riders.md` | Storm riders — surge-bound entities, piezoelectric attraction, Ama's knowledge, folk frame. Draft. |
| `oubliettes.md` | Sealed pockets of preserved experience |

**`craft/`** — How the crew operates
| File | Contents |
|------|----------|
| `mechanics.md` | Dive mechanics — Method Actor, Narrative Capture, Immune System |
| `technology.md` | Gear, tools — Witness/Reliquary, Storm-Forging, Cistern as transitional medium |
| `caerulite.md` | Caerulite — the substance, thinning, Lethe-Light interaction, Eye Protocol |
| `artifacts.md` | Artifact framework — formation, eras, calling, extraction |

**`locations.md`** — The Mordaunt Institute, the Underworks, the Deep biomes

**`presences.md`** — Non-human entities: the Eye, the Cistern, the Vault, TSG. Brief entries with pointers to full documentation.

### `stories/` — Narrative Development
Arc structure, character arcs, scene inventory, narrative principles, and written drafts.

| File | Contents |
|------|----------|
| `arc1.md` | Main arc shape, hooks, character arcs, resolution |
| `arc2.md` | Second arc — rebuild, healing, Budapest aftermath, hooks |
| `scenes.md` | Scene inventory — all known scenes by arc, with lens notes and open questions |
| `narrative.md` | POV principles — the lens model, how and when to shift perspective |
| `voices.md` | Character voice reference — salvaged passages with the right register |
| `seeds/` | Underdeveloped story ideas: io_prequel, ren_story |
| `drafts/` | Written prose — chapters and scenes in progress |

### `scratchpad/` — Working Material
`artifact_proposals.md` — artifact inventory and classification (needs audit against current canon)
`whispering_iron.md` — shelved antagonist concept
`archive/` — superseded session notes and old drafts

### `todo.md` — Tasks & Decisions
Planning, open questions, prioritized work. Story content lives in `stories/`.

---

## Current State

Arc 1 and Arc 2 shapes are established. The world bible covers the Psychosphere, the Eye, the Blooming, the Institute, core mechanics, cosmology, artifacts, and all five characters. The original circle (IO, Nia, Ren) is established — Ren arrived during the exploration period before Nia left and stayed after.

Narrative structure is documented in `stories/narrative.md` — multi-lens POV, lens shifts driven by storytelling need. All known scenes catalogued in `stories/scenes.md` (prequel through arc 2).

Recent additions: artifact framework (formation, eras, calling, extraction, IO's market model). Secret extraction mechanics developed — navigation (familiarity as anchor, objects as substitute), access (personal immune response, timing), cost (accumulated intimacy). Architect framing corrected — research/exploration driven, distinct from the Mordaunt extraction craft.

Active priorities in `todo.md`.

# tech notes
## local rag mcp server
claude mcp add local-rag --scope user --env BASE_DIR=/home/greg/dev/ai-workshop -- /home/greg/.nvm/versions/node/v25.2.0/bin/npx -y mcp-local-rag