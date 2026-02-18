# Tasks: Integration Layer

**Input**: Design documents from `/specs/005-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/integration.ts, quickstart.md

**Tests**: Included per Constitution §IX (Test-First Reliability).

**Organization**: Tasks are grouped by user story. US5 (Pipeline) is placed first because it's the core orchestrator that US1 (Init) and US3 (Error Boundaries) depend on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create the integration module structure and shared types.

- [x] T001 Create src/integration/ directory and types file (LobGPSState enum, LobGPSConfig interface, ResolvedConfig, KillSwitchDescriptor, IErrorBuffer) in src/integration/types.ts per contracts/integration.ts
- [x] T002 Update tsup.config.ts to add IIFE entry point for src/boot.ts with globalName 'LobGPS', noExternal, and iife format alongside existing ESM/CJS config

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities needed by ALL user stories. MUST complete before any story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Write ErrorBuffer tests in src/integration/error-buffer.test.ts — test push, FIFO eviction at cap 100, toArray chronological order, clear, size property, wrap-around behavior
- [x] T004 [P] Write ConfigResolver tests in src/integration/config-resolver.test.ts — test default resolution for all fields, partial override merging, module-specific config extraction (MapperConfig, TelemetryConfig, EngineConfig, UIConfig)
- [x] T005 Implement ErrorBuffer (capped ring buffer, max 100, oldest dropped first) in src/integration/error-buffer.ts — push, toArray, clear, size
- [x] T006 Implement ConfigResolver in src/integration/config-resolver.ts — resolveConfig(input: LobGPSConfig): ResolvedConfig, plus extractMapperConfig, extractTelemetryConfig, extractEngineConfig, extractUIConfig helper functions

**Checkpoint**: Foundation ready — error buffer and config resolution work independently.

---

## Phase 3: User Story 5 — Event Loop Pipeline (Priority: P1) 🎯 MVP Core

**Goal**: Orchestrate the full cycle: StateChangeEvent → Telemetry record → Engine query → UI render, with leading-edge debounce and per-step error isolation.

**Independent Test**: Mock all four modules, fire a StateChangeEvent, verify the pipeline calls Telemetry.record → Engine.query → UI.render in order within 50ms, and that errors in any step don't prevent subsequent steps.

### Tests for US5

- [x] T007 [P] [US5] Write Pipeline unit tests in src/integration/pipeline.test.ts — test: full cycle (mock Mapper→Telemetry→Engine→UI), leading-edge debounce (first event executes, second within 100ms dropped, third after 100ms executes), per-step error isolation (Telemetry throws → Engine still called, Engine throws → UI gets empty suggestions), AbortController cancellation on new cycle, pipeline start/stop lifecycle

### Implementation for US5

- [x] T008 [US5] Implement Pipeline class in src/integration/pipeline.ts — constructor takes (mapper, telemetry, engine, ui, config, errorReporter), start() subscribes to mapper 'state-change' event, stop() unsubscribes and aborts active cycle, handleStateChange() implements leading-edge debounce with 100ms window
- [x] T009 [US5] Implement pipeline cycle method in src/integration/pipeline.ts — onCycle(event: StateChangeEvent): records telemetry, queries engine, renders UI, each step in independent try-catch calling errorReporter, completes within 50ms budget
- [x] T010 [US5] Verify Pipeline tests pass — run `bun test src/integration/pipeline.test.ts`

**Checkpoint**: Pipeline orchestrates the event loop with debounce and error isolation.

---

## Phase 4: User Story 1 — Drop-In Script Initialization (Priority: P1) 🎯 MVP

**Goal**: Single `<script>` tag initializes the library. Modules boot in order. Duplicate detection prevents double init. `window.LobGPS` is the sole global.

**Independent Test**: Add `<script src="lob-gps.iife.js">` to messy-app.html, verify shadow host appears, mapper observes, `window.LobGPS.isActive === true`, zero console errors.

### Tests for US1

- [x] T011 [P] [US1] Write LobGPS lifecycle unit tests in src/integration/index.test.ts — test: constructor initializes all modules in order (Mapper→Telemetry→Engine→UI), isActive returns true after init, version returns package version, duplicate detection via Symbol-keyed property, DOMContentLoaded deferral when document.readyState === 'loading'

### Implementation for US1

- [x] T012 [US1] Implement LobGPS class in src/integration/index.ts — constructor(config?: LobGPSConfig), resolves config via ConfigResolver, creates modules in order (Mapper→Telemetry→Engine→UI), creates Pipeline, starts pipeline, exposes version/isActive/errors properties, implements state machine (ACTIVE/DISABLED/TORN_DOWN)
- [x] T013 [US1] Implement boot.ts in src/boot.ts — reads window.LobGPS as config (shallow copy), checks Symbol for duplicate detection, waits for DOMContentLoaded if needed, constructs LobGPS instance, replaces window.LobGPS with API proxy, sets Symbol property
- [x] T014 [US1] Update src/index.ts barrel exports to include LobGPS class and LobGPSConfig type from src/integration/
- [x] T015 [US1] Verify LobGPS tests pass — run `bun test src/integration/index.test.ts`

**Checkpoint**: Library self-initializes via `<script>` tag with zero host modifications.

---

## Phase 5: User Story 2 — Kill Switch (Priority: P1)

**Goal**: Configurable key combo (default Ctrl+Shift+K) and `disable()`/`enable()` API instantly tear down and reinitialize the overlay.

**Independent Test**: Initialize the library, press Ctrl+Shift+K, verify shadow host removed and isActive === false. Call enable(), verify overlay reinitializes with telemetry data preserved.

### Tests for US2

- [x] T016 [P] [US2] Write KillSwitch unit tests in src/integration/kill-switch.test.ts — test: parseCombo("Ctrl+Shift+K") returns correct descriptor, keydown event matching (ctrl+shift+k matches, ctrl+k doesn't), listener attaches to document capture phase, listener removal on teardown, custom combo parsing ("Ctrl+Alt+G"), case-insensitive key matching

### Implementation for US2

- [x] T017 [US2] Implement KillSwitch module in src/integration/kill-switch.ts — parseCombo(combo: string): KillSwitchDescriptor, attach(descriptor, callback, signal: AbortSignal): void (uses document.addEventListener with capture:true and signal), matchesEvent(descriptor, event: KeyboardEvent): boolean
- [x] T018 [US2] Wire kill switch into LobGPS class — attach listener in constructor using kill switch module, callback invokes this.disable(), listener removed via AbortController on teardown
- [x] T019 [US2] Implement disable() and enable() methods in LobGPS class — disable() stops pipeline, tears down Mapper/Engine/UI (preserves Telemetry), sets state to DISABLED, removes kill switch listener. enable() recreates Mapper/Engine/UI, creates new Pipeline, starts it, reattaches kill switch, sets state to ACTIVE. Both are no-ops in invalid states per FR-023.
- [x] T020 [US2] Verify KillSwitch and disable/enable tests pass — run `bun test src/integration/kill-switch.test.ts src/integration/index.test.ts`

**Checkpoint**: Kill switch works via key combo and API. Enable/disable cycle preserves telemetry.

---

## Phase 6: User Story 3 — Error Boundaries (Priority: P1)

**Goal**: Every module boundary catches errors silently. Errors go to ring buffer + onError callback. Cascading failures trigger auto-disable. Debug mode logs to console.warn.

**Independent Test**: Mock each module to throw, verify no error reaches window.onerror. Trigger 5 consecutive errors within 10s, verify auto-disable fires.

### Tests for US3

- [x] T021 [P] [US3] Write error boundary integration tests in src/integration/index.test.ts — test: Mapper observer throw is caught and buffered, Telemetry.record throw drops transition silently, Engine.query throw returns empty suggestions to UI, UI.render throw is caught, errors appear in window.LobGPS.errors, onError callback receives errors (additive with buffer), onError callback throw is silenced (double try-catch), debug:true logs to console.warn
- [x] T022 [P] [US3] Write auto-disable tests in src/integration/pipeline.test.ts — test: 5 consecutive errors within 10s triggers auto-disable callback, fewer than 5 errors doesn't trigger, errors spread over >10s don't trigger, auto-disable event appears in error buffer, error counter resets after successful cycle

### Implementation for US3

- [x] T023 [US3] Implement error reporting in LobGPS class — reportError(err) pushes to ErrorBuffer, calls onError callback (wrapped in try-catch), calls console.warn if debug:true. Wire Pipeline's errorReporter to this method.
- [x] T024 [US3] Implement auto-disable logic in Pipeline — track consecutiveErrors and errorWindowStart, increment on error (reset window if expired), trigger auto-disable callback when threshold reached, reset counter on successful cycle
- [x] T025 [US3] Wire auto-disable callback from Pipeline to LobGPS.disable() — add "Auto-disabled" event to error buffer before disabling
- [x] T026 [US3] Verify error boundary tests pass — run `bun test src/integration/`

**Checkpoint**: All module errors are caught, buffered, and optionally reported. Cascading failures auto-disable.

---

## Phase 7: User Story 4 — Configuration Surface (Priority: P2)

**Goal**: Full config surface fans out to all modules. Runtime `configure()` merges partial updates for next cycle.

**Independent Test**: Initialize with custom config (maxSuggestions: 5, killSwitch: Ctrl+Alt+G), verify settings take effect. Call configure({ maxSuggestions: 1 }), trigger next cycle, verify only 1 suggestion returned.

### Tests for US4

- [x] T027 [P] [US4] Write configure() tests in src/integration/index.test.ts — test: configure() merges partial config, takes effect on next cycle (not immediately), no-op when disabled or torn down, all LobGPSConfig fields are properly fanned out to module configs at init

### Implementation for US4

- [x] T028 [US4] Implement configure() method in LobGPS class — merges partial LobGPSConfig into stored resolved config, does not trigger re-render (FR-021), no-op in DISABLED/TORN_DOWN states. Pipeline reads current config at cycle time.
- [x] T029 [US4] Implement config fan-out to modules — when Pipeline creates a cycle, it reads the latest ResolvedConfig and passes module-specific slices to each module. Engine gets maxSuggestions + curatedPaths, UI gets miniMapAnchor + zIndex, etc.
- [x] T030 [US4] Verify configure tests pass — run `bun test src/integration/`

**Checkpoint**: Full configuration surface works at init time and runtime.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: E2e tests, build verification, bundle size, barrel exports.

- [x] T031 Write Playwright e2e tests in test/e2e/integration.spec.ts — test: script tag init (shadow host appears, no console errors), kill switch Ctrl+Shift+K removes overlay, disable/enable cycle, full pipeline fires on DOM mutation, duplicate script no-op, error boundary (injected fault doesn't reach window.onerror)
- [x] T032 Verify IIFE build produces dist/lob-gps.iife.js — run `bun run build`, check output exists and is valid JS
- [x] T033 Verify bundle size is under 50KB gzipped — run build, measure gzipped size of IIFE bundle
- [x] T034 Run full test suite (unit + e2e) — run `bun test` and `bun run test:e2e`
- [x] T035 Run TypeScript strict check — run `bun run lint` (tsc --noEmit), verify zero errors/warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US5 Pipeline (Phase 3)**: Depends on Phase 2 (ErrorBuffer, ConfigResolver)
- **US1 Init (Phase 4)**: Depends on Phase 3 (Pipeline)
- **US2 Kill Switch (Phase 5)**: Depends on Phase 4 (LobGPS class exists)
- **US3 Error Boundaries (Phase 6)**: Depends on Phase 4 (LobGPS class exists)
- **US4 Configuration (Phase 7)**: Depends on Phases 5 + 6 (full LobGPS class with disable/enable/errors)
- **Polish (Phase 8)**: Depends on all story phases

### User Story Dependencies

- **US5 (Pipeline)**: Foundation only — core orchestrator, no story dependencies
- **US1 (Init)**: Depends on US5 (pipeline is created during init)
- **US2 (Kill Switch)**: Depends on US1 (needs LobGPS class to wire disable/enable)
- **US3 (Error Boundaries)**: Depends on US1 (needs LobGPS class for error reporting). Can run parallel with US2.
- **US4 (Configuration)**: Depends on US2 + US3 (needs full lifecycle + error plumbing)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/contracts before implementation
- Core logic before wiring
- Verify tests pass after implementation

### Parallel Opportunities

- T003 + T004 can run in parallel (different test files)
- T005 + T006 can run in parallel after their respective tests
- T007 + T011 + T016 can run in parallel (test files for different stories)
- T021 + T022 can run in parallel (different test files)
- US2 and US3 can run in parallel after US1 completes

---

## Parallel Example: Foundational Phase

```bash
# Launch both foundational test tasks together:
Task: "Write ErrorBuffer tests in src/integration/error-buffer.test.ts"
Task: "Write ConfigResolver tests in src/integration/config-resolver.test.ts"

