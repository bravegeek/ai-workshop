# Tasks: Engine Module

**Input**: Design documents from `/specs/003-engine/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/engine.ts

**Tests**: Included — Constitution §IX mandates test-first with 100% coverage (SC-006).

**Organization**: Tasks are grouped by user story. All three stories are P1 but decompose into distinct modules: ranker (US1), curated + merger (US2), labels (US3 cross-cutting). The Engine class (index.ts) orchestrates all modules and is built after user stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Directory structure and type definitions

- [x] T001 Create `src/engine/` directory and empty module files per plan.md structure
- [x] T002 Define all types in `src/engine/types.ts`: Suggestion, SuggestionSource, CuratedPath, CuratedStep, EngineConfig — import NormalizedSelector, StateKey from `src/mapper/types.ts` and FrequencyEntry, TelemetryProvider from `src/telemetry/types.ts` (reference `specs/003-engine/contracts/engine.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared test infrastructure used by all user story tests

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create mock TelemetryProvider factory in `src/engine/test-helpers.ts` — accepts a `Record<string, FrequencyEntry[]>` map, returns a TelemetryProvider whose `query()` returns the matching entries. Include helper to create branded StateKey and NormalizedSelector values for tests.

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Predictive Suggestion Ranking (Priority: P1) 🎯 MVP

**Goal**: Given a StateKey, query telemetry and return suggestions ranked by frequency with deterministic tie-breaking (highest count, then most recent lastSeenTimestamp). Confidence = count / totalTransitions.

**Independent Test**: Pre-load a mock TelemetryProvider with known frequency data for 3 StateKeys. Call the engine ranker with each and verify order, confidence, and maxSuggestions truncation.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write ranking tests in `src/engine/ranker.test.ts`: (1) correct frequency order for 3 selectors, (2) 7 entries → all 7 returned in frequency order (ranker does not truncate), (3) tie-breaking by lastSeenTimestamp when counts are equal, (4) empty FrequencyEntry[] returns [], (5) confidence normalization (count/sum = expected value), (6) single entry yields confidence 1.0
- [x] T005 [P] [US1] Write predicted label tests in `src/engine/labels.test.ts`: (1) confidence ≥0.5 → "Most common next action (N%)", (2) confidence ≥0.2 and <0.5 → "Frequently used (N%)", (3) confidence <0.2 → "Sometimes used (N%)", (4) percentage is always whole number (Math.round), (5) boundary values: exactly 0.5, exactly 0.2

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement label generation for predicted suggestions in `src/engine/labels.ts`: export `generatePredictedLabel(confidence: number): string` using the three-tier template with Math.round(confidence * 100) percentage
- [x] T007 [US1] Implement frequency ranking in `src/engine/ranker.ts`: export `rankPredicted(entries: FrequencyEntry[]): Suggestion[]` — compute totalTransitions, map to Suggestion with confidence + label, sort by count desc then lastSeenTimestamp desc. Do NOT truncate — the merger (T011) owns final truncation after combining with curated suggestions

**Checkpoint**: Ranker produces correctly ordered predicted suggestions with confidence labels. Tests pass.

---

## Phase 4: User Story 2 — Curated Golden Path Suggestions (Priority: P1)

**Goal**: Accept curated path definitions, build a StateKey→nextStep index, resolve matching curated steps at query time, merge with predicted suggestions (curated first, dedup by selector).

**Independent Test**: Load a curated path with 4 steps, query at step 2, verify step 3 is top suggestion with source "curated", confidence 1.0, avgDwellTime 0. Verify curated beats predicted when same selector.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US2] Write curated path tests in `src/engine/curated.test.ts`: (1) 4-step path at S2 suggests S3 as next, (2) last step produces no suggestion, (3) empty paths array → no curated suggestions, (4) no matching StateKey → empty array, (5) exact string match only (no partial), (6) multiple paths matching same StateKey → both next steps returned, (7) multi-path dedup: same target selector → first-registered path wins, (8) curated suggestion has confidence 1.0, avgDwellTime 0, correct curatedPathId
- [x] T009 [P] [US2] Write merger tests in `src/engine/merger.test.ts`: (1) curated before predicted in output, (2) same selector in curated and predicted → only curated kept, (3) total respects maxSuggestions (2 curated + 3 predicted, max 3 → 2 curated + 1 predicted), (4) zero curated → only predicted, (5) zero predicted → only curated, (6) both empty → empty array, (7) more curated than maxSuggestions → only curated returned

