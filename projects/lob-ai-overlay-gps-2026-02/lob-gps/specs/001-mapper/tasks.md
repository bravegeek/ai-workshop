# Tasks: Mapper Module

**Input**: Design documents from `/specs/001-mapper/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/mapper.ts, research.md, quickstart.md

**Tests**: REQUIRED — Constitution §IX mandates 100% unit test coverage and test-first approach. SC-006 explicitly requires 100% coverage on selector generation, dynamic ID detection, and StateKey generation.

**Organization**: Tasks grouped by user story. US2 (Dynamic ID Detection) is implemented before US1 (Selector Generation) because the selector generator depends on the dynamic ID detector. US3 (StateKey) depends on selector types. US4 (DOM Observation) depends on StateKey generation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Project structure and shared type definitions

- [X] T001 Create mapper module directory structure: `src/mapper/` with empty files per plan.md (`index.ts`, `types.ts`, `selector-generator.ts`, `dynamic-id-detector.ts`, `state-key.ts`, `page-fingerprint.ts`, `dom-observer.ts`) and `test/e2e/` directory
- [X] T002 Implement all shared types, enums, and branded type aliases in `src/mapper/types.ts` per `contracts/mapper.ts` — includes `SelectorTier`, `StateChangeTrigger`, `NormalizedSelector`, `StateKey`, `SelectorResult`, `StateChangeEvent`, `MapperConfig`, `StateKeyOptions`, `IMapper`, `IsDynamicId`, `ResolveSelector`, and all callback/event types
- [X] T003 Update `src/index.ts` to re-export public API from `src/mapper/index.ts` (stub the Mapper class export for now)

**Checkpoint**: `bun run lint` passes with all type definitions in place. All other source files can import from `types.ts`.

---

## Phase 2: User Story 2 — Dynamic ID Detection (Priority: P1)

**Goal**: Detect and discard auto-generated/dynamic IDs (Ember, Angular, React, GUIDs, numeric suffixes) so they never pollute selectors or StateKeys. Supports configurable allowlist/denylist overrides.

**Independent Test**: Feed known dynamic ID patterns to the detector and verify 100% correct classification. Verify `#ember-id-7721-a` from `messy-app.html` is flagged.

**Why first**: US1 (Selector Generation) depends on this — the selector generator calls `isDynamicId()` to skip unstable IDs.

### Tests for US2

> **Write these tests FIRST. Ensure they FAIL before implementation.**

- [X] T004 [US2] Write unit tests in `src/mapper/dynamic-id-detector.test.ts` covering all acceptance scenarios: (1) Ember patterns (`ember123`, `ember-id-7721-a`) → dynamic, (2) GUID patterns → dynamic, (3) numeric suffix 4+ digits (`field_8832`) → dynamic, (4) stable IDs (`save-btn`, `acc_id_input`) → stable, (5) Angular patterns (`_ngcontent-*`, `cdk-overlay-0`, `mat-input-3`) → dynamic, (6) allowlist overrides denylist and built-in patterns, (7) denylist overrides built-in stable classification, (8) React useId (`:r0:`), jQuery UI (`ui-id-1`), rc-component (`rc-select-0`), Downshift (`downshift-0-input`) patterns → dynamic, (9) invalid regex in config throws at construction time

### Implementation for US2

- [X] T005 [US2] Implement `isDynamicId()` and `normalizeString()` functions and `BUILT_IN_DYNAMIC_PATTERNS` array in `src/mapper/dynamic-id-detector.ts` — two-tier detection per research.md R1: (1) framework-specific high-confidence patterns checked first (Ember, Angular CDK/Material, React useId, jQuery UI, rc-component, Reach UI, Downshift), (2) generic structural patterns as fallback (UUID any version, UUID embedded, pure numeric, long numeric suffix 4+ digits, hex suffix 6+ chars). `normalizeString(input)` strips these patterns from any string. Allowlist checked first (returns stable), then denylist, then built-in patterns. Compile RegExp patterns from config strings via `new RegExp(pattern)` — throw on invalid patterns. Export `isDynamicId` matching the `IsDynamicId` type from `types.ts`.
- [X] T006 [US2] Run `bun run test` and verify all T004 tests pass with 100% coverage on `dynamic-id-detector.ts`

