# Implementation Plan: Tier Upgrade System

**Branch**: `002-tier-upgrades` | **Date**: 2025-12-14 | **Spec**: [specs/002-tier-upgrades/spec.md](specs/002-tier-upgrades/spec.md)
**Input**: Feature specification from `specs/002-tier-upgrades/spec.md`

## Summary

Implement the Tier 0 to Tier 1 upgrade mechanic for the 8 core cards, allowing players to unlock automation. This includes a new resource cost configuration system, an upgrade UI modal, visual progress hints (glow effects), and a critical fix to the frontend display manager to update resource counters automatically when backend production occurs.

## Technical Context

**Language/Version**: JavaScript (ES6+)
**Primary Dependencies**: None (Vanilla JS, DOM API)
**Storage**: localStorage (via `save.js`)
**Testing**: Vitest (Unit), Manual/Browser (Integration)
**Target Platform**: Web Browser (Desktop/Mobile)
**Project Type**: Web Application
**Performance Goals**: 60 FPS rendering, <100ms UI interaction latency
**Constraints**: No frameworks, low battery usage (CSS animations preferred over Canvas for UI)
**Scale/Scope**: 8 initial cards, extensible to future tiers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Library-First**: N/A (Application feature).
2. **Simplicity**: Using vanilla JS and CSS for animations aligns with project constraints.
3. **Test-First**: Will write tests for cost calculation and upgrade logic.

## Project Structure

### Documentation (this feature)

```text
specs/002-tier-upgrades/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── css/
│   ├── cards.css        # Add glow styles, upgrade icon styles
│   └── layout.css       # Add modal styles
├── js/
│   ├── cards.js         # Update card rendering for icons/tiers
│   ├── display.js       # Fix automation loop listener
│   ├── main.js          # (Review only)
│   ├── production.js    # (Review only)
│   ├── state.js         # Add upgrade logic, cost verification
│   └── utils.js         # Formatting helpers
└── index.html           # Add modal container
```

**Structure Decision**: Extending existing Vanilla JS structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |
