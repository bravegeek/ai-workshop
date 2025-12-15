# Cosmos and Chaos

**An idle game about managing opposing forces aboard a generational ark ship**

## Current Status

**Phase:** Phase 2 Complete - Resource Automation & Live Counters ✅
**Last Updated:** 2025-12-14
**Tests:** 150/150 passing (100%)

## Getting Started

### Run the Game

```bash
# From the project root
npm run dev
```

This starts a local server at **http://localhost:8000**

### Run Tests

```bash
npm test        # Watch mode
npm run test:run # Single run
```

## Project Overview

You are the AI custodian of a generational ark ship. Your goal is to maintain the ship, expand its capabilities, and choose your path:
- **Cosmos (Wonder):** Harmony, efficiency, and flow
- **Chaos (Dread):** Raw power, speed, and consumption

## Documentation Structure

### Core Documents (Start Here)

1. **[DESIGN.md](DESIGN.md)** - *The "What"*
   - Game concept and story
   - Core mechanics (Dual Counters, Tech Tree, Paradox Protocol)
   - All 48 technologies across 6 departments
   - Victory conditions
   - ~400 lines

2. **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - *The "How"*
   - Technical specifications (60 FPS, CSS-only)
   - UI layout (3-zone command console)
   - Visual style guide (Wonder/Dread gradients)
   - Drag & drop system
   - Development roadmap
   - ~550 lines

### Detailed Specifications

3. **[card_counter_spec.md](card_counter_spec.md)**
   - Card layout template (200×200px)
   - Typography hierarchy
   - All 8 core card types with examples
   - Status LED color coding
   - Performance targets

4. **[desktop_ui.md](desktop_ui.md)**
   - Desktop-first layout (1920×1080 target)
   - Grid system (10×10 total, 5×4 viewport)
   - Interaction model (mouse & keyboard)

### Reference Materials

5. **[mobile_ux.md](mobile_ux.md)**
   - Mobile considerations (future reference)

6. **[research.md](research.md)**
   - Early brainstorming notes

7. **[session.meta.md](session.meta.md)**
   - Session metadata

### Archive

8. **[archive/session-original.md](archive/session-original.md)**
   - Original 1186-line brainstorming document
   - Historical reference, preserved for "why did we decide X?" questions
   - Superseded by DESIGN.md + IMPLEMENTATION.md

## Quick Start Guide

**To understand the game:**
1. Read DESIGN.md (start to finish)
2. Skim the Tech Tree section
3. Read Victory Conditions

**To start building:**
1. Review IMPLEMENTATION.md
2. Check card_counter_spec.md for card layouts
3. Follow the Development Roadmap (Phase 1: Core Grid & Cards)

## Key Design Decisions

- **Singleton Card System:** Each tech = one unique card (no duplicates)
- **8 Core Slots:** Extractor, Processor, Storage, Reactor, Engine, Sensor, Habitat, Lab
- **Tier 3 Fork:** Technologies split into Wonder/Dread variants
- **Witness Playstyle:** Build BOTH variants via Paradox Protocol
- **Performance First:** 60 FPS with 25+ cards using CSS-only effects
- **Desktop-First:** 200×200px cards, 5×4 viewport (1000×800px)

## Technology Stack

**Minimal approach (recommended):**
- HTML5 + CSS3 + Vanilla JavaScript
- No frameworks (easier to hit 60 FPS)
- Optional: `interact.js` for drag & drop

**Why no React/Canvas/WebGL?**
- CSS animations are faster for this use case
- Less overhead = better performance
- Simpler debugging

## File Organization

```
/cosmos-and-chaos-2025-11/
├── README.md              ← You are here
├── DESIGN.md              ← Game vision
├── IMPLEMENTATION.md      ← Build instructions
├── card_counter_spec.md   ← Card layouts
├── desktop_ui.md          ← UI specifications
├── mobile_ux.md           ← Mobile notes
├── research.md            ← Early ideas
├── session.meta.md        ← Session metadata
└── archive/
    └── session-original.md ← Historical brainstorming
```