**Checkpoint**: `isDynamicId("ember-id-7721-a")` returns `true`. `isDynamicId("save-btn")` returns `false`. All 6 acceptance scenarios pass.

---

## Phase 3: User Story 1 — Stable Selector Generation (Priority: P1) MVP

**Goal**: Generate normalized, stable CSS selectors using the tiered hierarchy (ID > data-testid > aria-label > Text Content > DOM Path) that survive page reloads. Returns `SelectorResult` with `ambiguous` flag.

**Independent Test**: Given `messy-app.html`, generate selectors for each interactive element and verify each can `querySelector` back to the same element after a page reload.

### Tests for US1

> **Write these tests FIRST. Ensure they FAIL before implementation.**

- [X] T007 [US1] Write unit tests in `src/mapper/selector-generator.test.ts` covering all acceptance scenarios: (1) element with stable ID (`#save-btn`) → `#save-btn` at tier ID, (2) element with dynamic ID (`#ember-id-7721-a`) → falls through to next tier (uses `input[name="ref_code"]` or data-testid), (3) element with `data-testid` → uses `[data-testid="value"]` at tier DATA_TESTID, (4) element with `aria-label` only → uses `[aria-label="value"]` at tier ARIA_LABEL, (5) interactive element with unique text but no stable attrs → stable ancestor + tag at tier TEXT_CONTENT with `textHint` set, (6) element with no stable attrs → DOM path selector at tier DOM_PATH with `:nth-of-type()` and normalized classes/attributes, (7) generated selector resolves to exactly one element (uniqueness validation), (8) ambiguous selector returns `SelectorResult` with `ambiguous: true`, (9) performance: selector generation completes in <5ms. Use happy-dom to construct test DOM fixtures.

### Implementation for US1

- [X] T008 [US1] Implement helper functions in `src/mapper/selector-generator.ts`: `findStableAnchor(element, maxDepth)` — walks up DOM tree checking for stable ID (via `isDynamicId`), `data-testid`, `aria-label`, semantic landmark tags; `buildStepSelector(element)` — produces `tag:nth-of-type(n)` for an element among its siblings; `buildDomPathSelector(element, maxDepth)` — builds full path from element to nearest stable anchor or body using `>` combinator
- [X] T009 [US1] Implement `resolveSelector(result, root?)` utility function in `src/mapper/selector-generator.ts` matching the `ResolveSelector` type — uses `querySelectorAll` for non-TEXT_CONTENT tiers, adds `textHint` filtering for TEXT_CONTENT tier selectors
- [X] T010 [US1] Implement main `generateSelector(element): SelectorResult` function in `src/mapper/selector-generator.ts` — tiered cascade: (1) check element ID, skip if `isDynamicId` returns true, validate uniqueness with `querySelectorAll`; (2) check `data-testid`; (3) check `aria-label`; (4) TEXT_CONTENT tier for interactive elements (button, a, [role=button]) — find closest stable ancestor, build scoped selector, set `textHint`; (5) DOM_PATH fallback — build structural path capped at `maxAncestorDepth`. Use `normalizeString()` on all class names and attribute values in all tiers to strip GUIDs/dynamic noise. Each tier validates uniqueness. If no tier produces unique selector, return best-effort with `ambiguous: true`. Wrap all DOM reads in try-catch per FR-010.
- [X] T011 [US1] Run `bun run test` and verify all T007 tests pass with 100% coverage on `selector-generator.ts`

**Checkpoint**: All interactive elements in a test DOM produce selectors that survive re-query. Dynamic IDs are skipped. `SelectorResult` objects have correct `tier` and `ambiguous` values.

---