### Implementation for User Story 2

- [x] T010 [US2] Implement curated path indexing and step resolution in `src/engine/curated.ts`: export `CuratedIndex` class — constructor builds `Map<StateKey, {step: CuratedStep, pathId: string}[]>` from CuratedPath[], export `resolve(stateKey: StateKey): Suggestion[]` that looks up next steps, deduplicates by targetSelector (first-registered wins), converts to Suggestion with source CURATED, confidence 1.0, avgDwellTime 0, label from step
- [x] T011 [US2] Implement merge and deduplication in `src/engine/merger.ts`: export `mergeSuggestions(curated: Suggestion[], predicted: Suggestion[], maxSuggestions: number): Suggestion[]` — build selector Set from curated, filter predicted, concatenate, truncate

**Checkpoint**: Curated paths resolve correctly, merge with predicted respects priority and dedup. Tests pass.

---

## Phase 5: User Story 3 — Contextual Labels ("Why" Layer) (Priority: P1)

**Goal**: Verify every suggestion (curated and predicted) has a correct, non-empty, human-readable label. Curated labels are verbatim from path definitions. Predicted labels use tiered confidence templates.

**Independent Test**: Query the engine with mixed curated + predicted data and assert every returned suggestion has a non-empty label matching the expected format.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [US3] Write cross-cutting label validation tests in `src/engine/labels.test.ts` (append to existing file): (1) curated label passthrough — input label "Step 3: Review billing details" → output label identical, (2) label is never null/empty/undefined across all suggestion types, (3) label never contains a raw CSS selector string (no `#`, no `[data-testid=`, no `:nth-of-type`), (4) predicted label at confidence 0.84 → "Most common next action (84%)", (5) predicted label at confidence 0.35 → "Frequently used (35%)", (6) predicted label at confidence 0.08 → "Sometimes used (8%)", (7) confidence 0.0 → "Sometimes used (0%)", (8) confidence 1.0 predicted → "Most common next action (100%)"

### Implementation for User Story 3

No new implementation needed — curated labels are set directly from `step.label` in curated.ts (T010), and predicted labels are generated by labels.ts (T006). US3's value is the cross-cutting test validation in T012.

**Checkpoint**: All label scenarios validated across curated and predicted. Tests pass.

---

## Phase 6: Engine Orchestration

**Purpose**: Wire all modules into the Engine class with full error handling and the public API

### Tests

- [x] T013 [P] Write Engine integration tests in `src/engine/index.test.ts`: (1) full pipeline: mock provider → query → correctly ranked Suggestion[], (2) cold start (empty provider, no paths) → [], (3) curated + predicted mixed scenario → correct order, dedup, labels, (4) maxSuggestions config respected, (5) error in provider.query() → returns [] and calls onError, (6) error in onError callback → silenced, still returns [], (7) onError not configured → errors silently return [], (8) query is stateless — two consecutive calls with different StateKeys return independent results, (9) default maxSuggestions is 3 when not configured, (10) curatedPaths defaults to [] when not configured

### Implementation

- [x] T014 Implement Engine class in `src/engine/index.ts`: constructor takes EngineConfig, builds CuratedIndex from curatedPaths, stores telemetryProvider and maxSuggestions. Export `query(stateKey: StateKey): Suggestion[]` — calls provider.query(), resolves curated, ranks predicted, merges, returns. Top-level try-catch with onError forwarding per FR-015.
- [x] T015 Add Engine exports to `src/index.ts`: export Engine class, Suggestion, SuggestionSource, CuratedPath, CuratedStep, EngineConfig types from `src/engine/`