## Development Roadmap

### Phase 1: Core Grid & Cards (MVP)
- [x] Design complete (DESIGN.md)
- [x] Specifications complete (IMPLEMENTATION.md, card_counter_spec.md)
- [ ] HTML scaffold (3-zone layout)
- [ ] CSS Grid system (10×10, 5×4 viewport)
- [ ] Basic card template
- [ ] 8 core card types (Tier 0-1)
- [ ] Drag & drop
- [ ] Manual click production

**Deliverable:** Can place cards on grid, drag them, click to produce resources.

### Phase 2: Automation & Counters ✅ COMPLETE
- [x] Counter updates (live data)
- [x] Status LEDs (efficiency indicators)
- [x] I/O indicators (connection visualization)
- [x] Auto-production (placed cards produce automatically)
- [x] Multi-resource system (5 resource types)
- [x] DisplayUpdateManager (throttled updates)
- [x] Sub-unit precision (accumulator system)
- [x] Save/load persistence
- [x] Comprehensive test suite (150 tests)

**Deliverable:** Cards auto-produce, display live counters. ✅

### Phase 3: Wonder/Dread Systems
- [ ] Dual counters (Resonance/Dissonance)
- [ ] Gradient systems (UI evolution)
- [ ] UI physics (drag feel, collision)
- [ ] Visual adaptation
- [ ] Audio cues

**Deliverable:** Game feels different based on alignment.

### Phase 4: Tech Tree & Progression
- [ ] Tech tree UI
- [ ] Unlock system
- [ ] Card evolution (Tier 0 → Tier 5)
- [ ] Paradox Protocol
- [ ] Research system

**Deliverable:** Full progression, all 48 techs unlockable.

### Phase 5: Advanced Mechanics
- [ ] Adjacency bonuses (Flow/Leech)
- [ ] Dread glitch system
- [ ] Rhythmic click system
- [ ] Offline progress
- [ ] Victory conditions

**Deliverable:** Complete game loop.

### Phase 6: Polish & Balance
- [ ] Sound design
- [ ] Animation polish
- [ ] Balance tuning
- [ ] Tutorial/onboarding
- [ ] Performance optimization

**Deliverable:** Shippable game.

## Next Actions

**If you're new to this project:**
1. Read DESIGN.md to understand the vision
2. Read IMPLEMENTATION.md to see how to build it
3. Review card_counter_spec.md for detailed card specs

**If you're ready to code:**
1. Create `index.html` with 3-zone layout
2. Build CSS Grid system (see IMPLEMENTATION.md "Grid System Implementation")
3. Create first card (T01 Mining Laser - manual clicker)
4. Test click → produce resource

**If you're refining the design:**
1. Edit DESIGN.md for game mechanics
2. Edit IMPLEMENTATION.md for technical specs
3. Edit card_counter_spec.md for card layouts
4. Keep archive/session-original.md as historical reference only

## Design Philosophy

> "The game is about managing two opposing forces (Wonder/Dread) that both offer power but demand different playstyles. Neither is 'correct'—they're philosophical choices."

**Core Tension:** Balance vs. Extremes
**Meaningful Choices:** Every tech unlock, every card placement matters
**Witness Path:** The hardest but most rewarding playstyle
**Performance First:** 60 FPS is non-negotiable

## Questions?

- **What's the core loop?** Click cards → Produce resources → Unlock techs → Evolve cards → Choose Wonder or Dread → Manage dual counters → Win one of 3 endings
- **How long is a playthrough?** TBD (balancing needed)
- **Mobile support?** Desktop-first, mobile later
- **Multiplayer?** No, single-player idle game
- **Art style?** Minimalist sci-fi, dark PCB aesthetic, neon accents

---

**Last Updated:** 2025-12-14
**Version:** 0.2.0 (Phase 2 Complete - Resource Automation)