## Phase 4: User Story 3 — StateKey Generation (Priority: P1)

**Goal**: Produce deterministic StateKeys (`URL::selector` or `fingerprint::selector`) representing the user's workflow position. Support URL mode (default) and page fingerprinting mode via config flag.

**Independent Test**: Navigate through `messy-app.html`'s multi-step workflow (load → Save → Finalize appears) and verify 3 distinct, deterministic StateKeys.

### Tests for US3

> **Write these tests FIRST. Ensure they FAIL before implementation.**

- [X] T012 [P] [US3] Write unit tests for FNV-1a hash in `src/mapper/page-fingerprint.test.ts`: (1) deterministic — same input always produces same 8-hex-char output, (2) different inputs produce different outputs, (3) known test vector validation
- [X] T013 [P] [US3] Write unit tests in `src/mapper/page-fingerprint.test.ts` for fingerprint generation: (1) extracts `document.title`, h1-h3 text, active nav items, (2) ignores hidden elements, (3) ignores elements with empty or >100 char text, (4) ignores elements inside `[role="dialog"]` and `data-lob-gps-ignore` containers, (5) sorts anchors deterministically — same DOM in different order produces same hash, (6) noise div injection does not change fingerprint, (7) PII/PHI filtering: discards anchors matching email/phone/welcome-name patterns.
- [X] T014 [P] [US3] Write unit tests in `src/mapper/state-key.test.ts` covering all acceptance scenarios: (1) initial page load → `{url}::` (empty action component), (2) after clicking `#save-btn` → `{url}::#save-btn`, (3) same URL + same action across sessions → identical StateKey, (4) fingerprinting enabled → uses hash instead of URL, (5) noise div injection → no effect on fingerprint StateKey, (6) different semantic content at same URL → different fingerprint StateKeys, (7) accepts `StateKeyOptions` parameter without breaking

### Implementation for US3

- [X] T015 [P] [US3] Implement FNV-1a 32-bit hash function in `src/mapper/page-fingerprint.ts` — pure function, ~10 lines, returns 8-character hex string. No dependencies.
- [X] T016 [US3] Implement `generatePageFingerprint()` function in `src/mapper/page-fingerprint.ts` — collects semantic anchors per research.md R3 (document.title, h1-h3, active nav item), applies noise filtering (visibility check, content-length filter, container blacklist for `[role="dialog"]`, `[role="alertdialog"]`, `data-lob-gps-ignore`), applies PII/PHI filtering via regex (emails, phones, "Welcome [Name]"), normalizes (lowercase, collapse whitespace), sorts, joins with `|`, hashes with FNV-1a. Wrap DOM reads in try-catch per FR-010.
- [X] T017 [US3] Implement `generateStateKey(selector, options?)` function in `src/mapper/state-key.ts` — URL mode: `window.location.origin + window.location.pathname + "::" + selector`. Fingerprint mode: calls `generatePageFingerprint()` + `"::" + selector`. Mode determined by `MapperConfig.useFingerprinting`. Returns branded `StateKey` type.
- [X] T018 [US3] Run `bun run test` and verify all T012-T014 tests pass with 100% coverage on `state-key.ts` and `page-fingerprint.ts`

**Checkpoint**: `generateStateKey("#save-btn")` returns `http://localhost:3000/test-pages/messy-app.html::#save-btn`. Fingerprint mode produces stable 8-hex-char prefix. 3 distinct StateKeys for the messy-app workflow.

---

## Phase 5: User Story 4 — DOM Observation (Priority: P2)

**Goal**: Observe host DOM for meaningful state changes (structural additions/removals of interactive elements, visibility toggles on containers with interactive children) via MutationObserver. Emit `StateChangeEvent` objects with correct StateKeys. Debounce within animation frame.

**Independent Test**: Load `messy-app.html`, click Save, verify the mapper detects `.dynamic-list` becoming visible and emits a `state-change` event with the correct new StateKey.

### Tests for US4