# Then launch both implementations together:
Task: "Implement ErrorBuffer in src/integration/error-buffer.ts"
Task: "Implement ConfigResolver in src/integration/config-resolver.ts"
```

## Parallel Example: US2 + US3

```bash
# After US1 completes, US2 and US3 can run in parallel:
# Developer A: US2 Kill Switch
Task: "Write KillSwitch tests" → "Implement KillSwitch" → "Wire into LobGPS"

# Developer B: US3 Error Boundaries
Task: "Write error boundary tests" → "Implement error reporting" → "Wire auto-disable"
```

---

## Implementation Strategy

### MVP First (US5 + US1)

1. Complete Phase 1: Setup (types, tsup config)
2. Complete Phase 2: Foundational (error buffer, config resolver)
3. Complete Phase 3: US5 Pipeline (core event loop)
4. Complete Phase 4: US1 Drop-In Init (LobGPS class + boot.ts)
5. **STOP and VALIDATE**: Test with `<script>` tag on messy-app.html

### Incremental Delivery

1. Setup + Foundational → Core utilities ready
2. US5 Pipeline → Event loop works in isolation
3. US1 Init → Library self-initializes via `<script>` tag → **Demo-ready MVP**
4. US2 Kill Switch → Safety net available
5. US3 Error Boundaries → Production-grade resilience
6. US4 Configuration → Full customization surface
7. Polish → E2e tests, build verification, bundle size

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution §IX requires test-first — write tests, verify they fail, then implement
- Telemetry instance is shared across disable/enable cycles (FR-014)
- Pipeline uses leading-edge debounce: first event executes immediately, 100ms cooldown (FR-011)
- Error buffer is capped at 100, ring buffer FIFO (clarification session 2026-02-17)
- All API calls in invalid states are silent no-ops (FR-023)
