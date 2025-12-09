<!--
Sync Impact Report:
  Version: 1.0.0 (Initial Ratification)
  Modified principles: None (initial creation)
  Added sections: All (Core Principles, Technical Standards, Development Workflow, Governance)
  Removed sections: None
  Templates requiring updates:
    ✅ plan-template.md - Aligned with Performance-First and Simplicity principles
    ✅ spec-template.md - Aligned with User Story structure and independent testability
    ✅ tasks-template.md - Aligned with MVP-first and independent user story approach
  Follow-up TODOs: None
-->

# Cosmos and Chaos Constitution

## Core Principles

### I. Performance-First (NON-NEGOTIABLE)

**60 FPS is mandatory.** All visual effects, animations, and interactions MUST maintain 60 FPS with 25+ cards visible.

- CSS-only effects required (no Canvas/WebGL for core rendering unless 60 FPS cannot be achieved otherwise)
- Use CSS transforms over position changes
- Profile with DevTools early and frequently
- Performance degradation is a blocking bug

**Rationale:** The game's aesthetic and feel depend on smooth, responsive interactions. Poor performance destroys the idle game experience and breaks player immersion.

### II. Simplicity & YAGNI

**Start simple. No speculative features.** Only build what is immediately needed for the current phase.

- No frameworks for MVP (HTML5 + CSS3 + Vanilla JavaScript)
- No build tools until needed
- No abstractions until pattern emerges 3+ times
- Defer Wonder/Dread physics, adjacency bonuses, audio until post-MVP

**Rationale:** Over-engineering slows development and obscures the core gameplay. Complexity must be earned through demonstrated need, not anticipated requirements.

### III. Desktop-First Design

**Target 1920×1080 desktop browsers.** Mobile is explicitly deferred.

- 200×200px cards as default size
- 5×4 viewport (1000×800px)
- Mouse and keyboard interactions
- Responsive design only after desktop MVP validated

**Rationale:** Focusing on desktop first prevents dilution of effort and allows optimization for a single interaction model before expanding to touch/mobile.

### IV. Design Integrity

**The documented design is the source of truth.** All implementation decisions MUST align with DESIGN.md, IMPLEMENTATION.md, and card_counter_spec.md.

- Document first, code second
- When design gaps are discovered, document the decision before implementing
- Archive superseded decisions in archive/ with clear historical context
- No ad-hoc UI changes without updating specifications

**Rationale:** The design documents represent deliberate, considered decisions. Undocumented changes fragment understanding and create technical debt.

### V. MVP-First Progression

**Phase-based development with clear deliverables.** Each phase MUST produce a playable, testable increment.

- Phase 1: Core Grid & Cards (click to produce, drag to move)
- Subsequent phases add ONE system at a time
- No phase begins until previous phase is validated
- Each phase deliverable is independently demonstrable

**Rationale:** Incremental delivery reduces risk, enables early feedback, and prevents building features on unvalidated foundations.

## Technical Standards

### Card System Architecture

- **Singleton cards:** One card per technology (no duplicates)
- **8 core evolutionary lines:** Extractor, Processor, Storage, Reactor, Engine, Sensor, Habitat, Lab
- **In-place evolution:** Cards transform at their grid position (Tier 0-2)
- **Fork at Tier 3:** Cards split into Wonder/Dread variants with explicit player choice

### Visual Standards

- **Dark PCB aesthetic:** Background #0b0c10, neon accents (cyan/red-orange)
- **Neutral baseline:** Grey borders (#666), dark grey backgrounds (#1a1a1a), monospace typography
- **CSS variables:** Use `:root` custom properties for all sizing (--card-size, --viewport-cols, etc.)
- **Typography:** Monospace fonts (Consolas/Courier) with clear hierarchy (24px primary counters, smaller secondaries)

### Code Organization

- Modular file structure: Separate CSS files (reset, variables, layout, cards), separate JS modules (main, grid, cards, resources, utils)
- Semantic HTML5 with clear zone separation (log feed, grid canvas, data stack)
- No inline styles (all styling in CSS files)
- ES6+ JavaScript with clear module boundaries

## Development Workflow

### Documentation Requirements

- All features MUST have specification in DESIGN.md or feature-specific spec before implementation
- Card layouts MUST follow card_counter_spec.md template (200×200px, header/body/footer structure)
- UI layouts MUST reference desktop_ui.md specifications
- Update README.md roadmap checkboxes as phases complete

### Phase Gates

Before moving to next phase:
1. All phase deliverables completed and tested
2. 60 FPS validated with DevTools
3. User-facing documentation updated
4. Demo-able build ready

### Commit Discipline

- Commit after each logical task completion
- Reference phase/step in commit messages (e.g., "Phase 1 Step 3: Add CSS grid system")
- Document tactical decisions in commit messages when deviating from plan
- Use meaningful branch names for features

### Testing Approach (Post-MVP)

- Manual testing for MVP (Phase 1)
- User story validation before adding automation
- Integration tests for multi-card interactions (Phase 2+)
- Performance benchmarks for 60 FPS validation

## Governance

### Constitution Authority

This constitution supersedes all other development practices and preferences. When conflicts arise between this document and other guidance, this constitution takes precedence.

### Complexity Justification

Any violation of Simplicity & YAGNI (Principle II) MUST be documented:
- What complexity is being added
- Why simpler alternative was rejected
- What specific need justifies the complexity

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing principles
3. Update dependent templates and documentation
4. Increment version following semantic versioning:
   - MAJOR: Backward-incompatible principle changes (e.g., removing Performance-First)
   - MINOR: New principles or material expansions (e.g., adding Mobile-First)
   - PATCH: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

- All pull requests MUST verify alignment with Performance-First (60 FPS)
- All specifications MUST verify alignment with Design Integrity
- All phase deliverables MUST verify alignment with MVP-First Progression

### Development Guidance

Runtime development decisions and tactical guidance should reference:
- DESIGN.md for game mechanics and story
- IMPLEMENTATION.md for technical specifications
- MVP_BUILD_PLAN.md for step-by-step implementation
- card_counter_spec.md for card layout details

**Version**: 1.0.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-08
