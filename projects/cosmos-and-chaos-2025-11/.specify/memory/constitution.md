<!--
Sync Impact Report:
  Version: 1.1.0 (Testability Amendment)
  Modified principles:
    - Principle II (Simplicity & YAGNI) - Added testing tools exception
    - Documentation Requirements - Added test validation workflow
    - Phase Gates - Added testing requirements
  Added sections:
    - Principle VI (Testability & Maintainability)
    - Testing Strategy section
  Removed sections: None
  Templates requiring updates:
    ⚠️ plan-template.md - Should include test planning section
    ⚠️ spec-template.md - Should include test validation criteria
    ⚠️ tasks-template.md - Should include test implementation tasks
  Follow-up TODOs:
    - Add tests to Phase 1/1.5 code before starting Phase 2
    - Set up Vitest configuration
    - Create test examples for state.js and save.js
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
- **Exception: Testing infrastructure** - Testing frameworks (Vitest) and minimal build tooling for tests are exempt from this rule. Quality infrastructure is not product complexity.
- No abstractions until pattern emerges 3+ times
- Defer Wonder/Dread physics, adjacency bonuses, audio until post-MVP

**Rationale:** Over-engineering slows development and obscures the core gameplay. Complexity must be earned through demonstrated need, not anticipated requirements. Testing infrastructure supports simplicity by catching regressions early.

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

### VI. Testability & Maintainability (NEW)

**All game logic MUST be testable in isolation.** Code that cannot be tested cannot be maintained.

- **Automated unit tests required** for all new features (Phase 2+)
- Tests MUST run in Node.js/terminal without requiring a browser
- Game logic (state mutations, calculations) decoupled from DOM
- **Phase 1.5 → Phase 2 gate:** Add tests to existing code (state.js, save.js, resources.js) before starting Phase 2
- Tests validate specifications - when behavior changes, both spec and tests update

**Rationale:** As the game grows, manual testing becomes impractical. Automated tests enable confident refactoring, catch regressions early, and serve as executable documentation of intended behavior.

## Technical Standards

### Architecture Patterns (Phase 1.5+)

- **Centralized state:** All game data lives in GameState class (state.js)
- **Event-driven updates:** UI subscribes to state changes via event bus
- **Logic/DOM separation:** Game logic MUST be testable without DOM
- **Validation at boundaries:** All state mutations validate inputs
- **Serialization support:** State MUST be serializable for save/load

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

- Modular file structure: Separate CSS files (reset, variables, layout, cards), separate JS modules (main, grid, cards, resources, utils, state, save)
- Semantic HTML5 with clear zone separation (log feed, grid canvas, data stack)
- No inline styles (all styling in CSS files)
- ES6+ JavaScript with clear module boundaries
- State management centralized in state.js
- Persistence layer isolated in save.js

## Development Workflow

### Documentation Requirements

- All features MUST have specification in DESIGN.md or feature-specific spec before implementation
- Card layouts MUST follow card_counter_spec.md template (200×200px, header/body/footer structure)
- UI layouts MUST reference desktop_ui.md specifications
- Update README.md roadmap checkboxes as phases complete
- **Tests validate docs:** Specifications describe behavior, tests prove it works

### Test-Driven Workflow (Phase 2+)

1. **Spec first** - Document the intended behavior in DESIGN.md or feature spec
2. **Test second** - Write tests that validate the spec (supports TDD when appropriate)
3. **Implement** - Write code to make tests pass
4. **Both stay in sync** - Changing behavior requires updating BOTH spec AND tests

**Test writing guidelines:**
- Tests should be readable - they serve as executable examples
- Test public APIs, not implementation details
- One behavior per test (clear pass/fail)
- Use descriptive test names that explain intent

### Testing Strategy

**What to test:**
- ✅ State mutations (addResource, incrementProduction, placeCard)
- ✅ Save/load serialization and validation
- ✅ Resource calculations and constraints
- ✅ Card production logic
- ✅ Event bus (emit/subscribe behavior)

**What NOT to test (initially):**
- ❌ DOM manipulation (covered by integration tests later)
- ❌ CSS styling (visual QA)
- ❌ Browser APIs (localStorage - mock in tests)

**Test organization:**
- Mirror source structure: `src/js/state.js` → `tests/state.test.js`
- Use Vitest for test runner (fast, ES modules support)
- Run tests with: `npm test`
- CI integration (future): Tests must pass before merge

### Phase Gates

Before moving to next phase:
1. All phase deliverables completed and tested
2. 60 FPS validated with DevTools
3. **Unit tests written and passing** (Phase 2+ requirement)
4. User-facing documentation updated
5. Demo-able build ready

**Special gate: Phase 1.5 → Phase 2**
- Add tests to existing Phase 1/1.5 code:
  - state.js (GameState mutations)
  - save.js (SaveManager serialization)
  - resources.js (resource calculations)
- Achieve baseline test coverage of critical paths
- Set up Vitest configuration and test infrastructure

### Commit Discipline

- Commit after each logical task completion
- Reference phase/step in commit messages (e.g., "Phase 1 Step 3: Add CSS grid system")
- Document tactical decisions in commit messages when deviating from plan
- Use meaningful branch names for features
- **Include test changes in same commit as code changes** (tests and code stay synchronized)

### Testing Approach

- **Phase 1:** Manual testing (completed)
- **Phase 1.5:** Add unit tests to existing code (refactoring phase)
- **Phase 2+:** All new features require unit tests before merge
- **Future:** Integration tests for multi-card interactions
- **Always:** Performance benchmarks for 60 FPS validation

## Governance

### Constitution Authority

This constitution supersedes all other development practices and preferences. When conflicts arise between this document and other guidance, this constitution takes precedence.

### Complexity Justification

Any violation of Simplicity & YAGNI (Principle II) MUST be documented:
- What complexity is being added
- Why simpler alternative was rejected
- What specific need justifies the complexity

**Note:** Testing infrastructure is exempt - quality tooling is always justified.

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing principles
3. Update dependent templates and documentation
4. Increment version following semantic versioning:
   - MAJOR: Backward-incompatible principle changes (e.g., removing Performance-First)
   - MINOR: New principles or material expansions (e.g., adding Testability)
   - PATCH: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

- All pull requests MUST verify alignment with Performance-First (60 FPS)
- All specifications MUST verify alignment with Design Integrity
- All phase deliverables MUST verify alignment with MVP-First Progression
- **All new features (Phase 2+) MUST include unit tests**

### Development Guidance

Runtime development decisions and tactical guidance should reference:
- DESIGN.md for game mechanics and story
- IMPLEMENTATION.md for technical specifications
- MVP_BUILD_PLAN.md for step-by-step implementation
- card_counter_spec.md for card layout details
- This constitution for principles and requirements

---

**Version**: 1.1.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-10

**Amendment Notes (v1.1.0):**
- Added Principle VI: Testability & Maintainability
- Updated Principle II to allow testing frameworks (Vitest)
- Added test-driven workflow and testing strategy
- Added Phase 1.5 → Phase 2 gate (add tests to existing code)
- Updated documentation requirements (tests validate docs)
- Rationale: MVP proven, now focusing on long-term maintainability