> **Write these tests FIRST. Ensure they FAIL before implementation.**

- [X] T019 [US4] Write unit tests in `src/mapper/dom-observer.test.ts` covering all acceptance scenarios: (1) hidden element becomes visible with interactive children → emits `state-change` with trigger `VISIBILITY`, (2) noise div inserted (non-interactive) → no event emitted, (3) scroll alone → no event emitted, (4) `teardown()` → all observers disconnected, zero events after teardown, (5) MutationObserver callback error → caught and silenced, host app unaffected, (6) rapid-fire mutations coalesced into single event within one rAF, (7) `StateChangeEvent` contains correct `previousStateKey`, `newStateKey`, `trigger`, and `timestamp`

### Implementation for US4

- [X] T020 [US4] Implement `DomObserver` class in `src/mapper/dom-observer.ts` — two-observer architecture per research.md R4: structural observer on `document.body` (`childList: true, subtree: true`) for element additions/removals, and targeted attribute observers (`attributeFilter: ['style', 'class', 'hidden']`) for visibility changes on containers. Capture native `MutationObserver` and `requestAnimationFrame` references at module load time.
- [X] T021 [US4] Implement rAF-based debouncing in `src/mapper/dom-observer.ts` — accumulate `MutationRecord[]` in pending array, schedule `requestAnimationFrame` on first record, swap pending array before processing in rAF callback. Filter mutations: (1) for childList, check if added/removed nodes contain interactive elements (`button`, `a`, `input`, `select`, `textarea`, `[role="button"]`), (2) for attribute changes, check `getComputedStyle(el).display` to determine visibility toggle, verify container is a grouping tag (`div`, `section`, etc. per FR-007) and has interactive children within 3 levels. Guard with `element.isConnected`. Wrap in try-catch per FR-010.
- [X] T022 [US4] Implement event emission and `teardown()` in `src/mapper/dom-observer.ts` — `on(event, callback)` and `off(event, callback)` for `state-change` events. `teardown()`: disconnect all MutationObservers, `cancelAnimationFrame` for pending rAF, clear pending array, set `disposed` flag, clear callback list. Idempotent. Generate `StateChangeEvent` using `generateStateKey` for previous and new states.
- [X] T023 [US4] Run `bun run test` and verify all T019 tests pass with 100% coverage on `dom-observer.ts`

**Checkpoint**: After teardown, zero event emissions. Noise divs don't trigger events. Visibility toggles on containers with interactive children emit correct `StateChangeEvent`.

---

## Phase 6: Integration & Polish

**Purpose**: Wire everything together in the Mapper class, add e2e tests, validate build output.

- [ ] T024 Implement `Mapper` class in `src/mapper/index.ts` implementing `IMapper` interface — constructor accepts `MapperConfig`, compiles regex patterns (throws on invalid), initializes internal state. Delegates to: `generateSelector()` → `selector-generator.ts`, `generateStateKey()` → `state-key.ts`, `observe()` → creates `DomObserver`, `on()`/`off()` → event forwarding, `teardown()` → disposes observer + sets disposed flag. Lifecycle states: Created → Ready → Observing → Disposed per data-model.md.
- [ ] T025 Write unit tests for `Mapper` class in `src/mapper/index.test.ts` — (1) construction with default config, (2) construction with custom config (allowlist/denylist/fingerprinting), (3) invalid regex in config throws, (4) `generateSelector` delegates correctly, (5) `generateStateKey} delegates correctly, (6) `observe()` starts observation, (7) double `observe()` is a no-op, (8) `teardown()` is idempotent, (9) methods no-op after teardown
- [ ] T026 Update `src/index.ts` to export the full public API: `Mapper` class, all types (`SelectorResult`, `SelectorTier`, `StateKey`, `StateChangeEvent`, `MapperConfig`, `NormalizedSelector`, `StateChangeTrigger`), and utility functions (`isDynamicId`, `resolveSelector`)
- [ ] T027 Write Playwright e2e tests in `test/e2e/mapper.spec.ts` against `messy-app.html`: (1) SC-001: all interactive elements produce selectors that survive page reload, (2) SC-002: `#ember-id-7721-a` classified as dynamic in 100% of runs, (3) SC-003: multi-step workflow produces 3 distinct StateKeys, (4) SC-004: injected noise divs don't alter StateKeys, (5) SC-005: selector generation <5ms per element, (6) SC-007: teardown stops all event emissions
- [ ] T028 Run `bun run build` and verify tsup produces `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` with all public types exported. Verify `bun run lint` passes.
- [ ] T029 Run full test suite: `bun run test` (all unit tests pass) and `bun run test:e2e` (all Playwright tests pass across Chromium, Firefox, WebKit)