**Checkpoint**: Full engine pipeline works end-to-end. All tests pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, performance, and zero-warnings compliance

- [x] T016 Run `bun run lint` and fix any TypeScript strict-mode warnings in `src/engine/` — zero warnings policy (Constitution §VII)
- [x] T017 Run `bun run build` and verify Engine types appear in `dist/index.d.ts` output
- [x] T018 Run `bun run test` and verify 100% coverage on all `src/engine/` files (SC-006)
- [x] T019 Add a performance benchmark test in `src/engine/index.test.ts`: generate a mock provider with 100 FrequencyEntries for a single StateKey + 3 curated paths with 10 steps each, call query() 1000 times, assert average <50ms per call (FR-014)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types.ts must exist for test helpers)
- **User Stories (Phases 3–5)**: All depend on Phase 2 completion
  - US1 and US2 can proceed in parallel (different files)
  - US3 depends on US1 (labels.ts exists) but test file is separate
- **Engine Orchestration (Phase 6)**: Depends on US1, US2, US3 completion
- **Polish (Phase 7)**: Depends on Phase 6 completion

### User Story Dependencies

- **US1 (Predictive Ranking)**: Depends only on Foundational. No other story dependencies.
- **US2 (Curated Paths)**: Depends only on Foundational. No dependency on US1 — uses own Suggestion construction.
- **US3 (Labels)**: Depends on US1 (labels.ts) and US2 (curated.ts). Validation-only phase — appends cross-cutting tests to labels.test.ts. Can start after T006 and T010.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/helpers before logic modules
- Logic modules before integration
- Story complete before moving to next phase

### Parallel Opportunities

- T004 + T005: Both US1 test files, different files
- T006 + (T004, T005): labels.ts has no deps on ranker tests — but tests should fail first
- T008 + T009: Both US2 test files, different files
- T013 + T016: Engine integration tests + lint check (different concerns)
- US1 and US2 can be worked on in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch both US1 test files together (they're independent files):
T004: "Write ranking tests in src/engine/ranker.test.ts"
T005: "Write predicted label tests in src/engine/labels.test.ts"

# Then launch both US1 implementation files together:
T006: "Implement label generation in src/engine/labels.ts"  # [P] — no deps on ranker
T007: "Implement frequency ranking in src/engine/ranker.ts"  # depends on T006 (imports labels)
```

## Parallel Example: User Story 2

```bash
# Launch both US2 test files together (they're independent files):
T008: "Write curated path tests in src/engine/curated.test.ts"
T009: "Write merger tests in src/engine/merger.test.ts"

# Then implementation (sequential — merger uses curated types):
T010: "Implement curated path indexing in src/engine/curated.ts"
T011: "Implement merge and dedup in src/engine/merger.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types.ts)
2. Complete Phase 2: Foundational (test helpers)
3. Complete Phase 3: US1 (ranker + predicted labels)
4. **STOP and VALIDATE**: The engine can rank predicted suggestions from telemetry data
5. This is immediately useful — even without curated paths, the system learns from user behavior

### Incremental Delivery

1. Setup + Foundational → Types and test infrastructure ready
2. Add US1 (Predictive Ranking) → Test independently → Core intelligence works
3. Add US2 (Curated Paths) → Test independently → Day 1 expert-authored guidance works
4. Add US3 (Labels validation) → Test independently → All labels verified correct
5. Add Engine Orchestration → Full pipeline wired → Ready for integration with UI (004)
6. Polish → Build verified, 100% coverage, zero warnings

### Parallel Team Strategy

With two developers:

1. Both complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (ranker + predicted labels)
   - Developer B: US2 (curated + merger)
3. US3 can be picked up by whoever finishes first
4. Engine Orchestration (Phase 6) after both stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All tests use Vitest only — no DOM environment, no happy-dom, no Playwright (SC-008)
- Mock TelemetryProvider is the only test dependency
- Import branded types (NormalizedSelector, StateKey) from mapper; cast with `as` in tests
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