**Checkpoint**: All 7 success criteria (SC-001 through SC-007) validated. Build produces clean output. Type check passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US2 — Dynamic ID Detection)**: Depends on Phase 1 (needs types.ts)
- **Phase 3 (US1 — Selector Generation)**: Depends on Phase 2 (calls `isDynamicId`)
- **Phase 4 (US3 — StateKey Generation)**: Depends on Phase 1 (needs types.ts). Can run in parallel with Phase 2 and Phase 3 since it only depends on selector *types*, not implementation.
- **Phase 5 (US4 — DOM Observation)**: Depends on Phase 4 (uses `generateStateKey`)
- **Phase 6 (Integration)**: Depends on all previous phases

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ├──> Phase 2 (US2: Dynamic ID Detection)
    │        │
    │        └──> Phase 3 (US1: Selector Generation)
    │                 │
    │                 └──> Phase 6 (Integration)
    │
    └──> Phase 4 (US3: StateKey Generation) ←── can start after Phase 1
             │
             └──> Phase 5 (US4: DOM Observation)
                      │
                      └──> Phase 6 (Integration)
```

### Parallel Opportunities Within Phases

**Phase 4 (US3)**: T012, T013, T014 can all run in parallel (different test files). T015 can run in parallel with T016 prep.

**Phase 4 can overlap with Phases 2-3**: Since US3 only needs types from Phase 1, its tests (T012-T014) and pure functions (T015) can be written while US2/US1 implementation proceeds.

---

## Parallel Example: Phase 4 (US3)

```bash
# Launch all US3 tests in parallel:
Task: "T012 — FNV-1a hash tests in src/mapper/page-fingerprint.test.ts"
Task: "T013 — Fingerprint generation tests in src/mapper/page-fingerprint.test.ts"
Task: "T014 — StateKey generation tests in src/mapper/state-key.test.ts"

# Launch pure function implementation in parallel:
Task: "T015 — FNV-1a hash in src/mapper/page-fingerprint.ts"
```

---

## Implementation Strategy

### MVP First (User Story 2 + User Story 1)

1. Complete Phase 1: Setup (types.ts, directory structure)
2. Complete Phase 2: US2 — Dynamic ID Detection (test-first → implement → verify)
3. Complete Phase 3: US1 — Selector Generation (test-first → implement → verify)
4. **STOP and VALIDATE**: Generate selectors for all `messy-app.html` interactive elements and verify they survive reload
5. This MVP delivers the core value: stable selectors that don't break

### Incremental Delivery

1. Setup + US2 + US1 → Stable selector generation (MVP)
2. Add US3 → StateKey generation with URL and fingerprint modes
3. Add US4 → DOM observation with state-change events
4. Integration → Mapper class, e2e tests, build validation
5. Each phase adds independently testable capability

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps tasks to specific user stories for traceability
- Constitution §IX mandates test-first: write tests, verify they fail, then implement
- All DOM reads wrapped in try-catch (FR-010) — this applies to every implementation task
- All selectors must be read-only (FR-011) — no DOM mutations in any implementation
- Performance budget: <5ms per selector (FR-013) — benchmark in T027
- Commit after each task or logical group
